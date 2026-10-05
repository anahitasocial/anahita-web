// What a visitor, somebody who is not signed in, may read on this
// installation.
//
// The server decides and enforces it (SITE_READ_ACCESS; see the services'
// docs/privacy.md) and says which it is in NodeInfo. This reads that, so
// the app does not ask for what it will be refused and then show the
// refusal as an error.
//
// "Visitor" is only ever true once the session has been read. Before
// that there is no telling a visitor from a member whose session is still
// loading, and treating a member as a visitor for a moment would hide
// their own site from them on every reload.

const PUBLIC = 'public';
const PREVIEW = 'preview';
const REGISTERED = 'registered';

const readAccessOf = (state) => {
  const { nodeInfo } = state.app;
  return (nodeInfo && nodeInfo.metadata && nodeInfo.metadata.readAccess) || PUBLIC;
};

const isVisitor = (state) => {
  const { isResolved, isAuthenticated } = state.session;
  return Boolean(isResolved) && !isAuthenticated;
};

// A visitor who is sent only the start of what is public: no comments, no
// lists of who follows whom, nothing past the first page.
const isPreviewVisitor = (state) => {
  return isVisitor(state) && readAccessOf(state) === PREVIEW;
};

// A visitor on a members-only site, who is sent nothing at all.
const isShutOut = (state) => {
  return isVisitor(state) && readAccessOf(state) === REGISTERED;
};

// Whether it is known yet who is looking and what kind of site this is:
// the session has been read, and NodeInfo has answered or failed to.
const isKnown = (state) => {
  return Boolean(state.session.isResolved) && Boolean(state.app.nodeInfoResolved);
};

const STORAGE_KEY = 'site.readAccess';

// What this site said last time, kept in the browser. It is how a page
// can be drawn straight away on an open site, without waiting to be told
// again that it is open, while a site that was restricted last time waits
// for the answer before drawing anything a visitor might be refused.
//
// '' when nothing is remembered, or nothing can be: then the page waits.
const rememberedReadAccess = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
};

const rememberReadAccess = (readAccess) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, readAccess);
  } catch (e) {
    // Not remembered. The next page waits for the answer, which is the
    // safe way round.
  }
};

// The server's way of saying "this needs signing in, on this site": a 401
// whose body says members_only. Told apart from other failures so it can
// be met with a way in and not an error.
//
// Takes whatever a rejected request was rejected with.
const isMembersOnlyRefusal = (reason) => {
  const response = reason && reason.response;
  return Boolean(
    response &&
    response.status === 401 &&
    response.data &&
    response.data.error === 'members_only',
  );
};

export default {
  PUBLIC,
  PREVIEW,
  REGISTERED,
  readAccessOf,
  isVisitor,
  isKnown,
  rememberedReadAccess,
  rememberReadAccess,
  isPreviewVisitor,
  isShutOut,
  isMembersOnlyRefusal,
};
