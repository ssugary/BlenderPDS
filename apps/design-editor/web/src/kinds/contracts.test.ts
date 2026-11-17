import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BaseOperation } from '@collab3d/core';
import { editorKinds } from './index';

/**
 * The client half of the shared contract: this test and the backend's JUnit test read the SAME
 * `contracts/design-editor/*.cases.json` files, so a change to what the browser accepts cannot
 * land without the server agreeing (and the other way around).
 */
const CONTRACTS = resolve(process.cwd(), '../../../contracts/design-editor');

interface ContractCase
{
    description?: string;
    reason?: string;
    operation: BaseOperation & Record<string, unknown>;
}

interface ContractFile
{
    kind: string;
    valid: ContractCase[];
    invalid: ContractCase[];
}

const files = readdirSync(CONTRACTS).filter((name) => name.endsWith('.cases.json'));
const registry = editorKinds();

describe('contratos de kind do editor', () => {
    it('há um arquivo de casos para cada kind registrado', () => {
        expect(files.length).toBe(registry.kinds().length);
    });

    for (const file of files)
    {
        const contract = JSON.parse(readFileSync(join(CONTRACTS, file), 'utf8')) as ContractFile;
        const definition = registry.get(contract.kind);

        describe(`${contract.kind} (${file})`, () => {
            it('o kind está registrado no cliente', () => {
                expect(definition).toBeDefined();
                expect(definition?.kind).toBe(contract.kind);
            });

            for (const entry of contract.valid)
            {
                it(`aceita: ${entry.description ?? 'caso válido'}`, () => {
                    expect(definition?.validate(entry.operation)).toBe(true);
                });
            }

            for (const entry of contract.invalid)
            {
                it(`recusa: ${entry.reason ?? 'caso inválido'}`, () => {
                    expect(definition?.validate(entry.operation)).toBe(false);
                });
            }
        });
    }
});
