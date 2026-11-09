// Audio posts (roadmap row 137): a sound, sent as a video is. What is said
// of one where it is not what is said of a video (videos.js).
export default {
  cTitle: 'Audio',
  mTitle: 'Audio',
  upload: {
    ready: 'Votre audio est publié.',
    preparing: 'Préparation de votre audio',
    processing: 'Préparation de votre audio. Il sera publié dès qu’il sera prêt ; vous pouvez quitter cette page.',
  },
  problems: {
    none: 'Choisissez d’abord un son.',
    notAudio: 'Ce fichier n’est pas un son qui peut être publié. Utilisez MP3, M4A, AAC, Ogg, Opus, WAV ou FLAC.',
    tooLarge: 'Ce son dépasse {{size}}.',
    tooLong: 'C’est plus long que ce qui peut être publié : {{minutes}} minutes.',
    closed: 'Ce fil n’accepte plus vos réponses ; le son n’a donc pas été publié.',
    tooMany: 'Vous avez publié aujourd’hui autant de vidéos et de sons que possible.',
    off: 'Les sons ne peuvent pas être publiés ici.',
    encoding: 'Ce son n’a pas pu être préparé.',
    network: 'Le téléversement n’a pas abouti. Vérifiez votre connexion et réessayez.',
    failed: 'Un problème est survenu et le son n’a pas pu être publié.',
  },
};
