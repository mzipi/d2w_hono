import {
    fetchJsonWorldComponentContentPaths,
    hasManifestChanged,
    saveManifest
} from './manifestManager.ts';
import { fetchDefinitions } from './definitionFetcher.ts';
import { saveDefinitionsToDisk } from './saveToDisk.ts';
import { saveDefinitionsToMemory } from './inMemoryDefinitions.ts';

export const processManifest = async () => {
    console.log('NODE_ENV:', process.env.NODE_ENV);

    const currentPaths = await fetchJsonWorldComponentContentPaths();
    if (!currentPaths) {
        console.error('No se pudo obtener el manifiesto');
        return;
    }

    const definitions = await fetchDefinitions(currentPaths);

    if (process.env.NODE_ENV === 'development') {
        console.log('Entrando en desarrollo. Guardando definiciones en disco...');
        
        const changed = await hasManifestChanged(currentPaths);

        if (!changed) {
            console.log('El manifiesto no ha cambiado. Nada que hacer.');
            return;
        } else {
            console.log('El manifiesto cambió. Guardando definiciones en disco...');
            await saveManifest(currentPaths);
            await saveDefinitionsToDisk(definitions);
        }
    } else {
        console.log("Entrando en producción. Guardando definiciones en memoria...");
        await saveDefinitionsToMemory(definitions);
    }
};