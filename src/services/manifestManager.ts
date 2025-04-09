import fs from 'fs/promises';
import path from 'path';

const MANIFEST_FILE_PATH = path.join(process.cwd(), 'cache', 'jsonWorldComponentContentPaths.json');

export const loadSavedManifest = async () => {
    try {
        const data = await fs.readFile(MANIFEST_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return null;
    }
};

export const saveManifest = async (contentPaths) => {
    try {
        await fs.mkdir(path.dirname(MANIFEST_FILE_PATH), { recursive: true });
        await fs.writeFile(MANIFEST_FILE_PATH, JSON.stringify(contentPaths, null, 2), 'utf8');
    } catch (err) {
        console.error('Error al guardar el manifiesto:', err);
    }
};

export const hasManifestChanged = async (currentPaths) => {
    const savedPaths = await loadSavedManifest();
    return JSON.stringify(currentPaths) !== JSON.stringify(savedPaths);
};

export const fetchJsonWorldComponentContentPaths = async () => {
    const apiKey = process.env.BUNGIE_API_KEY;
    const response = await fetch('https://www.bungie.net/Platform/Destiny2/Manifest/', {
        headers: {
            'X-API-Key': apiKey,
        },
    });

    if (!response.ok) {
        throw new Error(`Error al obtener el manifiesto: ${response.status}`);
    }

    const data = await response.json();
    return data?.Response?.jsonWorldComponentContentPaths?.['es-mx'];
};