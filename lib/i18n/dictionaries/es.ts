import type { LessonType } from "../../types";

interface LessonCopy {
  label: string;
  htmlLabel: string;
  htmlPlaceholder: string;
  analyzeHint: string;
  markdownPlaceholder: string;
  emptyError: string;
  saveLabel: string;
  cancelLabel: string;
  deleteConfirm: (title: string) => string;
}

const lessonCopy: Record<LessonType, LessonCopy> = {
  video: {
    label: "Transcripción",
    htmlLabel: "HTML de la transcripción",
    htmlPlaceholder: '<div data-purpose="transcript-panel">…</div>',
    analyzeHint: "Se descartan los timestamps y se unen los cues en párrafos.",
    markdownPlaceholder:
      "Pega el HTML y pulsa Analizar, o escribe el Markdown directamente.",
    emptyError: "La transcripción está vacía.",
    saveLabel: "Guardar transcripción",
    cancelLabel: "Cancelar",
    deleteConfirm: (title) => `¿Eliminar el contenido de la transcripción "${title}"?`,
  },
  article: {
    label: "Artículo / nota",
    htmlLabel: "HTML del artículo o nota",
    htmlPlaceholder:
      '<div data-purpose="safely-set-inner-html:rich-text-viewer:html">…</div>',
    analyzeHint: "Se conservan títulos, listas, negritas, enlaces y bloques de código.",
    markdownPlaceholder: "Pega el HTML del artículo y pulsa Analizar, o escribe el Markdown.",
    emptyError: "El artículo está vacío.",
    saveLabel: "Guardar artículo",
    cancelLabel: "Cancelar",
    deleteConfirm: (title) => `¿Eliminar el contenido del artículo "${title}"?`,
  },
  other: {
    label: "Contenido",
    htmlLabel: "HTML del contenido",
    htmlPlaceholder:
      '<div data-purpose="safely-set-inner-html:rich-text-viewer:html">…</div>',
    analyzeHint: "Se detecta automáticamente si es una transcripción o un artículo.",
    markdownPlaceholder:
      "Pega el HTML y pulsa Analizar, o escribe el Markdown directamente.",
    emptyError: "El contenido está vacío.",
    saveLabel: "Guardar contenido",
    cancelLabel: "Cancelar",
    deleteConfirm: (title) => `¿Eliminar el contenido de "${title}"?`,
  },
};

const plural = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

export const es = {
  app: {
    title: "Transcripciones Udemy",
    tagline: "Sección → transcripciones y artículos → ZIP con un Markdown por clase.",
  },
  language: {
    label: "Idioma",
    es: "Español",
    en: "Inglés",
  },
  header: {
    newSection: "Nueva sección",
  },
  import: {
    heading: "1. Pega el HTML de la sección",
    description:
      "Copia el panel de la sección desde el currículo de Udemy. Se incluyen videos, artículos y otros contenidos; los quizzes se omiten.",
    htmlLabel: "HTML de la sección",
    analyze: "Analizar HTML",
    clear: "Limpiar",
    noLessons:
      "No se encontraron clases. Pega el HTML del currículo de la sección (debe incluir los ítems con su título).",
    missingData: "La sección necesita un título y al menos una clase.",
    foundSection: "Sección encontrada",
    sectionOption: (title: string, count: number) =>
      `${title} (${plural(count, "clase", "clases")})`,
    sectionTitle: "Título de la sección",
    lessonsHeading: (count: number) => `Clases (${count})`,
    skippedQuizzes: (count: number) =>
      count === 1 ? "1 quiz omitido" : `${count} quizzes omitidos`,
    lessonName: (title: string) => `Nombre de la clase ${title}`,
    remove: "Quitar",
    removeLesson: (title: string) => `Quitar ${title}`,
    useSection: (count: number) =>
      `Usar esta sección (${plural(count, "clase", "clases")})`,
    defaultSectionTitle: (index: number) => `Sección ${index + 1}`,
  },
  lessonType: {
    video: "Video",
    article: "Artículo",
    other: "Contenido",
  },
  editor: {
    analyze: "Analizar HTML",
    analyzeError:
      "No se encontró contenido en el HTML. Revisa que hayas pegado el panel completo.",
    markdownLabel: "Markdown",
    complete: "Completado",
    pending: "Pendiente",
    replace: "Reemplazar",
    exportTitle: "Descargar .md",
    deleteTitle: "Eliminar contenido",
    removeTitle: "Quitar de la sección",
    removeConfirm: (title: string) =>
      `¿Quitar "${title}" de esta sección? Se eliminará del listado y no se incluirá en el ZIP. Esta acción no se puede deshacer.`,
    types: lessonCopy,
  },
  sidebar: {
    section: "Sección",
    progress: (completed: number, total: number) =>
      `${completed} de ${plural(total, "clase", "clases")}`,
  },
  download: {
    button: "Descargar .zip",
    generating: "Generando ZIP…",
    ready: "Todo listo: una carpeta con un .md por clase.",
    missing: (count: number) =>
      count === 1
        ? "Falta 1 clase por completar para descargar."
        : `Faltan ${count} clases por completar para descargar.`,
    error: "No se pudo generar el ZIP. Inténtalo de nuevo.",
  },
  workspace: {
    selectLesson: "Selecciona una clase del listado para agregar su contenido.",
    resetConfirm:
      "¿Borrar la sección y todos los contenidos guardados? Esta acción no se puede deshacer.",
  },
  files: {
    sectionFallback: "sección",
    untitledFallback: "sin-titulo",
  },
};

export type Dictionary = typeof es;
