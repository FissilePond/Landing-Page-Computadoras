import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

/** DEV: guarda estrellas de la constelación en src/data/constellation.ts */
function saveConstellationPlugin(): Plugin {
  return {
    name: 'save-constellation',
    configureServer(server) {
      server.middlewares.use('/__dev/save-constellation', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        const chunks: Buffer[] = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
              stars: { x: number; y: number }[]
              edges?: [number, number][]
            }
            if (!Array.isArray(body.stars)) throw new Error('stars required')
            const stars = body.stars
            const edges = Array.isArray(body.edges) ? body.edges : []
            const file = path.resolve(server.config.root, 'src/data/constellation.ts')
            const starsLit = JSON.stringify(stars, null, 2)
            const edgesLit = JSON.stringify(edges, null, 2)
            const block = `export const DEFAULT_CONSTELLATION: ConstellationMap = {
  stars: ${starsLit},
  edges: ${edgesLit},
}`
            const src = fs.readFileSync(file, 'utf8')
            const next = src.replace(
              /export const DEFAULT_CONSTELLATION: ConstellationMap = \{[\s\S]*?\n\}/,
              block,
            )
            if (next === src) throw new Error('No se pudo reemplazar DEFAULT_CONSTELLATION')
            fs.writeFileSync(file, next.endsWith('\n') ? next : `${next}\n`, 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, stars: stars.length, edges: edges.length }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ ok: false, error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), saveConstellationPlugin()],
})
