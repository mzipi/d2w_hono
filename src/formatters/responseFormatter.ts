export default function formatResponse(data) {
    const {
        weaponsFound,
        plugSetsFound,
        plugItemFound,
        collectiblesFound,
        damageTypesFound,
        equipmentSlotFound,
        breakerTypeFound,
        categoriesFound,
        ammoFound,
        statGroupFound,
    } = data;


    const enrichedWeapons = {};

    const ammoTypeMap = {
        0: "Ninguna",
        1: "Primaria",
        2: "Especial",
        3: "Pesada",
        4: "Desconocida",
    };

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

        const perks = []

        for (const socketEntry of weapon.sockets.socketEntries) {
            const plugSetHash = socketEntry.randomizedPlugSetHash || socketEntry.reusablePlugSetHash

            if (!plugSetHash) continue

            const plugSet = plugSetsFound[plugSetHash]

            if (!plugSet || !plugSet.reusablePlugItems) continue

            for (const plug of plugSet.reusablePlugItems) {
                const plugItem = plugItemFound[plug.plugItemHash]

                if (plugItem) {
                    perks.push(plugItem)
                }
            }
        }

        console.log(perks);
        

        enrichedWeapons[hash] = {
            weapon: { ...weapon },
            collectible,
            damageType,
            equipmentSlot,
            breakerType,
            categories,
            ammo,
            stats,
            perks
        };
    }

    return enrichedWeapons;
}