import main from "../services/mainService.ts";
import { processManifest } from "../utils/processManifest.ts";
import { areDefinitionsReady } from "../utils/inMemoryDefinitions.ts";
import { Hono } from "hono";

let response = null;

export const apiRoutes = (app: Hono) => {
    app.post("/api/search", async (c) => {
        try {
            if (!areDefinitionsReady()) {
                return c.json({ error: "Las definiciones no están disponibles aún." }, 503);
            }

            const { trait1, trait2 } = await c.req.json();

            if (!trait1 || !trait2) {
                return c.json({ error: "Falta información" }, 400);
            }

            response = await main(trait1, trait2);

            return c.json(response);
        } catch (error) {
            console.error("Error detallado:", error);
            return c.json({ error: "Error al procesar la solicitud" }, 500);
        }
    });

    app.get("/api/definitions", async (c) => {
        try {
            if (!areDefinitionsReady()) {
                await processManifest();
            }

            return c.json({ ok: true });
        } catch (error) {
            console.error("Error fetching definitions", error);
            return c.json({ error: "Failed to fetch definitions" }, 500);
        }
    });

    app.get('/api/weapons/:hash', (c) => {
        const { hash } = c.req.param();

        if (!response) {
            return c.json({ error: "No search results available" }, 404);
        }

        let foundWeapon = null;

        for (const key in response) {
            if (response.hasOwnProperty(key)) {
                if (key === hash) {
                    foundWeapon = response[key];
                }
            }
        }

        if (!foundWeapon) {
            return c.json({ error: "Weapon not found" }, 404);
        }

        return c.json(foundWeapon);
    });
};
