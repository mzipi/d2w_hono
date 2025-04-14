import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { apiRoutes } from './routes/api.ts'

import dotenv from 'dotenv';

dotenv.config();

const app = new Hono()

app.use('*', (c, next) => {
    console.log(`Petición ${c.req.method} a ${c.req.url}`);
    return next();
});

app.use('*', cors())

// app.use(
//     '*',
//     cors({
//         origin: (origin) => {
//             if (!origin) return false
//             return ['https://midominio.com', 'https://www.midominio.com'].includes(origin)
//         },
//         allowHeaders: ['Content-Type'],
//         allowMethods: ['GET'],
//         maxAge: 86400,
//     })
// )

apiRoutes(app);

serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})