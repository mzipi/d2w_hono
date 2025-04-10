import fs from 'fs/promises';
import path from 'path';

const DEFINITIONS_DIR = path.join(process.cwd(), 'cache', 'definitions');

export const saveDefinitionsToDisk = async (definitions) => {
    try {
        await fs.mkdir(DEFINITIONS_DIR, { recursive: true });
    } catch (err) {
        console.error('No se pudo crear el directorio de definiciones:', err);
        return;
    }

    for (const [name, data] of Object.entries(definitions)) {
        const filePath = path.join(DEFINITIONS_DIR, `${name}.json`);
        try {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Guardado ${name}`);
        } catch (err) {
            console.error(`Error al guardar ${name}:`, err);
        }
    }
};
