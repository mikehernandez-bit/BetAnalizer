---
name: flashscore-transcription
description: >-
  Protocolo estricto para transcribir partidos de capturas Flashscore/Sofascore sin errores en marcadores de 1T ni inclusión de partidos amistosos.
---

# Protocolo Estricto de Transcripción de Partidos

Para garantizar que NINGUNA apuesta o análisis falle por errores de transcripción:

1. **Partidos Amistosos**:
   - Queda estrictamente prohibido incluir partidos amistosos (`Club Friendlies`, `Amistoso`, `Club Frien...`).
   - Cada equipo DEBE tener exactamente **10 partidos 100% oficiales** de Liga o Copa.

2. **Columnas de Marcador**:
   - **Columna 1**: Resultado Final (FT)
   - **Columna 2**: Resultado del Primer Tiempo (1T)
   - **Columna 3**: Resultado del Segundo Tiempo (2T)
   - Fila Superior = Equipo Local
   - Fila Inferior = Equipo Visitante

3. **Verificación Cuádruple del 1T**:
   - Antes de guardar cualquier JSON o presentar cualquier tabla, auditar fila por fila la Columna 2.
   - `goalsForFirstHalf` y `goalsAgainstFirstHalf` deben coincidir exactamente con la Columna 2 desde la perspectiva del equipo (local vs visitante).
