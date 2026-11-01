// Where somebody may be sent back to from an address they were given: a path
// on this site and nothing else. An address is anybody's to write, so a link
// with `?return=https://elsewhere` or `?return=javascript:…` must not take
// somebody there after they have proved who they are.
const HOME = '/';

const returnPath = (value) => {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return HOME;
  }

  try {
    const { origin } = window.location;
    const url = new URL(value, origin);

    // `//elsewhere` and `/\elsewhere` both begin with a slash.
    if (url.origin !== origin) {
      return HOME;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return HOME;
  }
};

export default returnPath;
