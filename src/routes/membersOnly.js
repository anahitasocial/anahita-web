import isReachable from './reachable';

// What somebody who is not signed in can still open on a members-only
// site. Kept apart from the gate that uses it so it can be read and
// tested as plain data; see ./MembersOnlyGate.
//
// It is what stays open on the server: the pages for signing in and up,
// the legal documents, the support and about pages, and the home page.
const OPEN_PATHS = ['/auth', '/about', '/pages/tos', '/pages/privacy'];

const isOpen = (pathname) => {
  if (pathname === '/') {
    return true;
  }

  // /legal, /support and the OAuth callback, which every gate leaves
  // reachable, plus the ones only this gate lets through.
  return OPEN_PATHS.some((path) => {
    return isReachable(pathname, path);
  });
};

export default {
  isOpen,
};
