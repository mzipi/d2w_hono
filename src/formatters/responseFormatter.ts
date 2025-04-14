export default function formatResponse(data) {
    const {
        weaponsFound,
        plugSetsFound,
        plugItemFound,
        masterWorks,
        collectiblesFound,
        damageTypesFound,
        equipmentSlotFound,
        breakerTypeFound,
        categoriesFound,
        ammoFound,
        statGroupFound,
    } = data;

    const enrichedWeapons = {};

    for (const hash in weaponsFound) {
        const weapon = weaponsFound[hash];

        let collectible;

        if (weapon.collectibleHash !== undefined) {
            collectible = collectiblesFound[weapon.collectibleHash];
        }

        const damageType = damageTypesFound[weapon.defaultDamageTypeHash];
        const equipmentSlot = equipmentSlotFound[weapon.equippingBlock.equipmentSlotTypeHash];
        const breakerType = breakerTypeFound[weapon.breakerTypeHash];

        const categories = [];
        for (const categoryHash of weapon.itemCategoryHashes || []) {
            const category = categoriesFound[categoryHash];
            if (category) {
                categories.push(category);
            }
        }

        let ammo;

        const ammoType = weapon.equippingBlock.ammoType;

        if (ammoType === 1) {
            ammo = ammoFound[1731162900];
        } else if (ammoType === 2) {
            ammo = ammoFound[638914517];
        } else if (ammoType === 3) {
            ammo = ammoFound[3686962409];
        } else {
            ammo = null;
        }

        const stats = [];

        Object.keys(weapon.stats.stats).forEach(key => {
            if (statGroupFound[key]) {
                stats.push({
                    name: statGroupFound[key].displayProperties.name,
                    description: statGroupFound[key].displayProperties.description,
                    value: weapon.stats.stats[key].value
                });
            }
        });

        const perks = [];
        const mods = [];
        const masterworks = [];
        const intrinsic = [];
        const deepsight = [];
        const levelBoost = [];

        const perkIndices = [1, 2, 3, 4, 8];
        const modsIndex = 6;
        const masterworksIndex = 7;
        const intrinsicIndex = 0;
        const deepsightIndex = 12;
        const levelBoostIndex = 13;

        const processSocket = (index, targetArray, markAsMod) => {
            const socketEntry = weapon.sockets.socketEntries[index];
            if (!socketEntry) {
                return;
            }

            const plugSetHash = socketEntry.randomizedPlugSetHash || socketEntry.reusablePlugSetHash;
            const plugSet = plugSetsFound[plugSetHash];

            const list = [];

            if (plugSet && plugSet.reusablePlugItems) {
                for (const plug of plugSet.reusablePlugItems) {
                    const plugItem = plugItemFound[plug.plugItemHash];
                    if (!plugItem) {
                        continue;
                    }

                    if (index === 7) {
                        const validHashes = new Set((masterWorks || []).map(mw => mw.hash));
                        if (!validHashes.has(plugItem.hash)) {
                            continue;
                        }
                    }

                    if (markAsMod) {
                        plugItem.wrappedInDiv = true;
                    }

                    list.push(plugItem);
                }
            }

            targetArray.push(list);
        };

        const validMasterworks = masterWorks[hash] || [];

        validMasterworks.forEach(masterwork => {
            const weaponStats = Object.keys(weapon.stats.stats);
            const isValidMasterwork = masterwork.investmentStats?.some(stat =>
                weaponStats.includes(String(stat.statTypeHash))
            );

            if (isValidMasterwork) {
                masterworks.push(masterwork);
            }
        });

        for (const index of perkIndices) {
            processSocket(index, perks, false);
        }

        processSocket(masterworksIndex, masterworks, true);
        processSocket(modsIndex, mods, true);
        processSocket(intrinsicIndex, intrinsic, true);
        processSocket(deepsightIndex, deepsight, true);
        processSocket(levelBoostIndex, levelBoost, true);

        enrichedWeapons[hash] = {
            weapon: { ...weapon },
            collectible,
            damageType,
            equipmentSlot,
            breakerType,
            categories,
            ammo,
            stats,
            sockets: {
                perks,
                mods,
                masterworks,
                intrinsic,
                deepsight,
                levelBoost
            }
        };
    }

    return enrichedWeapons;
}