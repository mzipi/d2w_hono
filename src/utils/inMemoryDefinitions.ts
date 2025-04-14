export let inMemoryDefinitions = {};

export const saveDefinitionsToMemory = (definitions) => {
    inMemoryDefinitions = definitions;
};

export const areDefinitionsReady = () => {
    return Object.keys(inMemoryDefinitions).length > 0;
};