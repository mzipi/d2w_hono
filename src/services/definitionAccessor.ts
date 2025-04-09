import { inMemoryDefinitions } from './inMemoryDefinitions.ts';
import fs from 'fs/promises';
import path from 'path';

const DEFINITIONS_DIR = path.join(process.cwd(), 'cache', 'definitions');

export const getDefinition = async (name) => {
    if (process.env.NODE_ENV === 'production') {
        return inMemoryDefinitions[name] || null;
    }

    try {
        const filePath = path.join(DEFINITIONS_DIR, `${name}.json`);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch {
        return null;
    }
};
