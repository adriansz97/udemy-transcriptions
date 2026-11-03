<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

## Proyecto: Transcripciones Udemy

App Next.js 16 (App Router) que convierte el HTML de una sección de Udemy en un ZIP con un Markdown por clase (video, artículo o nota). Corre 100 % en el navegador: sin backend ni API routes.

### Comandos

- `npm run dev` — servidor de desarrollo.
- `npm test` — Vitest + jsdom (`tests/`).
- `npm run lint` — ESLint.
- `npm run build` — build de producción.

### Estructura

- `app/page.tsx` — entrada de la app.
- `components/` — UI y estado del workspace (`workspace.tsx` orquesta los pasos).
- `lib/` — parsers (`parse-section`, `parse-transcript`, `parse-article`, `parse-lesson`, `html-to-markdown`), formato Markdown, sanitización, ZIP (`fflate`), persistencia e i18n (`lib/i18n/`).
- `tests/fixtures/` — HTML real de Udemy usado por los tests.

### Reglas

- No renderizar el HTML pegado: parsearlo con `DOMParser`. Las transcripciones leen solo `textContent`; los artículos se convierten a Markdown con `html-to-markdown` (evita XSS, nunca `dangerouslySetInnerHTML`).
- Al importar una sección se omiten solo los quizzes; videos, artículos y contenidos no reconocidos se incluyen.
- Mantener los parsers puros y cubiertos por tests; agregar fixtures cuando cambie el HTML de Udemy.
- Todo nombre de archivo o carpeta pasa por `sanitizeFilename`; los duplicados se resuelven con `uniqueName`.
- El estado vive en `localStorage` con clave versionada (`udemy-transcripts:v2`), con migración automática desde `v1`.
- Para el guard de hidratación usar `useSyncExternalStore`; evitar `setState` síncrono dentro de `useEffect` (regla `react-hooks/set-state-in-effect`).
- UI en español e inglés mediante los diccionarios de `lib/i18n/dictionaries/`; identificadores y código en inglés.
- Cualquier texto visible nuevo va en `es.ts` y `en.ts` (el tipo `Dictionary` exige paridad). El idioma se resuelve en cliente y se guarda en `localStorage` (`udemy-transcripts:locale`).
- No agregar backend: la app debe seguir siendo estática y client-side.
