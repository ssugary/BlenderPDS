/** What a parsed file brings in, in the format's own terms; the app decides what to make of it. */
export interface ImportedObject {
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
export interface SceneFormat {
    readonly name: string;
    readonly extensions: readonly string[];
    parse(contents: string): ImportedObject[];
}
export declare class SceneFormatRegistry {
    private readonly formats;
    register(format: SceneFormat): this;
    forExtension(extension: string): SceneFormat | undefined;
    names(): string[];
}
//# sourceMappingURL=SceneFormat.d.ts.map