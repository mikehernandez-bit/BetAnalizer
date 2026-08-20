<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas Estrictas de Transcripción de Partidos e Historiales (Flashscore / Sofascore)

1. **Exclusión Estricta de Partidos Amistosos**:
   - NUNCA incluir partidos amistosos (`Club Friendlies`, `Amistoso`, `Club Frien...`) en los historiales de los equipos (`histories`).
   - Todos los historiales deben contener exactamente **15 partidos 100% oficiales** (Liga / Copa / Torneos Continentales). Si hay amistosos en la vista general, descartarlos y usar las siguientes capturas para completar los 15 partidos oficiales.

2. **Precisión Absoluta en el 1er Tiempo (1T)**:
   - La Columna 1 del marcador es el Resultado Final (FT).
   - La Columna 2 del marcador es el Resultado del Primer Tiempo (1T).
   - La Columna 3 del marcador es el Resultado del Segundo Tiempo (2T).
   - El número superior pertenece al equipo Local; el número inferior al equipo Visitante.
   - Verificar siempre que los goles del 1T coincidan EXACTAMENTE con la Columna 2 de la captura antes de calcular mercados como "Menos de 2.5 goles 1ª parte".

