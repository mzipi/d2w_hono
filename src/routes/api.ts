import main from "../services/mainService.ts";
import { Hono } from 'hono'

export const router = new Hono();

router.get("/", async (c) => {
    try {
        const { trait1, trait2, page } = c.req.query();
        
        if (!trait1 || !trait2) {
            return c.json({ error: "Falta información" });
        }

        const currentPage = Number(page) || 1;

        const response = await main(trait1, trait2, currentPage);

        return c.json(response);
    } catch (error) {
        console.error("Error detallado:", error);
        return c.json({ error: "Error al procesar la solicitud" });
    }
});