import { Hono } from 'hono'
import {
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
    // filterStatGroupHashes,
    // filterStatValues,
    filterWeaponData,
} from "../services/search.ts";

export const router = new Hono();

router.get("/", async (c) => {
    try {
        const { trait1, trait2 } = c.req.query();
        
        if (!trait1 || !trait2) {
            return c.json({ error: "Falta información" });
        }

        const traitHash1 = await searchTraitHash(trait1);
        const traitHash2 = await searchTraitHash(trait2);
        const weaponsFound = await findWeaponsByTraits(traitHash1, traitHash2);
        const plugSetsFound = await findPlugSetsByWeapon(weaponsFound);
        const plugItemFound = await findPlugItemByPlugSet(plugSetsFound);
        const collectiblesFound = await filterCollectibles(weaponsFound);
        const damageTypesFound = await filterDamageTypes(weaponsFound);
        const equipmentSlotFound = await filterequipmentSlot(weaponsFound);
        const breakerTypeFound = await filterBreakerTypes(weaponsFound);
        const categories = await findWeaponsByCategory(weaponsFound);
        const presentation = await filterItemPresentation(collectiblesFound);

        // const statGroupFound = filterStatGroupHashes(weaponsFound, statGroup);
        // const response = filterWeaponData(*);

        return c.json({
            message: `Recibido: perk1=${trait1}, perk2=${trait2}`,
        });
    } catch (error) {
        console.error("Error detallado:", error);
        return c.json({ error: "Error al procesar la solicitud" });
    }
});