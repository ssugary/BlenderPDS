#!/usr/bin/env node
/**
 * Boundary gate: the framework must never depend on an application.
 *
 * `madge` walks the import graph of `framework/` and the script fails if any edge leaves the
 * framework and lands in `apps/` (or if the core reaches into a React kit). This is the gate the
 * plan asks for, in its "madge" flavour: a dependency cycle inside the framework is reported too.
 */
import madge from 'madge';
import { relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const result = await madge(resolve(root, 'framework'), {
    fileExtensions: ['ts', 'tsx'],
    excludeRegExp: [/node_modules/, /dist/],
    tsConfig: resolve(root, 'framework/core/tsconfig.json'),
    detectiveOptions: { ts: { mixedImports: true } }
});

const cycles = result.circular();
const all = Object.values(result.obj()).flat();

const violations = all.filter((file) => {
    const target = String(file);
    return target.startsWith('apps/') || target.startsWith('../apps/');
});

if (cycles.length > 0) {
    console.error('check-boundaries: ciclos dentro do framework:');
    for (const cycle of cycles) {
        console.error(`  ${cycle.join(' -> ')}`);
    }
}

if (violations.length > 0) {
    console.error('check-boundaries: o framework importa uma aplicação:');
    for (const violation of violations) {
        console.error(`  ${relative(root, resolve(root, 'framework', violation))}`);
    }
}

if (cycles.length > 0 || violations.length > 0) {
    process.exit(1);
}

console.log('check-boundaries: framework sem dependências de apps e sem ciclos.');
