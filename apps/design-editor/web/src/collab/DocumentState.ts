import { DocumentState as CoreDocumentState } from '@collab3d/core';
import { editorKinds } from '../kinds';
import { Change } from '../kinds';
import { Operation } from './Operation';

export type { Change } from '../kinds';

/** The editor's view of the generic CRDT: its own operation union and change union. */
export type EditorDocumentState = CoreDocumentState<Change>;

export function createDocumentState(): EditorDocumentState
{
    return new CoreDocumentState(editorKinds());
}

/** Rebuild a state from a log prefix (the timeline does this on a scratch instance). */
export function replayDocumentState(ops: readonly Operation[]): EditorDocumentState
{
    return CoreDocumentState.replay<Change>(ops, editorKinds());
}
