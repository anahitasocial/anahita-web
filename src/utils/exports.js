// A person's copy of their own data: what an export's state means for
// what is shown.

// Being made: waiting for a worker, or with one.
const isActive = (item) => {
  return Boolean(item) && ['pending', 'building'].includes(item.status);
};

const isReady = (item) => {
  return Boolean(item) && item.status === 'ready';
};

// The one worth showing: the latest that is being made, is ready, or
// failed. One given up or past its keeping is over and says nothing.
const current = (items = []) => {
  return items.find((item) => {
    return isActive(item) || isReady(item) || item.status === 'failed';
  }) || null;
};

// Whether one can be asked for now: none is being made, and it is not too
// soon after the last.
const canAsk = (items = [], nextAt = '', now = Date.now()) => {
  if (items.some(isActive)) {
    return false;
  }
  return !nextAt || new Date(nextAt).getTime() <= now;
};

// "480 MB", "1.5 GB", "12 KB".
const size = (bytes) => {
  const value = Number(bytes) || 0;
  if (value >= 1024 * 1024 * 1024) {
    return `${Math.round((value / (1024 * 1024 * 1024)) * 10) / 10} GB`;
  }
  if (value >= 1024 * 1024) {
    return `${Math.round(value / (1024 * 1024))} MB`;
  }
  return `${Math.max(1, Math.round(value / 1024))} KB`;
};

// A day, as the person's own language writes one.
const day = (value, language = 'en-GB') => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' });
};

// Whether the installation has no export service at all: nothing answers,
// or the gateway could not reach one.
const isAbsent = (error) => {
  const status = error && error.response && error.response.status;
  return !status || status === 404 || status >= 502;
};

export default {
  isActive,
  isReady,
  current,
  canAsk,
  size,
  day,
  isAbsent,
};
