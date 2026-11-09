// Audio posts (roadmap row 137): a sound, uploaded as a video is and made
// by video-service into one M4A file, with the cover the file carried when
// it had one. What is here is what is not the same as for a video.

const DEFAULT_MAX_BYTES = 500 * 1024 * 1024;
const DEFAULT_MAX_SECONDS = 3600;

// What a browser may say a sound is, as the server takes it
// (video-service constants.AudioTypes). The file picker is asked for these.
const TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/opus',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/flac',
  'audio/x-flac',
  'audio/webm',
];

// The file picker's `accept`. Only these: a file the browser cannot say is
// one of them is refused by the server too.
const PICKER = TYPES.join(',');

const typeOf = (file) => {
  return String((file && file.type) || '').toLowerCase();
};

// Whether a file chosen is a sound that can be posted.
const isAudioType = (file) => {
  return TYPES.includes(typeOf(file));
};

const metadataOf = (nodeInfo) => {
  return (nodeInfo && nodeInfo.metadata) || {};
};

// Whether the installation takes audio posts (AUDIO_UPLOADS): yes unless
// it says no, as one from before the setting says nothing.
const isOn = (nodeInfo) => {
  return metadataOf(nodeInfo).audioUploads !== false;
};

// Whether it offers to record one in the composer (AUDIO_RECORDING): only
// where it says so.
const recordingOn = (nodeInfo) => {
  return metadataOf(nodeInfo).audioRecording === true;
};

// The installation's limits, where it says them; otherwise the server's
// defaults, 500 MB and an hour.
const maxBytes = (nodeInfo) => {
  return Number(metadataOf(nodeInfo).audioMaxBytes) || DEFAULT_MAX_BYTES;
};

const maxSeconds = (nodeInfo) => {
  return Number(metadataOf(nodeInfo).audioMaxSeconds) || DEFAULT_MAX_SECONDS;
};

// Why a sound cannot be sent, as a key of audio:problems, or '' when it
// can. How long it plays is found out by the server.
const problem = (file, nodeInfo) => {
  if (!file) {
    return 'none';
  }
  if (!isAudioType(file)) {
    return 'notAudio';
  }
  if (file.size > maxBytes(nodeInfo)) {
    return 'tooLarge';
  }
  return '';
};

// What a post carries as `audio`, or null: `{ duration, url, type, cover }`.
const of = (node) => {
  const audio = node && node.audio;
  return audio && audio.url ? audio : null;
};

export default {
  isOn,
  recordingOn,
  TYPES,
  PICKER,
  isAudioType,
  maxBytes,
  maxSeconds,
  problem,
  of,
};
