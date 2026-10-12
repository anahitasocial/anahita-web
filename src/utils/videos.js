// Video posts: which of a video's sizes to play, how a file is sent in
// parts, and what the installation allows.

const QUALITY_KEY = 'video.quality';

const DEFAULT_MAX_BYTES = 500 * 1024 * 1024;
const DEFAULT_MAX_SECONDS = 600;

// What a browser may say it is sending. The server's worker decides what
// the file really is; this is for the file picker and an early refusal.
const TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

const metadataOf = (nodeInfo) => {
  return (nodeInfo && nodeInfo.metadata) || {};
};

// Whether videos may be posted here at all.
const isOn = (nodeInfo) => {
  return Boolean(metadataOf(nodeInfo).videoUploads);
};

const maxBytes = (nodeInfo) => {
  return Number(metadataOf(nodeInfo).videoMaxBytes) || DEFAULT_MAX_BYTES;
};

const maxSeconds = (nodeInfo) => {
  return Number(metadataOf(nodeInfo).videoMaxSeconds) || DEFAULT_MAX_SECONDS;
};

// Why a file cannot be sent, as a key of videos:problems, or '' when it can.
// Its length is not known here: the server finds that out.
const problem = (file, nodeInfo) => {
  if (!file) {
    return 'none';
  }
  if (!TYPES.includes(String(file.type || '').toLowerCase())) {
    return 'notAVideo';
  }
  if (file.size > maxBytes(nodeInfo)) {
    return 'tooLarge';
  }
  return '';
};

// The parts a file is sent in: each with its number, counted from 1, and
// where it starts and ends in the file.
const partsOf = (size, partSize) => {
  const parts = [];
  if (!(size > 0) || !(partSize > 0)) {
    return parts;
  }
  for (let start = 0, number = 1; start < size; start += partSize, number += 1) {
    parts.push({ number, start, end: Math.min(start + partSize, size) });
  }
  return parts;
};

// How far along an upload is, from 0 to 100, from the bytes of the parts
// that have arrived and of the ones on their way.
const percent = (sent, size) => {
  if (!(size > 0)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((sent / size) * 100)));
};

// A video's sizes, largest first.
const filesOf = (video) => {
  const files = (video && Array.isArray(video.files)) ? video.files : [];
  return [...files].sort((a, b) => {
    return b.height - a.height;
  });
};

// Whether the browser says its connection is slow, or that its user wants
// to save data. Not every browser says.
const isSlow = (connection) => {
  if (!connection) {
    return false;
  }
  return Boolean(connection.saveData) || ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
};

// The size to play: the one chosen last time, where the video has it, or
// the nearest below it; otherwise the largest that is no more than 720
// tall, or the smallest on a slow connection. A size is never played
// because it is the largest there is: 1080p and above are for whoever asks.
const pick = (video, { preferred = 0, slow = false } = {}) => {
  const files = filesOf(video);
  if (files.length === 0) {
    return null;
  }
  const smallest = files[files.length - 1];

  if (preferred > 0) {
    return files.find((file) => {
      return file.height <= preferred;
    }) || smallest;
  }
  if (slow) {
    return smallest;
  }
  return files.find((file) => {
    return file.height <= 720;
  }) || smallest;
};

// What a size is called in the menu: "1080p", and "4K" for the largest.
const label = (file) => {
  if (!file) {
    return '';
  }
  return file.height >= 2160 ? '4K' : `${file.height}p`;
};

const rememberedQuality = () => {
  try {
    return Number(window.localStorage.getItem(QUALITY_KEY)) || 0;
  } catch (e) {
    return 0;
  }
};

const rememberQuality = (height) => {
  try {
    window.localStorage.setItem(QUALITY_KEY, String(height));
  } catch (e) {
    // Not kept, and chosen again next time.
  }
};

// A file of a video, and its poster, are sent as paths under the API.
const urlOf = (path, base = process.env.REACT_APP_API_BASE_URL || '') => {
  if (!path) {
    return '';
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${String(base).replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
};

// "1:05", "12:40", "1:02:03".
const duration = (seconds) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, '0');

  return hours > 0 ?
    `${hours}:${String(minutes).padStart(2, '0')}:${rest}` :
    `${minutes}:${rest}`;
};

// "480 MB", "1.5 GB".
const megabytes = (bytes) => {
  const mb = (Number(bytes) || 0) / (1024 * 1024);
  if (mb >= 1024) {
    return `${Math.round((mb / 1024) * 10) / 10} GB`;
  }
  return `${Math.max(1, Math.round(mb))} MB`;
};

// Whether an upload is still on its way to being a post.
const isInHand = (upload) => {
  return Boolean(upload) && ['uploading', 'processing'].includes(upload.status);
};

export default {
  TYPES,
  isOn,
  maxBytes,
  maxSeconds,
  problem,
  partsOf,
  percent,
  filesOf,
  isSlow,
  pick,
  label,
  rememberedQuality,
  rememberQuality,
  urlOf,
  duration,
  megabytes,
  isInHand,
};
