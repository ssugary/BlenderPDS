import { SceneFormatRegistry } from '@collab3d/core';
import { objFormat } from './objFormat';

/** The formats this application can read. The core only routes by extension. */
export const sceneFormats = new SceneFormatRegistry().register(objFormat);
