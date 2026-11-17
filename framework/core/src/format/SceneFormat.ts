/** What a parsed file brings in, in the format's own terms; the app decides what to make of it. */
export interface ImportedObject
{
    name: string;
    /** Column-major 4x4 matrix, already flattened. */
    matrix: number[];
    /** Something the application can turn into a mesh: a primitive name or a serialized geometry. */
    geometry: string;
}

/**
 * One file format the application can read. The core only routes by extension and never parses
 * anything itself: OBJ lives in the app, and another app can register its own format.
 */
export interface SceneFormat
{
    readonly name: string;
    readonly extensions: readonly string[];
    parse(contents: string): ImportedObject[];
}

export class SceneFormatRegistry
{
    private readonly formats = new Map<string, SceneFormat>();

    public register(format: SceneFormat): this
    {
        for (const extension of format.extensions)
        {
            const key = extension.toLowerCase();
            if (this.formats.has(key))
                throw new Error(`Scene format already registered for .${key}`);
            this.formats.set(key, format);
        }
        return this;
    }

    public forExtension(extension: string): SceneFormat | undefined
    {
        return this.formats.get(extension.replace(/^\./, '').toLowerCase());
    }

    public names(): string[]
    {
        return [...new Set([...this.formats.values()].map((format) => format.name))];
    }
}
