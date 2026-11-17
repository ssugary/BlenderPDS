import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/** Size, in screen pixels, of each "big pixel". Bigger = chunkier. */
const PIXEL_SIZE = 6;

/** Must match the lobby's background colour (see rootStyle in Lobby.tsx). */
const BACKGROUND_COLOR = '#1f1f24';

const CUBE_COLOR = '#1f1f24';
const EDGE_COLOR = 0xffffff;
const EDGE_THICKNESS = 0.07;

const CAMERA_DISTANCE = 6;
const CAMERA_FOV = 45;

/** Spring that pulls the cube back to the centre once it is released. */
const SPRING_STIFFNESS = 45;
const SPRING_DAMPING = 2 * Math.sqrt(SPRING_STIFFNESS) * 0.7; // a bit under critical: a small, soft overshoot

const IDLE_SPIN = { x: 0.25, y: 0.45 }; // rad/s while nobody is touching the cube
const SPIN_RECOVERY = 2.5;              // how fast a thrown spin settles back to the idle spin
const DRAG_ROTATION = 0.012;            // rad per screen pixel dragged
const MAX_OFFSET = 0.8;                 // fraction of the visible half-size the cube may be dragged to

/**
 * A pixelated, draggable cube for the lobby background.
 *
 * The pixel look comes from three's RenderPixelatedPass (the PixelationShader family): it renders
 * the scene at 1/PIXEL_SIZE resolution and draws outlines from depth and normal edges.
 * Dragging moves and spins the cube; on release a damped spring brings it back to the centre.
 */
export function LobbyCube()
{
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() =>
    {
        const container = containerRef.current;
        if (!container)
            return;

        const renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setPixelRatio(1);
        const canvas = renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        container.appendChild(canvas);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(BACKGROUND_COLOR);

        const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
        camera.position.z = CAMERA_DISTANCE;

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const sun = new THREE.DirectionalLight(0xffffff, 2.2);
        sun.position.set(3, 4, 5);
        scene.add(sun);

        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({color: CUBE_COLOR});
        const cube = new THREE.Mesh(geometry, material);

        const beamLength = 2 + EDGE_THICKNESS; // slightly longer so the corners are filled
        const beamGeometries = [
            new THREE.BoxGeometry(beamLength, EDGE_THICKNESS, EDGE_THICKNESS),
            new THREE.BoxGeometry(EDGE_THICKNESS, beamLength, EDGE_THICKNESS),
            new THREE.BoxGeometry(EDGE_THICKNESS, EDGE_THICKNESS, beamLength)
        ];
        const edgesMaterial = new THREE.MeshBasicMaterial({ color: EDGE_COLOR });
 
        for (let axis = 0; axis < 3; axis++)
        {
            const [first, second] = [0, 1, 2].filter((index) => index !== axis);
 
            for (const a of [-1, 1])
            {
                for (const b of [-1, 1])
                {
                    const beam = new THREE.Mesh(beamGeometries[axis], edgesMaterial);
                    beam.position.setComponent(first, a);
                    beam.position.setComponent(second, b);
                    cube.add(beam);
                }
            }
        }

        cube.rotation.set(0.5, 0.7, 0);
        scene.add(cube);

        // Post-processing: pixelate, then convert to the output colour space.
        const composer = new EffectComposer(renderer);
        const pixelPass = new RenderPixelatedPass(PIXEL_SIZE, scene, camera, {
            normalEdgeStrength: 0.4,
            depthEdgeStrength: 0.5
        });
        composer.addPass(pixelPass);
        composer.addPass(new OutputPass());

        let halfWidth = 1;
        let halfHeight = 1;

        const resize = () =>
        {
            const width = Math.max(1, container.clientWidth);
            const height = Math.max(1, container.clientHeight);

            renderer.setSize(width, height, false);
            composer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            halfHeight = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * CAMERA_DISTANCE;
            halfWidth = halfHeight * camera.aspect;
        };

        const observer = new ResizeObserver(resize);
        observer.observe(container);
        resize();

        let dragging = false;
        let lastPointer = { x: 0, y: 0 };
        let grabOffset = { x: 0, y: 0 };
        const velocity = { x: 0, y: 0 };                         // spring velocity of the position
        const spin = { x: IDLE_SPIN.x, y: IDLE_SPIN.y };         // current angular speed

        const pointerToWorld = (event: PointerEvent) =>
        {
            const rect = container.getBoundingClientRect();
            return {
                x: (((event.clientX - rect.left) / rect.width) * 2 - 1) * halfWidth,
                y: (-((event.clientY - rect.top) / rect.height) * 2 + 1) * halfHeight
            };
        };

        const onPointerDown = (event: PointerEvent) =>
        {
            if (event.button !== 0)
                return;

            dragging = true;
            canvas.setPointerCapture(event.pointerId);
            lastPointer = { x: event.clientX, y: event.clientY };

            const world = pointerToWorld(event);
            grabOffset = { x: world.x - cube.position.x, y: world.y - cube.position.y };
            velocity.x = 0;
            velocity.y = 0;
        };

        const onPointerMove = (event: PointerEvent) =>
        {
            if (!dragging)
                return;

            const dx = event.clientX - lastPointer.x;
            const dy = event.clientY - lastPointer.y;
            lastPointer = { x: event.clientX, y: event.clientY };

            cube.rotation.y += dx * DRAG_ROTATION;
            cube.rotation.x += dy * DRAG_ROTATION;
            // Remember the last drag speed so releasing the cube while moving flicks it.
            spin.y = dx * DRAG_ROTATION * 60;
            spin.x = dy * DRAG_ROTATION * 60;

            const world = pointerToWorld(event);
            cube.position.x = THREE.MathUtils.clamp(world.x - grabOffset.x, -halfWidth * MAX_OFFSET, halfWidth * MAX_OFFSET);
            cube.position.y = THREE.MathUtils.clamp(world.y - grabOffset.y, -halfHeight * MAX_OFFSET, halfHeight * MAX_OFFSET);
        };

        const onPointerUp = (event: PointerEvent) =>
        {
            dragging = false;
            if (canvas.hasPointerCapture(event.pointerId))
                canvas.releasePointerCapture(event.pointerId);
        };

        canvas.style.touchAction = 'none';
        canvas.style.cursor = 'grab';
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);

        let frame = 0;
        let previous = performance.now();

        const tick = (now: number) =>
        {
            frame = requestAnimationFrame(tick);

            const dt = Math.min((now - previous) / 1000, 0.05);
            previous = now;

            if (!dragging)
            {
                // Damped spring towards the centre (0, 0).
                for (const axis of ['x', 'y'] as const)
                {
                    const acceleration = -SPRING_STIFFNESS * cube.position[axis] - SPRING_DAMPING * velocity[axis];
                    velocity[axis] += acceleration * dt;
                    cube.position[axis] += velocity[axis] * dt;
                }

                // A thrown spin fades back into the slow idle rotation.
                const blend = 1 - Math.exp(-SPIN_RECOVERY * dt);
                spin.x += (IDLE_SPIN.x - spin.x) * blend;
                spin.y += (IDLE_SPIN.y - spin.y) * blend;

                cube.rotation.x += spin.x * dt;
                cube.rotation.y += spin.y * dt;
            }

            composer.render();
        };
        frame = requestAnimationFrame(tick);

        return () =>
        {
            cancelAnimationFrame(frame);
            observer.disconnect();
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('pointercancel', onPointerUp);
            pixelPass.dispose();
            composer.dispose();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            canvas.remove();
        };
    }, []);

    return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />;
}