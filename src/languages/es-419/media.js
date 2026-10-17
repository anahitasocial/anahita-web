export default {
  // What an article or a topic holds, under its opening in a list.
  summary: {
    photos_one: '{{count}} foto',
    photos_other: '{{count}} fotos',
    videos_one: '{{count}} video',
    videos_other: '{{count}} videos',
    citations_one: '{{count}} cita',
    citations_other: '{{count}} citas',
  },
  // What an article shows within itself, and lists at its end.
  // A post's Cited by tab: what cites it here.
  citations: {
    citedBy: 'Citado por',
    noneCitedBy: 'Todavía nada aquí cita esto.',
  },
  embed: {
    in: 'en',
    citations: 'Citas',
    opensNewTab: 'Se abre en una pestaña nueva',
    readMore: 'Leer más',
    viewProfile: 'Ver perfil',
  },
  stepper: {
    position: '{{index}} de {{total}}',
    next: 'Publicación siguiente',
    previous: 'Publicación anterior',
    permalink: 'Abrir el enlace permanente',
    home: 'Ir al inicio',
    open: 'Abrir en el visor',
    zoomIn: 'Ampliar a tamaño completo',
    zoomOut: 'Reducir para ajustar',
  },
  confirm: {
    delete: '¿Quieres eliminar esta publicación?',
  },
  // Pinning a post to the profile it is on.
  pin: {
    pin: 'Fijar en el perfil',
    unpin: 'Dejar de fijar',
    label: 'Fijado',
    pinned: 'Fijado. Ahora aparece primero en el perfil.',
    unpinned: 'Ya no está fijado.',
    failed: 'No se pudo hacer.',
  },
  // A post's interactions: who liked, reposted, quoted and replied.
  activity: {
    title: 'Interacciones',
    likes: 'Me gusta {{ count }}',
    reposts: 'Reposts {{ count }}',
    quotes: 'Citas {{ count }}',
    replies: 'Respuestas {{ count }}',
    none: 'Aquí no hay nada que puedas ver.',
    failed: 'No se pudo cargar esta lista.',
    open: 'Abrir',
  },
  // An avatar or a cover the server would not take.
  image: {
    tooLarge: 'Esta imagen es demasiado grande. El límite es de 10 MB.',
    unsupported: 'Solo se pueden subir imágenes JPEG y PNG.',
    unreadable: 'Este archivo no se pudo leer como imagen.',
    failed: 'No se pudo subir la imagen.',
  },
  // Saving a post to find it again. Private to whoever saved it.
  saved: {
    title: 'Guardado',
    private: 'Solo tú puedes ver lo guardado',
    save: 'Guardar',
    remove: 'Quitar de guardados',
    saved: 'Guardado. Está en Guardado, en el menú.',
    removed: 'Se quitó de guardados.',
    failed: 'No se pudo hacer.',
    empty: 'Todavía no hay nada guardado.',
    loadFailed: 'No se pudieron cargar tus publicaciones guardadas.',
  },
  // The language button in the composer.
  language: {
    label: 'Idioma: {{ name }}',
  },
  // Downloading a photo or a video, where whoever posted it allows it.
  download: {
    allowed: 'Descargas permitidas. Pulsa para que nadie pueda descargar esto.',
    notAllowed: 'Descargas no permitidas. Pulsa para que quienes pueden ver esto lo puedan descargar.',
    allow: 'Permitir la descarga',
    stop: 'No permitir la descarga',
    failed: 'No se pudo cambiar.',
    photo: 'Foto {{number}} de {{count}}',
    default: {
      title: 'Descargas',
      label: 'Permitir descargar las fotos y los videos publicados aquí',
      help: 'Con lo que empieza una foto o un video nuevo. Solo quienes pueden ver una publicación pueden descargarla, cada publicación se puede configurar por separado, y cambiar esto no cambia nada de lo ya publicado.',
      saved: 'Guardado.',
      notSaved: 'No se pudo guardar.',
    },
  },
};
