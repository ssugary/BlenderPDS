/**
 * The only contract the framework asks of a host application's projection: turn the changes a
 * document reported into whatever the host draws. The core never creates meshes, never knows what
 * a "geometry" is, and never reaches into three.js scene nodes itself.
 */
export interface Projector<TChange> {
    apply(changes: readonly TChange[]): void;
    dispose?(): void;
}
//# sourceMappingURL=Projector.d.ts.map