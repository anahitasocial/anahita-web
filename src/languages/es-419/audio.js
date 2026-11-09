// Audio posts (roadmap row 137): a sound, sent as a video is. What is said
// of one where it is not what is said of a video (videos.js).
export default {
  cTitle: 'Audio',
  mTitle: 'Audio',
  upload: {
    ready: 'Tu audio está publicado.',
    preparing: 'Preparando tu audio',
    processing: 'Preparando tu audio. Se publicará cuando esté listo, y puedes salir de esta página.',
  },
  problems: {
    none: 'Primero elige un audio.',
    notAudio: 'Este archivo no es un audio que se pueda publicar. Usa MP3, M4A, AAC, Ogg, Opus, WAV o FLAC.',
    tooLarge: 'Este audio pesa más de {{size}}.',
    tooLong: 'Es más largo de lo que se puede publicar: {{minutes}} minutos.',
    closed: 'Este hilo ya no acepta tus respuestas, así que el audio no se publicó.',
    tooMany: 'Ya publicaste hoy todos los videos y audios que puedes.',
    off: 'Aquí no se pueden publicar audios.',
    encoding: 'No se pudo preparar este audio.',
    network: 'La subida no se completó. Revisa tu conexión e inténtalo de nuevo.',
    failed: 'Algo salió mal y no se pudo publicar el audio.',
  },
};
