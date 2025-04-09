const DEFINITIONS_TO_SAVE = [
    'DestinyInventoryItemDefinition',
    'DestinyPlugSetDefinition',
    'DestinyCollectibleDefinition',
    'DestinyDamageTypeDefinition',
    'DestinyEquipmentSlotDefinition',
    'DestinyBreakerTypeDefinition',
    'DestinyStatDefinition',
    'DestinyStatGroupDefinition',
    'DestinyItemCategoryDefinition',
    'DestinyPresentationNodeDefinition'
];

const downloadDefinition = async (definitionName, relativeUrl) => {
    const fullUrl = `https://www.bungie.net${relativeUrl}`;
    const res = await fetch(fullUrl);
    if (!res.ok) throw new Error(`Error descargando ${definitionName}: ${res.status}`);
    return await res.json();
};

export const fetchDefinitions = async (paths) => {
    const filtered = Object.entries(paths).filter(([name]) => DEFINITIONS_TO_SAVE.includes(name));

    const result = {};
    for (const [name, url] of filtered) {
        try {
            result[name] = await downloadDefinition(name, url);
        } catch (err) {
            console.warn(`Falló ${name}:`, err.message);
        }
    }

    return result;
};
