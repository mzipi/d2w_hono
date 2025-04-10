import { getDefinition } from './definitionAccessor.ts';

// const stats = await getDefinition('DestinyStatDefinition');
// const statGroup = await getDefinition('DestinyStatGroupDefinition');


export default async function main(trait1, trait2) {
    const plugSets = await getDefinition('DestinyPlugSetDefinition');
    const { weapons, perks } = await processInventoryItems();
    const traitHash1 = await searchTraitHash(trait1, perks);
    const traitHash2 = await searchTraitHash(trait2, perks);
    const weaponsFound = await findWeaponsByTraits(traitHash1, traitHash2, weapons, plugSets);
    const plugSetsFound = await findPlugSetsByWeapon(weaponsFound, plugSets);
    const plugItemFound = await findPlugItemByPlugSet(plugSetsFound, perks);
    const collectiblesFound = await filterCollectibles(weaponsFound);
    const damageTypesFound = await filterDamageTypes(weaponsFound);
    const equipmentSlotFound = await filterequipmentSlot(weaponsFound);
    const breakerTypeFound = await filterBreakerTypes(weaponsFound);
    const categories = await findWeaponsByCategory(weaponsFound);
    const presentation = await filterItemPresentation(collectiblesFound);

    // const statGroupFound = filterStatGroupHashes(weaponsFound, statGroup);
    // const response = filterWeaponData(*);
}

async function processInventoryItems() {
    let weapons = {};
    let perks = {};
    
    const inventoryItems = await getDefinition('DestinyInventoryItemDefinition');

    for (const hash in inventoryItems) {
        const item = inventoryItems[hash];
        if (item.itemType === 3) weapons[hash] = item;
        if (item.itemType === 19) perks[hash] = item;
    }

    return { weapons, perks };
}

export async function searchTraitHash(traitName, perks) {
    const normalizedTraitName = traitName
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();

    const trait = Object.values(perks).find(item =>
        item.displayProperties.name.toLowerCase() === normalizedTraitName &&
        item.itemTypeDisplayName === "Rasgos"
    );

    if(trait.hash) {
        console.log(`${traitName}: ${trait.hash}`);
    }

    return trait.hash;
}

export async function findWeaponsByTraits(traitHash1, traitHash2, weapons, plugSets) {
    const matchingWeapons = {};

    Object.entries(weapons).forEach(([weaponHash, weapon]) => {
        const socketEntry3Hash = weapon.sockets?.socketEntries[3]?.randomizedPlugSetHash;
        const socketEntry4Hash = weapon.sockets?.socketEntries[4]?.randomizedPlugSetHash;
        
        const plugSet3 = plugSets[socketEntry3Hash];
        const plugSet4 = plugSets[socketEntry4Hash];

        const plugItemHashes3 = plugSet3?.reusablePlugItems?.map(item => item.plugItemHash) || [];
        const plugItemHashes4 = plugSet4?.reusablePlugItems?.map(item => item.plugItemHash) || [];

        const isTraitInPlugSet3 = plugItemHashes3.includes(traitHash1);
        const isTraitInPlugSet4 = plugItemHashes4.includes(traitHash1);

        const isTraitInOtherPlugSet3 = plugItemHashes3.includes(traitHash2);
        const isTraitInOtherPlugSet4 = plugItemHashes4.includes(traitHash2);

        if ((isTraitInPlugSet3 && isTraitInOtherPlugSet4) || (isTraitInPlugSet4 && isTraitInOtherPlugSet3)) {
            matchingWeapons[weaponHash] = weapon;
        }
    });

    console.log("Cantidad de armas encontradas:", Object.keys(matchingWeapons).length);

    return matchingWeapons;
}

export async function findPlugSetsByWeapon(weaponsFound, plugSets) {
    const indices = [0, 1, 2, 3, 4, 6, 7, 8];
    const result = {};

    Object.values(weaponsFound).forEach(weapon => {
        const socketEntries = weapon.sockets.socketEntries;

        indices.forEach(index => {
            const plugSetHash = socketEntries[index].reusablePlugSetHash || socketEntries[index].randomizedPlugSetHash;
            if (plugSetHash && plugSets[plugSetHash]) {
                result[plugSetHash] = plugSets[plugSetHash];
            }
        });
    });

    return result;
}

