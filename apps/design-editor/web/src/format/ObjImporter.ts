import { ImportedObject } from '@collab3d/core';

import { FileLoader } from '../core/utils/FileLoader';
import { sceneFormats } from './index';

/**
 * Reads the .obj the user picked and returns the parsed meshes, each with its
 * serialized geometry. It no longer touches the scene: the caller commits the import
 * as operations, so it is shared and undoable like any other edit.
 */
export class ObjImporter
{
    /** Resolves to the parsed meshes; an empty list when nothing was chosen or parsing failed. */
    static async readModel(): Promise<ImportedObject[]>
    {
        const format = sceneFormats.forExtension('obj');
        if (!format)
        {
            console.error('No scene format registered for .obj');
            return [];
        }

        try
        {
            const contents = await FileLoader.getfile();
            return contents ? format.parse(contents) : [];
        }
        catch (error)
        {
            console.error('Error loading model: ', error);
            return [];
        }
    }
}
