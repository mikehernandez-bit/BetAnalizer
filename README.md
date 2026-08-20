# BetAnalyzer

**Analiza patrones. Compara estadísticas. Decide con datos.**

Plataforma de análisis estadístico de fútbol y tenis: compara equipos o jugadores, detecta tendencias recientes y explora mercados deportivos ordenados según su respaldo estadístico. Todos los análisis se presentan como estimaciones orientativas, nunca como resultados garantizados.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (Radix UI primitives)
- **Recharts** para gráficos
- **Lucide React** para iconos
- **Framer Motion** para animaciones
- **React Hook Form + Zod** para el asistente de análisis
- Datos **reales, cargados a mano** en `data/` (ver metodología abajo), servidos a través de una capa de `services/` pensada para conectarse a una API real más adelante sin tocar la UI

## Metodología de datos (importante)

Este proyecto **no usa datos ficticios ni un generador aleatorio de equipos/partidos**, y por ahora tampoco está conectado a ninguna API de estadísticas. Cada partido que aparece en la plataforma fue agregado a mano siguiendo este proceso:

1. El usuario indica un partido (equipos, fecha).
2. Se investiga en internet: competición, fecha/hora/estadio reales, identidad de los clubes (colores, año de fundación) y los últimos resultados reales de ambos equipos.
3. Esos datos se cargan en `data/teams.ts`, `data/competitions.ts`, `data/matches.ts` y `data/team-history.ts`, con comentarios que indican qué es real y qué es una estimación razonable (por ejemplo, córners/remates por partido no siempre se publican para todas las ligas, así que ese detalle puede ser estimado a partir del marcador real y se deja aclarado en el código).

El motor de análisis (`utils/`, `services/market-service.ts`, `services/analysis-service.ts`) es independiente de esto: opera sobre cualquier `TeamMatchRecord[]` sin importar si viene de datos cargados a mano o de una API real en el futuro. Por eso "cargar un partido nuevo" solo implica tocar los archivos de `data/`, nunca la lógica de análisis ni los componentes.

No hay una sección de "explorar equipos" ni "comparador" genérico: como el catálogo de equipos crece partido a partido, esas pantallas de búsqueda no aportaban valor y se quitaron. El perfil de un equipo (`/equipos/[id]`) sigue existiendo y se enlaza desde los partidos donde participa.

## Cómo ejecutar el proyecto

Requiere Node.js 20+.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Inicio rápido en Windows

Haz doble clic en [`start.bat`](start.bat): instala las dependencias si hace falta, levanta el servidor de desarrollo en una ventana aparte y abre `http://localhost:3000` automáticamente. Para detenerlo, cierra la ventana "BetAnalyzer - Servidor".

Otros scripts:

```bash
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint    # ESLint
```

## Estructura del proyecto

```
app/                   Rutas (App Router): dashboard, analizar, partidos, equipos/[id],
                        mercados, analisis, historial, favoritos, configuracion
components/
  layout/               Sidebar, TopNavbar, MobileNavbar, AppShell, Footer
  brand/                Logo y logotipo (favicon en app/icon.svg)
  shared/                Componentes reutilizables (StatCard, ConfidenceBadge, EmptyState…)
  dashboard/            Bloques del panel de inicio
  matches/               MatchCard, MatchTable, explorador de partidos
  teams/                 Perfil de equipo
  analysis/              Cabecera, tabs y contenido del análisis completo
  patterns/               PatternCard, CrossPatternCard
  markets/                MarketCard, BestBetCard, RiskCard, explorador de mercados
  charts/                 Envoltorios de Recharts (radar, líneas, barras, dona)
  favorites/, history/, settings/
data/                   Datos reales cargados a mano (equipos, competiciones, partidos,
                        historial por equipo, H2H, rivales en común, catálogo de mercados)
services/               Capa que expone los datos al resto de la app (el punto de conexión
                        a una API real el día que se necesite)
utils/                  Funciones puras: estadística, motor de confianza, cuotas, formatos, filtros
hooks/                  use-analysis, use-filters, use-favorites
types/                  Modelo de dominio compartido
lib/                    Contexto de la app, navegación, theming, validación (Zod)
```

## El motor de análisis

- `utils/statistics.ts`: agregación de estadísticas (promedio, mediana, desviación, tendencia) y detección de patrones y patrones cruzados a partir de plantillas declarativas.
- `utils/confidence.ts`: pondera 30 % rendimiento reciente, 25 % vulnerabilidad del rival, 15 % condición local/visitante, 10 % enfrentamientos directos, 10 % rivales en común, 5 % tendencia últimos 3, 5 % calidad de los datos.
- `utils/odds.ts`: probabilidad implícita (`100 / cuota`) y clasificación de valor frente a la estimación estadística.
- `services/market-service.ts`: evalúa los ~36 mercados del catálogo (`data/markets.ts`) para cualquier par de equipos y decide Mejor Bet, alternativas y apuestas a evitar. Las cuotas siguen siendo simuladas (`simulatedOdds()`) mientras no haya un proveedor de cuotas real conectado.
- `services/analysis-service.ts`: orquesta todo lo anterior en un `AnalysisResult` completo; el id de cada análisis es determinista (`equipoLocal-vs-equipoVisitante-{5|10|15|20}c`), por lo que las URLs de `/analisis/[id]` son estables y regenerables.

