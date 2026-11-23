// Where somebody goes once signed in, when they were on their way somewhere
// (roadmap row 134: a page of another server sent them here to follow or
// answer something). Kept for the browser's tab alone, and only a path on
// this site, never another address.
const KEY = 'after_sign_in';

const isPath = (path) => {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');
};

const keep = (path) => {
  if (isPath(path)) {
    window.sessionStorage.setItem(KEY, path);
  }
};

// The path kept, once: it is forgotten as it is read.
const take = () => {
  const path = window.sessionStorage.getItem(KEY);
  window.sessionStorage.removeItem(KEY);
  return isPath(path) ? path : '';
};

export default {
  keep,
  take,
};
