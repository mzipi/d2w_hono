import { getDefinition } from '../utils/definitionAccessor.ts';
import formatResponse from '../formatters/responseFormatter.ts';
import {
    processInventoryItems,
    searchTraitHash,
    findWeaponsByTraits,
    findPlugSetsByWeapon,
    findPlugItemByPlugSet,
    filterCollectibles,
    filterDamageTypes,
    filterequipmentSlot,
    filterBreakerTypes,
    findWeaponsByCategory,
    filterItemPresentation,
    filterStatGroupHashes
} from '../helpers/helpers.ts';

export default async function main(trait1, trait2, currentPage) {
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
    const categoriesFound = await findWeaponsByCategory(weaponsFound);
    const ammoFound = await filterItemPresentation(collectiblesFound);
    const statGroupFound = filterStatGroupHashes(weaponsFound);
    const itemsPerPage = 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const formattedResponse = formatResponse({
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
    });
    const weaponKeys = Object.keys(formattedResponse);
    const keysForCurrentPage = weaponKeys.slice(startIndex, endIndex);
    const paginatedWeapons = keysForCurrentPage.reduce((acc, key) => {
        acc[key] = formattedResponse[key];
        return acc;
    }, {});

    return {
        paginatedWeapons,
        total: Object.keys(formattedResponse).length
    };
}