Con muestras reales pequeñas (pocos partidos investigados por equipo), la "calidad de los datos" y la confianza del análisis bajan automáticamente — es una señal honesta, no un error.

Ningún mercado se presenta como apuesta segura. Si ningún mercado supera el 60 % de confianza, la pestaña "Mejor Bet" muestra explícitamente que no hay una recomendación suficientemente respaldada.

### Aprendizaje con resultados reales

- El 1X2 pondera más los partidos recientes cuando está activa la opción **Dar más peso a los últimos 5**.
- `/historial` guarda una foto inmutable del pronóstico antes del saque inicial. Un resultado sin foto previa se muestra, pero no cuenta como acierto ni como entrenamiento.
- Con cinco pronósticos 1X2 válidos se activa una calibración bayesiana limitada a ±25 % y se informa también el Brier score.
- Cada mercado se audita por separado. Tras cinco liquidaciones, si no conserva al menos 70 % de aciertos, queda marcado como `evitar` hasta recuperar ese umbral.
- Todo el aprendizaje se guarda actualmente en `localStorage`; por tanto, pertenece a ese navegador. Para compartir aprendizaje entre dispositivos se necesitará persistencia en un backend.

Estas correcciones reducen sesgos y permiten medir mejoras reales, pero no garantizan una tasa futura de acierto ni eliminan el riesgo propio de los eventos deportivos.

### Análisis de tenis

- `/tenis` recibe exactamente 20 partidos oficiales por jugador mediante el formato `fecha | superficie | torneo opcional | rival | sets | estado opcional`.
- Los puntos de desempate se conservan con notación explícita, por ejemplo `7(8)-6(6)`.
- Los retiros (`RET`) y walkovers (`WO`) permanecen identificados pero no alimentan las probabilidades.
- El motor combina forma general, últimos 10 partidos, rendimiento por sets y resultados en la misma superficie; el ranking ATP/WTA es un ajuste opcional y limitado.
- Evalúa ganador, ganadores y puntuaciones por set, totales de juegos, hándicaps, cantidad de sets, ambos ganan un set y marcador correcto.
- Los análisis se pueden guardar en el navegador y los mercados solo se marcan como fuertes con al menos 70 % de probabilidad y 70 % de confianza.
- El primer evento precargado es Rublev–Borges, Cincinnati 2026; conserva la muestra prepartido y el resultado oficial en campos separados para evitar fuga de datos.

## Cómo agregar un partido nuevo

1. Agregar (si no existen) los equipos reales en `data/teams.ts` y su competición en `data/competitions.ts`.
2. Agregar el partido en `data/matches.ts` con fecha/hora/estadio reales.
3. Investigar y cargar los últimos partidos reales de cada equipo en `data/team-history.ts` (`REAL_HISTORIES`).
4. Si hay antecedentes directos o rivales en común relevantes y verificables, cargarlos en `data/head-to-head.ts` / `data/common-opponents.ts`; si no, se dejan vacíos (la UI ya lo maneja con un estado vacío, sin inventar nada).

## Reemplazar la carga manual por una API real

El proyecto está diseñado para que este cambio no toque componentes ni páginas:

1. **No cambies `types/`** — es el contrato de datos que ya consume toda la UI.
2. **Reescribe `data/*.ts`** para que, en vez de leer los datos cargados a mano, hagan `fetch` a tu API y adapten la respuesta a los tipos existentes (`Team`, `Match`, `TeamMatchRecord`, `HeadToHead`, `CommonOpponentsAnalysis`, `BettingMarket`…).
3. **Actualiza `services/*.ts`**: hoy son wrappers síncronos (con un `delay()` simulado) sobre `data/`. Conviértelos en funciones `async` reales que llamen a tu backend o directamente a `data/` si ahí ya hiciste el `fetch`. Las firmas (`fetchTeam`, `fetchAllMatches`, `getFilteredTeamForm`, `generateAnalysis`…) pueden mantenerse iguales para no romper nada aguas arriba.
4. **Revisa `services/analysis-service.ts` y `services/market-service.ts`**: si tu API ya calcula probabilidades/confianza, puedes sustituir el motor local por esos valores; si no, el motor estadístico incluido seguirá funcionando igual sobre los datos reales.
5. **Cuotas reales**: sustituye `simulatedOdds()` en `services/market-service.ts` por una llamada a tu proveedor de cuotas, o deja que `config.odds` (las que el usuario ingresa en el asistente) siga teniendo prioridad como ya ocurre.
6. Los componentes de página (`app/**/page.tsx`) importan siempre desde `services/` o `data/`, nunca generan datos por su cuenta — por eso el reemplazo queda contenido en esas dos carpetas.

## Notas de producto

- El tema oscuro es el diseño principal; hay un toggle de tema claro/oscuro persistido en `localStorage`.
- Favoritos y preferencias de usuario se guardan solo en el navegador (no hay backend).
- El historial y "Mis análisis" empiezan vacíos y se completan a medida que se cargan y juegan partidos reales.
- Disclaimer de juego responsable visible en el footer de todas las vistas y en la pestaña "Riesgos" de cada análisis.
