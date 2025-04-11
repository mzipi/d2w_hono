import { getDefinition } from '../utils/definitionAccessor.ts';

export async function processInventoryItems() {
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

    return filteredequipmentSlot;
}

export async function filterBreakerTypes(weaponsFound) {
    const breakerType = await getDefinition('DestinyBreakerTypeDefinition');

    for (const weapon of Object.values(weaponsFound)) {
        if (weapon.breakerTypeHash) {
            return breakerType;
        }
    }

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

    return filteredResult;
}

export async function filterStatGroupHashes(weaponsFound) {
    const statGroup = await getDefinition('DestinyStatGroupDefinition');
    const stats = await getDefinition('DestinyStatDefinition');

    const matchedStats = {}

    for (const weapon of Object.values(weaponsFound)) {
        const statGroupHash = weapon.stats.statGroupHash
        const statGroupData = statGroup[statGroupHash]

        if (!statGroupData) continue

        const statHashesInWeapon = Object.keys(weapon.stats.stats)

        for (const statData of statGroupData.scaledStats) {
            const statHash = statData.statHash.toString()

            if (statHashesInWeapon.includes(statHash) && stats[statHash]) {
                matchedStats[statHash] = stats[statHash]
            }
        }
    }

    return matchedStats
}