import { Hono } from 'hono'
import main from "../services/mainService.ts";

export const router = new Hono();

router.get("/", async (c) => {
    try {
        const { trait1, trait2 } = c.req.query();
        
        if (!trait1 || !trait2) {
            return c.json({ error: "Falta información" });
        }

        const result = await main(trait1, trait2);

        return c.json({
            message: `Recibido: perk1=${trait1}, perk2=${trait2}`,
        });
    } catch (error) {
        console.error("Error detallado:", error);
        return c.json({ error: "Error al procesar la solicitud" });
    }
});