export async function findPlugItemByPlugSet(plugSetsFound, perks) {
    const result = {};

    Object.entries(plugSetsFound).forEach(([plugSetHash, plugSet]) => {
        plugSet.reusablePlugItems.forEach(item => {
            if (perks[item.plugItemHash] && perks[item.plugItemHash].inventory.tierTypeName === "Común") {
                result[item.plugItemHash] = perks[item.plugItemHash];
            }
        });
    });

    return result;
}

export async function filterCollectibles(weaponsFound) {
    const collectibles = await getDefinition('DestinyCollectibleDefinition');

    const collectibleHashes = new Set(
        Object.values(weaponsFound)
            .map(weapon => weapon.collectibleHash)
            .filter(hash => hash !== undefined)
    );

    const filteredCollectibles = Object.entries(collectibles)
        .filter(([hash]) => collectibleHashes.has(Number(hash)))
        .reduce((result, [hash, value]) => {
            result[hash] = value;
            return result;
        }, {});

    console.log("Cantidad de coleccionables encontrados:", Object.keys(filteredCollectibles).length);

    return filteredCollectibles;
}

export async function filterDamageTypes(weaponsFound) {
    const damageType = await getDefinition('DestinyDamageTypeDefinition');

    const damageTypeHashes = Object.values(weaponsFound)
        .map(weapon => weapon.defaultDamageTypeHash)
        .filter(damageTypeHash => damageTypeHash !== undefined);

    const filteredDamageTypes = Object.entries(damageType)
        .filter(([hash]) => damageTypeHashes.includes(Number(hash)))
        .reduce((result, [hash, value]) => {
            result[hash] = value;
            return result;
        }, {});

    console.log("Tipo de daño de las armas encontradas:",
        Object.values(filteredDamageTypes)
            .map(damage => damage.displayProperties?.name)
            .join(", ")
    );

    return filteredDamageTypes;
}

export async function filterequipmentSlot(weaponsFound) {
    const equipmentSlot = await getDefinition('DestinyEquipmentSlotDefinition');
    const filteredequipmentSlot = {};

    for (const weapon of Object.values(weaponsFound)) {
        const slotHash = weapon.equippingBlock.equipmentSlotTypeHash;

        if (equipmentSlot[slotHash]) {
            filteredequipmentSlot[slotHash] = equipmentSlot[slotHash];
        }
    }

    console.log("Slot de las armas encontradas:",
        Object.values(filteredequipmentSlot)
            .map(slot => slot.displayProperties?.name)
            .join(", ")
    );

    return filteredequipmentSlot;
}

export async function filterBreakerTypes(weaponsFound) {
    const breakerType = await getDefinition('DestinyBreakerTypeDefinition');

    for (const weapon of Object.values(weaponsFound)) {
        if (weapon.breakerTypeHash) {
            console.log("Breaker encontrado:", breakerType.displayProperties?.name || "Sin nombre");
            return breakerType;
        }
    }

    console.log("Breaker encontrado: NA");
    return { displayProperties: { name: "NA" } };
}

export async function findWeaponsByCategory(weaponsFound) {
    const itemCategory = await getDefinition('DestinyItemCategoryDefinition');
    const filteredCategories = {};

    Object.values(weaponsFound).forEach(weapon => {
        weapon.itemCategoryHashes.forEach(hash => {
            if (itemCategory[hash]) {
                if (!filteredCategories[hash]) {
                    filteredCategories[hash] = itemCategory[hash];
                }
            }
        });
    });

    console.log("Categorías de las armas encontradas:",
        Object.values(filteredCategories)
            .map(category => category.displayProperties?.name)
            .join(", ")
    );

    return filteredCategories;
}

