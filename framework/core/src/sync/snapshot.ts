/**
 * Canonical JSON and its SHA-256, the browser side of `SnapshotChecksums` (P3.3).
 *
 * Object keys are sorted, arrays keep their order and there is no insignificant
 * whitespace, so this string is byte-identical to the Java canonical form and a checksum
 * produced here validates on the server.
 */

function canonicalValue(value: unknown): string
{
    if (value === null || value === undefined)
        return 'null';

    if (Array.isArray(value))
        return `[${value.map(canonicalValue).join(',')}]`;

    if (typeof value === 'object')
    {
        const entries = Object.entries(value as Record<string, unknown>)
            .filter(([, entry]) => entry !== undefined)
            .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));

        return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalValue(entry)}`).join(',')}}`;
    }

    return JSON.stringify(value);
}

export function canonicalJson(value: unknown): string
{
    return canonicalValue(value);
}

export async function sha256Hex(text: string): Promise<string>
{
    const bytes = new TextEncoder().encode(text);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function checksumOfState(state: unknown): Promise<string>
{
    return sha256Hex(canonicalJson(state));
}
