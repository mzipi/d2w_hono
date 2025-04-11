import { filterStatGroupHashes, filterItemPresentation, findPlugSetsByWeapon, findPlugItemByPlugSet } from "../helpers/helpers.ts"

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

    for (const hash in weaponsFound) {
        const weapon = weaponsFound[hash];

        const collectible = collectiblesFound[weapon.collectibleHash];
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

        enrichedWeapons[hash] = {
            weapon: { ...weapon },
            collectible,
            damageType,
            equipmentSlot,
            breakerType,
            categories
        };
    }

    return enrichedWeapons;
}