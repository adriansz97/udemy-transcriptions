# Transcripciones Udemy

Convierte las transcripciones y artículos de una sección de Udemy en un ZIP con un archivo Markdown por clase.

## Uso

1. **Pega el HTML de la sección**: copia el panel de la sección desde el currículo de Udemy y pulsa **Analizar HTML**. Revisa el título y las clases detectadas (videos, artículos y otros contenidos; los quizzes se omiten).
2. **Agrega el contenido de cada clase**:
   - **Video**: pega el HTML del panel de transcripción y pulsa **Analizar HTML**. Se descartan los timestamps y los cues se agrupan en párrafos.
   - **Artículo o nota**: pega el HTML del artículo y pulsa **Analizar HTML**. Se conservan títulos, listas, negritas, enlaces y bloques de código.
   - En ambos casos el Markdown se puede editar antes de guardar.
3. **Descarga el ZIP**: cuando todas las clases tengan contenido, el botón **Descargar .zip** genera:

```
Nombre de la sección/
  01. Video.md
  02. Artículo.md
```

Los nombres de archivo y carpeta se sanean (se quitan `: / \ * ? " < > |`, entre otros).

El progreso se guarda en `localStorage` (clave `udemy-transcripts:v2`, con migración desde `v1`), así que puedes recargar la página sin perder nada.

## Desarrollo

```bash
npm run dev
npm test        # tests de parsers y sanitización (Vitest + jsdom)
npm run lint
npm run build
```

La app es 100 % cliente: no hay backend ni se envía el HTML a ningún servidor.