export async function filterItemPresentation(collectiblesFound) {
    const presentationNode = await getDefinition('DestinyPresentationNodeDefinition');
    let parentNodeHashes = Object.values(collectiblesFound).flatMap(collectible => collectible.parentNodeHashes);
    const result = {};
    const validHashes = new Set([1731162900, 638914517, 3686962409]);

    while (parentNodeHashes.length > 0) {
        const hash = parentNodeHashes.pop();
        if (!hash) continue;

        const node = presentationNode[hash];
        if (node && !result[node.hash]) {
            result[node.hash] = node;
            parentNodeHashes.push(...node.parentNodeHashes);
        }
    }

    const filteredResult = Object.fromEntries(
        Object.entries(result).filter(([hash]) => validHashes.has(Number(hash)))
    );

    console.log("Tipo de munición:", 
        Object.values(filteredResult)
            .map(category => category.displayProperties?.name)
            .join(", ")
    );

    return filteredResult;
}

// export function filterStatGroupHashes(weaponsFound, statGroup) {
//     const statGroupHashes = new Set(
//         weaponsFound.map(weapon => Object.values(weapon.stats))
//     )

//     const statGroupHashes = new Set(
//         weaponsFound
//             .map(weapon => 
//                 Object.values(weapon.stats)
//             )
//             .map(statsArray => statsArray.map(stat => stat.statGroupHash))
//     );

//     return Object.values(statGroup)
//         .filter(group => statGroupHashes.has(group.statGroupHash))
//         .map(group => group);
// }

export const ammoTypeMap = {
    0: "Ninguna",
    1: "Principal",
    2: "Especial",
    3: "Pesada",
    4: "Desconocida"
};

export const findAmmoTypeNameFromNodeDefinition = (ammoTypeId, data) => {
    const ammoTypeNameFromMap = ammoTypeMap[ammoTypeId] || "Desconocido";
    const ammoTypeNode = Object.values(data.DestinyPresentationNodeDefinition).find(item => {
        return item.displayProperties?.name === ammoTypeNameFromMap;
    });

    if (ammoTypeNode) {
        const icon = ammoTypeNode.displayProperties?.icon;
        return icon ? `https://www.bungie.net${icon}` : null;
    }

    return null;
};

export async function filterWeaponData(enrichedWeapons) {
    return enrichedWeapons.map(item => ({
        itemType: item.itemType,
        inventory: { tierTypeName: item.inventory?.tierTypeName },
        displayProperties: {
            name: item.displayProperties?.name,
            icon: `https://www.bungie.net${item.displayProperties.icon}`
        },
        iconWatermark: `https://www.bungie.net${item.iconWatermark}`,
        sockets: item.sockets
            ? {
                socketEntries: item.sockets.socketEntries.map(socket => {
                    const selectedPlugSet = socket.randomizedPlugSet ?? socket.reusablePlugSet;

                    if (!selectedPlugSet) return undefined;

                    return {
                        traits: selectedPlugSet.reusablePlugItems
                            .map(plugItem => {
                                if (!plugItem?.plugItem || !plugItem.plugItem.displayProperties) return null;

                                return {
                                    plugItem: {
                                        displayProperties: {
                                            name: plugItem.plugItem.displayProperties.name || "Nombre no disponible",
                                            icon: plugItem.plugItem.displayProperties.icon
                                                ? `https://www.bungie.net${plugItem.plugItem.displayProperties.icon}`
                                                : null,
                                            description: plugItem.plugItem.displayProperties.description || "",
                                        },
                                        itemTypeDisplayName: plugItem.plugItem.itemTypeDisplayName || "Tipo Desconocido",
                                    },
                                };
                            })
                            .filter(Boolean),

                    };
                }).filter(Boolean),
            }
            : undefined,
        collectible: {
            displayProperties: {
                icon: `https://www.bungie.net${item.collectible?.displayProperties.icon}`
            },
            sourceString: item.collectible?.sourceString
        },
        screenshot: item.screenshot,
        itemTypeDisplayName: item.itemTypeDisplayName,
        flavorText: item.flavorText,
        stats: {
            statGroupHash: item.stats?.statGroupHash,
            stats: item.stats?.stats
        },
        equippingBlock: {
            equipmentSlotTypeHash: item.equippingBlock?.equipmentSlotTypeHash,
            ammoType: item.equippingBlock?.ammoType
        },
        itemCategoryHashes: item.itemCategoryHashes,
        damageTypeHashes: item.damageTypeHashes,
        hash: item.hash,
    }));
}