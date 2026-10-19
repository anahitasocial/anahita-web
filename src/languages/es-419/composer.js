// The composer: the one box a post is written in, and the extended composer
// for writing at length.
export default {
  newPost: 'Nueva publicación',
  close: 'Cerrar',
  // Opens the extended composer from the short box: an article or a topic.
  longContent: 'Contenido largo',
  // What can be added to a post: the words beside each icon where there is
  // room, and the icon's name where it stands alone, on a phone.
  photo: 'Foto',
  gif: 'GIF',
  addGif: 'Añadir un GIF',
  video: 'Video',
  addVideo: 'Añadir un video',
  // The extended composer's heading, and the button where a profile takes
  // only long writing.
  writeLong: 'Escribir en extenso',
  // Said under the box where a profile takes pictures and videos but not
  // words alone.
  needsPicture: 'Añade una foto o un video para publicar aquí.',
  // Under the title and the text of an article or a topic, when posting
  // without them.
  titleNeeded: 'Hace falta un título.',
  bodyNeeded: 'Escribe algo primero.',
  // An article's cover, chosen in the extended composer.
  removeCover: 'Quitar la portada',
  // After why the server would not take it.
  coverRefused: 'El artículo se publica sin ella; puedes añadir una portada en el artículo.',
  // The extended composer's tabs.
  // The extended composer's text, and the buttons above it.
  tooLong: 'Como máximo {{count}} caracteres.',
  editor: {
    bold: 'Negrita',
    italic: 'Cursiva',
    heading: 'Encabezado',
    bullets: 'Lista con viñetas',
    numbers: 'Lista numerada',
    quote: 'Cita',
    code: 'Código',
    link: 'Enlace',
    linkAddress: 'Dirección',
    unlink: 'Quitar el enlace',
    apply: 'Aplicar',
    resize: 'Arrastra para cambiar la altura',
    removeEmbed: 'Quitar',
    showAsLink: 'Mostrar como enlace',
    media: 'Fotos y videos',
  },
  // The library of one's own photos and videos, in the editor.
  library: {
    title: 'Tus archivos multimedia',
    photos: 'Fotos',
    videos: 'Videos',
    upload: 'Subir',
    uploadNote: 'Lo que subas aquí queda en tu biblioteca y solo en este texto: no en tu feed ni en tu perfil.',
    insert: 'Insertar',
    chooseVideo: 'Elige un GIF o un video',
    preparing: 'Preparando tu video. Se insertará en cuanto esté listo.',
    none: {
      photos: 'Todavía no hay fotos.',
      videos: 'Todavía no hay videos.',
    },
    untitled: {
      photos: 'Foto',
      videos: 'Video',
    },
  },
  // What a post's fields are called, the same in every form: a title; the
  // content of writing; the description of a photo or a video, as
  // WordPress says.
  fields: {
    title: 'Título',
    content: 'Contenido',
    description: 'Descripción',
  },
  // Drafts: articles and topics still being written, kept on the server.
  drafts: {
    title: 'Borradores',
    save: 'Guardar borrador',
    saved: 'Borrador guardado. Solo tú puedes verlo.',
    notSaved: 'No se pudo guardar el borrador.',
    none: 'Todavía no hay borradores aquí.',
    new: 'Empezar uno nuevo',
    remove: 'Eliminar borrador',
    untitled: 'Sin título',
  },
  kinds: {
    article: 'Artículo',
    topic: 'Tema',
  },
  // A video handed over without a title, in the list of those being
  // prepared.
  untitledVideo: 'Video',
  // Hashtags offered while writing (roadmap row 78).
  hashtags: {
    label: 'Hashtags',
    suggested: 'Hashtags sugeridos',
    writeMore: 'Aparecen a medida que escribes.',
    none: 'Ninguno en uso coincide todavía con lo que escribiste.',
    full: 'Solo cuentan los primeros {{ count }} hashtags.',
    // `short` is the count as a few characters: 1.2K.
    uses_one: '{{ short }} publicación',
    uses_other: '{{ short }} publicaciones',
    followed: 'Lo sigues',
  },
  locations: {
    add: 'Agregar lugar',
    nearMe: 'Cerca de mí',
    photoSuggest: 'Esta foto tiene una ubicación. ¿Sugerir lugares cerca?',
    nearPhoto: 'Cerca de la foto',
    hint: 'Escribe un nombre o toca Cerca de mí.',
    addNew: 'Agregar “{{name}}” como lugar nuevo',
    addTitle: 'Agregar lugar',
    goesOut: 'Se envía con la publicación a otros servidores del fediverso.',
  },
};
