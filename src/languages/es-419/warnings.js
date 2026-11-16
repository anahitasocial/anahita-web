// Advertencias de contenido (anahita-services, fila 122).
export default {
  label: 'Advertencia',
  none: 'Ninguna',
  title: 'Advertencia de contenido',
  help: 'Verán tu contenido borroso, y detrás de una advertencia.',
  kinds: {
    adult: 'Contenido para adultos',
    suggestive: 'Sexualmente sugerente',
    graphic: 'Imágenes explícitas',
    nudity: 'Desnudez no sexual',
    other: 'Otra',
  },
  lines: {
    adult: 'Imágenes sexuales explícitas',
    suggestive: 'Sexual, sin desnudez',
    graphic: 'Violencia, sangre o imágenes perturbadoras',
    nudity: 'Desnudos artísticos, por ejemplo',
    other: 'Con tus palabras: spoilers, duelo…',
  },
  words: 'Qué contiene',
  wordsNeeded: 'Di qué contiene la publicación.',
  remove: 'Quitar la advertencia',
  view: 'Ver',
  byModerator: 'Los administradores le dieron esta advertencia a la publicación, así que no se puede cambiar aquí.',
  // In the dialog, for an administrator giving one as the site's.
  moderatorHelp: 'Dada por los administradores: se le avisa a quien la escribió, y no puede quitarla.',
  saved: 'Advertencia guardada.',
  notSaved: 'No se pudo guardar la advertencia.',
  // A post the reader chose to hide, as one line in a list.
  hidden: 'Oculto: {{ warning }}',
  // What each reader chooses, in their settings (row 122, phase 2).
  choices: {
    title: 'Advertencias',
    help: 'Lo que ves de una publicación con una advertencia',
    show: 'Mostrar',
    warn: 'Advertir',
    hide: 'Ocultar',
    // Other's line, for a reader: the kinds' own lines say the rest.
    otherLine: 'Con las palabras de quien la escribió: spoilers, duelo…',
  },
};
