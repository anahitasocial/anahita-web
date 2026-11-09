// Audio posts (roadmap row 137): a sound, sent as a video is. What is said
// of one where it is not what is said of a video (videos.js).
export default {
  cTitle: 'Audio',
  mTitle: 'Audio',
  upload: {
    ready: 'Your audio is posted.',
    preparing: 'Preparing your audio',
    processing: 'Preparing your audio. It will be posted when it is ready, and you can leave this page.',
  },
  problems: {
    none: 'Choose a sound first.',
    notAudio: 'This file is not a sound that can be posted. Use MP3, M4A, AAC, Ogg, Opus, WAV or FLAC.',
    tooLarge: 'This sound is larger than {{size}}.',
    tooLong: 'This is longer than can be posted: {{minutes}} minutes.',
    closed: 'This thread no longer takes your replies, so the sound was not posted.',
    tooMany: 'You have posted as many videos and sounds as you can today.',
    off: 'Sounds cannot be posted here.',
    encoding: 'This sound could not be prepared.',
    network: 'The upload did not go through. Check your connection and try again.',
    failed: 'Something went wrong and the sound could not be posted.',
  },
};
