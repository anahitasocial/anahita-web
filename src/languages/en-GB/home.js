export default {
  cTitle: 'Home',
  mTitle: 'Home',
  // Shown in place of every page to somebody who is not signed in, on an
  // installation that is members-only (SITE_READ_ACCESS=registered).
  membersOnly: {
    cTitle: 'This site is for its members',
    cDescription: 'Sign in to read it. Nothing here is shown to people who are not signed in.',
    signIn: 'Sign in',
  },
  // For somebody who is not signed in, on an installation that shows
  // visitors only the start of what is public (SITE_READ_ACCESS=preview).
  preview: {
    cTitle: 'You are seeing a preview',
    cDescription: 'Sign in to read whole posts, comments and everything past the first page.',
    signIn: 'Sign in',
    readMore: 'Sign in to read more',
  },
};
