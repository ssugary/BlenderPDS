/**
 * UUID v4 that also works outside a secure context.
 *
 * `crypto.randomUUID` only exists on HTTPS and localhost. Opening the dev server from
 * another machine on the LAN (`http://192.168.x.x:5173`) is a perfectly normal thing to
 * do here, and there `crypto.randomUUID` is undefined — calling it throws
 * "crypto.randomUUID is not a function" and takes whatever was creating the id with it
 * (a replica needs a site id, an object needs an object id).
 *
 * `crypto.getRandomValues` has no such restriction, so the fallback is still random
 * (and still a well-formed v4); `Math.random` is the last resort for a browser with no
 * `crypto` at all. The ids are only compared for uniqueness, never as a security token.
 */
export function uuid(): string
{
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        return crypto.randomUUID();

    const bytes = new Uint8Array(16);

    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function')
        crypto.getRandomValues(bytes);
    else
        for (let i = 0; i < bytes.length; i++)
            bytes[i] = Math.floor(Math.random() * 256);

    // RFC 4122: version 4 in the high nibble of byte 6, variant 10xx in byte 8.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
