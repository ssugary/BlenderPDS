/** What applying an operation reports back, so SceneProjector only touches what changed. */
export type Change =
    | { type: 'added'; objectId: string }
    | { type: 'removed'; objectId: string }
    | { type: 'transform'; objectId: string }
    | { type: 'color'; objectId: string }
    | { type: 'mesh'; objectId: string };
