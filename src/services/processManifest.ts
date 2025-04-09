import {
    fetchJsonWorldComponentContentPaths,
    hasManifestChanged,
    saveManifest
} from './manifestManager.ts';
import { fetchDefinitions } from './definitionFetcher.ts';
import { saveDefinitionsToDisk } from './saveToDisk.ts';
import { saveDefinitionsToMemory } from './inMemoryDefinitions.ts';

export const processManifest = async () => {
    const currentPaths = await fetchJsonWorldComponentContentPaths();
    if (!currentPaths) {
        console.error('No se pudo obtener el manifiesto');
        return;
    }

    const changed = await hasManifestChanged(currentPaths);
    if (!changed) {
        console.log('El manifiesto no ha cambiado. Nada que hacer.');
        return;
    }

    const definitions = await fetchDefinitions(currentPaths);

    if (process.env.NODE_ENV === 'development') {
        await saveDefinitionsToDisk(definitions);
    } else if (process.env.NODE_ENV === 'production') {
        saveDefinitionsToMemory(definitions);
    }

    await saveManifest(currentPaths);
};
