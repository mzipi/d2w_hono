import { getDefinition } from '../utils/definitionAccessor.ts';
import formatResponse from '../formatters/responseFormatter.ts';
import {
    processInventoryItems,
    searchTraitHash,
    findWeaponsByTraits,
    findPlugSetsByWeapon,
    findPlugItemByPlugSet,
    filterValidMasterworksFromWeapons,
    filterCollectibles,
    filterDamageTypes,
    filterequipmentSlot,
    filterBreakerTypes,
    findWeaponsByCategory,
    filterItemPresentation,
    filterStatGroupHashes
} from '../helpers/helpers.ts';

export default async function main(trait1, trait2) {
    const plugSets = await getDefinition('DestinyPlugSetDefinition');
    const { weapons, perks } = await processInventoryItems();
    const traitHash1 = await searchTraitHash(trait1, perks);
    const traitHash2 = await searchTraitHash(trait2, perks);
    const weaponsFound = await findWeaponsByTraits(traitHash1, traitHash2, weapons, plugSets);
    const plugSetsFound = await findPlugSetsByWeapon(weaponsFound, plugSets);
    const plugItemFound = await findPlugItemByPlugSet(plugSetsFound, perks);
    const masterWorks = await filterValidMasterworksFromWeapons(weaponsFound, plugSetsFound, plugItemFound);
    const collectiblesFound = await filterCollectibles(weaponsFound);
    const damageTypesFound = await filterDamageTypes(weaponsFound);
    const equipmentSlotFound = await filterequipmentSlot(weaponsFound);
    const breakerTypeFound = await filterBreakerTypes(weaponsFound);
    const categoriesFound = await findWeaponsByCategory(weaponsFound);
    const ammoFound = await filterItemPresentation(collectiblesFound);
    const statGroupFound = await filterStatGroupHashes(weaponsFound);

    const formattedResponse = formatResponse({
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
    });

    return formattedResponse;
}