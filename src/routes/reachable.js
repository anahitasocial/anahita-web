// Paths reachable while something is outstanding — terms to accept, or a
// profile to fill in.
//
// The legal documents, so somebody can read what they are being asked to
// accept in full before accepting it. Support, so a person who cannot get past
// a gate can still ask for help. And the OAuth callback, which has to finish
// writing the session before there is a viewer to check at all.
//
// Each gate adds its own page, or it would loop. Only its own: were /onboarding
// on the shared list, somebody behind on the terms could open it directly and
// skip the agreements, which always come first.
const ALWAYS_REACHABLE = [
  '/legal',
  '/support',
  '/oauth/callback',
];

const isReachable = (pathname, ownPath) => {
  return [ownPath, ...ALWAYS_REACHABLE].some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
};

export default isReachable;
