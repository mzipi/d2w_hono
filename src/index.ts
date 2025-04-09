import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { router as apiRoutes } from './routes/api.ts'
import { processManifest } from './services/processManifest.ts'

const app = new Hono()

if (process.env.NODE_ENV !== 'production') {
    await processManifest();
}

app.route('/api', apiRoutes);

serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})
