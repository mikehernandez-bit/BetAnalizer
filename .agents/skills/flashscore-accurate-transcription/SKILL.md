---
name: flashscore-accurate-transcription
description: Transcribe Flashscore or Sofascore match screenshots into official team histories with strict local/away perspective checks, exact FT/1T/2T scores, corners, shots, yellow and red cards. Use whenever screenshots are supplied for match-history transcription, betting analysis data entry, or updating a team-history JSON/package.
---

# Transcripción exacta de partidos

## Flujo obligatorio

1. Leer las instrucciones del repositorio y localizar el esquema exacto de `histories` antes de editar datos.
2. Separar cada captura en filas completas. Anotar primero los valores tal como aparecen en la imagen, sin cambiar la perspectiva: `local | visitante | FT local-visitante | 1T local-visitante | 2T local-visitante | xG | córners | remates | amarillas | rojas`.
3. Confirmar las columnas por sus iconos. En el formato Scores24 usado por este proyecto, después de xG aparecen córners, remates y tarjetas amarillas. Las rojas aparecen como insignia roja junto al nombre del equipo.
4. Convertir a la perspectiva del equipo del historial solo después de identificar local y visitante. Si es visitante, intercambiar ambos lados de FT, 1T, 2T, córners, remates, amarillas y rojas.
5. Excluir `Club Friendlies`, `Club Frien...`, `Amistoso` y equivalentes. Continuar con otra captura hasta tener exactamente 15 partidos oficiales por equipo.
6. Copiar 1T y 2T de sus columnas de la imagen. No sustituirlos por cálculos derivados de FT.

## Auditoría antes de guardar

Crear una tabla temporal por equipo con: `fecha | rival | local/visitante | FT imagen | 1T imagen | 2T imagen | córners imagen | remates imagen | TA imagen | roja imagen | valores orientados`.

Revisar cada fila dos veces:

- Confirmar que `FT = 1T + 2T` para ambos equipos.
- Confirmar que la fila superior es local y la inferior visitante.
- Confirmar que un visitante recibe los valores de la fila inferior, no de la superior.
- Confirmar que las tarjetas siguen al nombre del equipo, no a la posición de la fila ni al resultado.
- Confirmar que córners no se confundieron con remates.
- Confirmar que una insignia roja no se convirtió en cero ni se asignó al rival.

## Reglas de seguridad

- No rellenar estadísticas no visibles con ceros. Si una columna no aparece o no es legible, dejarla pendiente y pedir una captura más clara.
- No usar `goalsFor - goalsForFirstHalf` para sustituir la columna 2T; usarlo solo como comprobación.
- No conservar datos de un paquete anterior si contradicen una captura nueva.
- No persistir el JSON mientras exista una discrepancia de FT/1T/2T, local/visitante o tarjetas propias/rivales.
- Tras guardar, volver a leer el archivo y comprobar las 15 filas de cada equipo.
