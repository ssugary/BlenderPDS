/**
 * Splits operations into {@code sync_ops} payloads that respect the operation count AND
 * the encoded size.
 *
 * A text frame above ~8 KB closes the WebSocket (1009), so counting operations is not
 * enough: one serialized mesh is bigger than dozens of primitive creates. The size is
 * measured on the very JSON that goes on the wire; a single operation that does not fit
 * alone is still sent on its own (the server's kind validator is what refuses it).
 */
export function chunkOperations<TOp>(
    operations: readonly TOp[],
    maxOps: number,
    maxFrameBytes: number
): TOp[][]
{
    const opLimit = Math.max(1, maxOps);
    const byteLimit = Math.max(1, maxFrameBytes);
    const frames: TOp[][] = [];
    let current: TOp[] = [];

    const bytes = (batch: TOp[]): number =>
        new TextEncoder().encode(JSON.stringify({ type: 'sync_ops', ops: batch })).length;

    for (const operation of operations)
    {
        current.push(operation);

        if (current.length > opLimit || bytes(current) > byteLimit)
        {
            // The newcomer starts the next frame; keeping it here would overflow.
            current.pop();
            if (current.length > 0)
                frames.push(current);
            current = [operation];
        }
    }

    if (current.length > 0)
        frames.push(current);

    return frames;
}
