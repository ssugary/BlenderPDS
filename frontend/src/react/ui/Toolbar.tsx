import { useState } from 'react';
import { GLOBAL_BUS } from '../../core/EventBus';
import { useBusEvent } from '../useBusEvent';
import { ColorPicker } from './ColorPicker';

const GEOMETRY_OPTIONS = [
    { value: 'cube', label: 'Cube' },
    { value: 'cylinder', label: 'Cylinder' },
    { value: 'torus', label: 'Torus' },
    { value: 'sphere', label: 'Sphere' },
    { value: 'pill', label: 'Pill' }
];

const panelStyle = {
    position: 'absolute' as const,
    top: 10,
    left: 10,
    zIndex: 10,
    background: 'rgba(30, 30, 30, 0.85)',
    padding: 10,
    borderRadius: 6,
    color: '#fff'
};

/**
 * Replaces the old Toolbar, which looked its buttons up by id inside index.html.
 * Every button emits exactly the bus event it used to, so nothing downstream changed.
 */
export function Toolbar()
{
    const [geometry, setGeometry] = useState('');

    useBusEvent('tool:changed', (tool) => console.log(`ferramenta ativa: ${tool}`));
    useBusEvent('editor:mode_changed', (mode) => console.log(`modo do editor: ${mode}`));

    return (
        <div id="ui" style={panelStyle}>
            <select value={geometry} onChange={(event) => setGeometry(event.target.value)}>
                <option value="">Geometries</option>
                {GEOMETRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>

            <button onClick={() => GLOBAL_BUS.emit('action:add_object', { type: geometry })}>add</button>
            <button onClick={() => GLOBAL_BUS.emit('action:delete_object', {})}>Apagar (X)</button>
            <button onClick={() => GLOBAL_BUS.emit('tool:change', 'translate')}>Mover (G)</button>
            <button onClick={() => GLOBAL_BUS.emit('tool:change', 'rotate')}>Rotacionar (R)</button>
            <button onClick={() => GLOBAL_BUS.emit('tool:change', 'scale')}>Escalar (C)</button>
            <ColorPicker />
            <button onClick={() => GLOBAL_BUS.emit('camera:change_mode', undefined)}> Andar </button>
            <button onClick={() => GLOBAL_BUS.emit('tool:change', 'vertex')}> Vertices </button>
            <button onClick={() => GLOBAL_BUS.emit('tool:change', 'face')}> Faces </button>
            <button onClick={() => GLOBAL_BUS.emit('tool:change', 'edge')}> Arestas </button>
            <button onClick={() => GLOBAL_BUS.emit('editor:toggle_mode', undefined)}> Modo de Edição </button>
            <button onClick={() => GLOBAL_BUS.emit('action:add_object', { type: 'model' })}>+ Modelo</button>
            <button onClick={() => GLOBAL_BUS.emit('action:export_model', undefined)}>Exportar Modelo</button>
        </div>
    );
}