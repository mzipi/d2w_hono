import { getDefinition } from '../utils/definitionAccessor.ts';
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
    const statGroupFound = filterStatGroupHashes(weaponsFound);

    // const response = filterWeaponData(*);
}

// async function filterWeaponData(enrichedWeapons) {
//     return enrichedWeapons.map(item => ({
//         itemType: item.itemType,
//         inventory: { tierTypeName: item.inventory?.tierTypeName },
//         displayProperties: {
//             name: item.displayProperties?.name,
//             icon: `https://www.bungie.net${item.displayProperties.icon}`
//         },
//         iconWatermark: `https://www.bungie.net${item.iconWatermark}`,
//         sockets: item.sockets
//             ? {
//                 socketEntries: item.sockets.socketEntries.map(socket => {
//                     const selectedPlugSet = socket.randomizedPlugSet ?? socket.reusablePlugSet;

//                     if (!selectedPlugSet) return undefined;

//                     return {
//                         traits: selectedPlugSet.reusablePlugItems
//                             .map(plugItem => {
//                                 if (!plugItem?.plugItem || !plugItem.plugItem.displayProperties) return null;

//                                 return {
//                                     plugItem: {
//                                         displayProperties: {
//                                             name: plugItem.plugItem.displayProperties.name || "Nombre no disponible",
//                                             icon: plugItem.plugItem.displayProperties.icon
//                                                 ? `https://www.bungie.net${plugItem.plugItem.displayProperties.icon}`
//                                                 : null,
//                                             description: plugItem.plugItem.displayProperties.description || "",
//                                         },
//                                         itemTypeDisplayName: plugItem.plugItem.itemTypeDisplayName || "Tipo Desconocido",
//                                     },
//                                 };
//                             })
//                             .filter(Boolean),

//                     };
//                 }).filter(Boolean),
//             }
//             : undefined,
//         collectible: {
//             displayProperties: {
//                 icon: `https://www.bungie.net${item.collectible?.displayProperties.icon}`
//             },
//             sourceString: item.collectible?.sourceString
//         },
//         screenshot: item.screenshot,
//         itemTypeDisplayName: item.itemTypeDisplayName,
//         flavorText: item.flavorText,
//         stats: {
//             statGroupHash: item.stats?.statGroupHash,
//             stats: item.stats?.stats
//         },
//         equippingBlock: {
//             equipmentSlotTypeHash: item.equippingBlock?.equipmentSlotTypeHash,
//             ammoType: item.equippingBlock?.ammoType
//         },
//         itemCategoryHashes: item.itemCategoryHashes,
//         damageTypeHashes: item.damageTypeHashes,
//         hash: item.hash,
//     }));
// }