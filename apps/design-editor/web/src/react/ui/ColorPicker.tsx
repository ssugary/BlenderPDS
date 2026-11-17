import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import * as THREE from 'three';
import { GLOBAL_BUS } from '../../core/EventBus';
import { useBusEvent } from '../useBusEvent';

const WHEEL_SIZE = 160;
const RADIUS = WHEEL_SIZE / 2;

const popoverStyle: CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 6,
    zIndex: 20,
    width: WHEEL_SIZE + 24,
    background: 'rgba(30, 30, 30, 0.95)',
    border: '1px solid #666',
    borderRadius: 6,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
};

interface SelectionInfo
{
    objectId: string | null;
    /** Colour of the selected object as a plain 0xRRGGBB number. */
    color: number | null;
}

/** h in degrees (0-360), s and v in 0-1. Returns r, g, b in 0-255. */
function hsvToRgb(h: number, s: number, v: number): [number, number, number]
{
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function hsvToHex(h: number, s: number, v: number): number
{
    const [r, g, b] = hsvToRgb(h, s, v);
    return (r << 16) | (g << 8) | b;
}

function hexToHsv(hex: number): [number, number, number]
{
    const r = ((hex >> 16) & 255) / 255;
    const g = ((hex >> 8) & 255) / 255;
    const b = (hex & 255) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    if (d !== 0)
    {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h = (h * 60 + 360) % 360;
    }
    return [h, max === 0 ? 0 : d / max, max];
}

function hexToCss(hex: number): string
{
    return `#${hex.toString(16).padStart(6, '0')}`;
}

/**
 * Button + popover with a hue/saturation wheel and a brightness slider.
 *
 * - Only usable while an object is selected in object mode (the Engine announces the selection
 *   with 'selection:changed'). The popover closes by itself when that stops being true.
 * - Dragging previews the colour live on the selected mesh ('action:preview_color'). That is a
 *   local-only view change: nothing enters the log and nothing goes over the network.
 * - Releasing the pointer (or the slider) commits once ('action:change_color'), so one pick is
 *   one op and one undo step.
 */
export function ColorPicker()
{
    const [open, setOpen] = useState(false);
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const [value, setValue] = useState(1);
    const [selection, setSelection] = useState<SelectionInfo>({ objectId: null, color: null });
    const [mode, setMode] = useState('object');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const draggingRef = useRef(false);
    /** True between the first preview of a gesture and its commit, so a plain click commits nothing. */
    const dirtyRef = useRef(false);

    useBusEvent<SelectionInfo>('selection:changed', setSelection);
    useBusEvent<string>('editor:mode_changed', setMode);

    const enabled = selection.objectId !== null && mode === 'object';
    const currentHex = hsvToHex(hue, saturation, value);

    const preview = (hex: number) =>
    {
        dirtyRef.current = true;
        GLOBAL_BUS.emit('action:preview_color', { color: new THREE.Color(hex) });
    };

    const cancelPreview = () =>
    {
        if (!dirtyRef.current)
            return;

        dirtyRef.current = false;
        GLOBAL_BUS.emit('action:preview_color', { color: null });
    };

    const commit = (hex: number) =>
    {
        if (!dirtyRef.current)
            return;

        dirtyRef.current = false;
        GLOBAL_BUS.emit('action:change_color', { color: new THREE.Color(hex) });
    };

    // Selection gone (or edit mode entered): drop any half-done gesture and close the popover.
    useEffect(() =>
    {
        if (enabled)
            return;

        draggingRef.current = false;
        cancelPreview();
        setOpen(false);
    }, [enabled]);

    // The wheel shows the colour of whatever is selected, including after an undo or a remote change.
    useEffect(() =>
    {
        if (selection.color === null || selection.color === hsvToHex(hue, saturation, value))
            return;

        const [h, s, v] = hexToHsv(selection.color);
        setHue(h);
        setSaturation(s);
        setValue(v);
        // Only reacts to the selected object's colour, not to our own hue/saturation/value edits.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection.objectId, selection.color]);

    // Redraws the wheel when it opens or the brightness changes.
    useEffect(() =>
    {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!open || !canvas || !context)
            return;

        const image = context.createImageData(WHEEL_SIZE, WHEEL_SIZE);
        for (let y = 0; y < WHEEL_SIZE; y++)
        {
            for (let x = 0; x < WHEEL_SIZE; x++)
            {
                const dx = x - RADIUS + 0.5;
                const dy = y - RADIUS + 0.5;
                const distance = Math.hypot(dx, dy);
                const index = (y * WHEEL_SIZE + x) * 4;

                if (distance > RADIUS)
                {
                    image.data[index + 3] = 0;
                    continue;
                }

                const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                const [r, g, b] = hsvToRgb((angle + 360) % 360, distance / RADIUS, value);
                image.data[index] = r;
                image.data[index + 1] = g;
                image.data[index + 2] = b;
                image.data[index + 3] = 255;
            }
        }
        context.putImageData(image, 0, 0);
    }, [open, value]);

    /** Hue and saturation under the pointer (clamped to the wheel). */
    const hueSaturationAt = (event: ReactPointerEvent<HTMLCanvasElement>): [number, number] =>
    {
        const rect = event.currentTarget.getBoundingClientRect();
        const dx = event.clientX - rect.left - RADIUS;
        const dy = event.clientY - rect.top - RADIUS;

        return [
            (((Math.atan2(dy, dx) * 180) / Math.PI) + 360) % 360,
            Math.min(Math.hypot(dx, dy), RADIUS) / RADIUS
        ];
    };

    /** Moves the marker, previews the colour on the object and returns it. */
    const pickAt = (event: ReactPointerEvent<HTMLCanvasElement>): number =>
    {
        const [h, s] = hueSaturationAt(event);
        setHue(h);
        setSaturation(s);

        const hex = hsvToHex(h, s, value);
        preview(hex);
        return hex;
    };

    // Marker position follows the current hue/saturation.
    const angle = (hue * Math.PI) / 180;
    const markerX = RADIUS + Math.cos(angle) * saturation * RADIUS;
    const markerY = RADIUS + Math.sin(angle) * saturation * RADIUS;

    return (
        <span style={{ position: 'relative', display: 'inline-block' }}>
            <button
                disabled={!enabled}
                title={enabled ? undefined : 'Selecione um objeto (modo objeto) para mudar a cor'}
                onClick={() => setOpen((isOpen) => !isOpen)}
            >
                <span
                    style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        marginRight: 4,
                        border: '1px solid #fff',
                        background: hexToCss(currentHex)
                    }}
                />
                Cor
            </button>

            {open && enabled && (
                <div style={popoverStyle}>
                    <div style={{ position: 'relative', width: WHEEL_SIZE, height: WHEEL_SIZE }}>
                        <canvas
                            ref={canvasRef}
                            width={WHEEL_SIZE}
                            height={WHEEL_SIZE}
                            style={{ cursor: 'crosshair', touchAction: 'none', display: 'block' }}
                            onPointerDown={(event) =>
                            {
                                draggingRef.current = true;
                                event.currentTarget.setPointerCapture(event.pointerId);
                                pickAt(event);
                            }}
                            onPointerMove={(event) =>
                            {
                                if (draggingRef.current)
                                    pickAt(event);
                            }}
                            onPointerUp={(event) =>
                            {
                                if (!draggingRef.current)
                                    return;

                                draggingRef.current = false;
                                commit(pickAt(event));
                            }}
                            onPointerCancel={() =>
                            {
                                draggingRef.current = false;
                                cancelPreview();
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                left: markerX - 6,
                                top: markerY - 6,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                border: '2px solid #fff',
                                boxShadow: '0 0 2px #000',
                                pointerEvents: 'none'
                            }}
                        />
                    </div>

                    <label style={{ fontSize: 12 }}>
                        Brilho
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={Math.round(value * 100)}
                            style={{ width: '100%' }}
                            onChange={(event) =>
                            {
                                const next = Number(event.target.value) / 100;
                                setValue(next);
                                preview(hsvToHex(hue, saturation, next));
                            }}
                            onPointerUp={() => commit(currentHex)}
                            onKeyUp={() => commit(currentHex)}
                        />
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <span
                            style={{ width: 24, height: 24, border: '1px solid #fff', background: hexToCss(currentHex) }}
                        />
                        <code>{hexToCss(currentHex)}</code>
                    </div>
                </div>
            )}
        </span>
    );
}