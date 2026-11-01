# Transcripciones Udemy

Convierte las transcripciones de una sección de Udemy en un ZIP con un archivo Markdown por video.

## Uso

1. **Pega el HTML de la sección**: copia el panel de la sección desde el currículo de Udemy y pulsa **Analizar HTML**. Revisa el título y los videos detectados (artículos y quizzes se omiten).
2. **Agrega cada transcripción**: selecciona un video en el sidebar, pega el HTML del panel de transcripción y pulsa **Analizar HTML**. El texto se limpia (sin timestamps) y se agrupa en párrafos; puedes editarlo antes de guardar.
3. **Descarga el ZIP**: cuando todos los videos tengan transcripción, el botón **Descargar .zip** genera:

```
Nombre de la sección/
  01. Video.md
  02. Video.md
```

Los nombres de archivo y carpeta se sanean (se quitan `: / \ * ? " < > |`, entre otros).

El progreso se guarda en `localStorage`, así que puedes recargar la página sin perder nada.

## Desarrollo

```bash
npm run dev
npm test        # tests de parsers y sanitización (Vitest + jsdom)
npm run lint
npm run build
```

La app es 100 % cliente: no hay backend ni se envía el HTML a ningún servidor.
