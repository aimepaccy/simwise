/// <reference types="vitest/config" />
import { createHash } from 'node:crypto'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// The Content Security Policy: the browser runs only SimWise's own scripts and talks only to SimWise's own API.
// If someone ever slipped a script into the page, it could neither run nor send debriefs anywhere.
// Added to the built page only, since the development server needs inline scripts of its own.
function contentSecurityPolicy(apiUrl: string): Plugin {
  return {
    name: 'simwise-content-security-policy',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        // The one inline script (the theme, set before the page draws) is allowed by its fingerprint, so a
        // changed or added inline script would not run. Browsers turn Windows line endings into plain ones
        // before taking the fingerprint, so this must too.
        const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
          ([, body]) => `'sha256-${createHash('sha256').update(body.replace(/\r\n?/g, '\n')).digest('base64')}'`,
        )
        const policy = [
          "default-src 'self'",
          `script-src 'self' ${inline.join(' ')}`,
          // Libraries (dialogs, animation) set styles from script; styles cannot run code.
          "style-src 'self' 'unsafe-inline'",
          // blob: for photo previews and listening back to a recording.
          "img-src 'self' data: blob:",
          "media-src 'self' blob:",
          // data: because the build places the smallest font files inside the style sheet itself.
          "font-src 'self' data:",
          `connect-src 'self' ${new URL(apiUrl).origin}`,
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; ')
        // Placed straight after the charset, before the theme script it governs. A safeguard that silently goes
        // missing is worse than none, so the build stops if the marker is not found.
        const marker = '<meta charset="UTF-8" />'
        if (!html.includes(marker)) throw new Error(`Content Security Policy not added: ${marker} is missing from index.html`)
        return html.replace(marker, `${marker}\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`)
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  // From the front-end folder, where Vite itself reads .env files, wherever the build is started from.
  const env = loadEnv(mode, import.meta.dirname, 'VITE_')
  // The same default as src/lib/api.ts.
  const apiUrl = env.VITE_API_URL ?? 'http://localhost:8000'
  return {
    plugins: [react(), tailwindcss(), contentSecurityPolicy(apiUrl)],
    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, './src') },
    },
    test: {
      environment: 'node',
    },
  }
})
