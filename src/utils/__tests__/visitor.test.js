/* eslint-env jest */
import visitor from '../visitor';

const state = (readAccess, session) => {
  return {
    app: {
      nodeInfo: readAccess ? { metadata: { readAccess } } : null,
      nodeInfoResolved: true,
    },
    session: { isResolved: true, isAuthenticated: false, ...session },
  };
};

describe('visitor', () => {
  it('is somebody not signed in, once the session has been read', () => {
    expect(visitor.isVisitor(state('public'))).toBe(true);
    expect(visitor.isVisitor(state('public', { isAuthenticated: true }))).toBe(false);
  });

  // A member whose session is still loading must not be shown the door.
  it('is nobody while the session is still being read', () => {
    const loading = { isResolved: false, isAuthenticated: false };

    expect(visitor.isVisitor(state('registered', loading))).toBe(false);
    expect(visitor.isShutOut(state('registered', loading))).toBe(false);
    expect(visitor.isPreviewVisitor(state('preview', loading))).toBe(false);
  });

  it('tells the three kinds of site apart', () => {
    expect(visitor.isPreviewVisitor(state('preview'))).toBe(true);
    expect(visitor.isShutOut(state('preview'))).toBe(false);

    expect(visitor.isShutOut(state('registered'))).toBe(true);
    expect(visitor.isPreviewVisitor(state('registered'))).toBe(false);

    expect(visitor.isShutOut(state('public'))).toBe(false);
    expect(visitor.isPreviewVisitor(state('public'))).toBe(false);
  });

  it('treats a site that has not said as open', () => {
    expect(visitor.readAccessOf(state(null))).toBe('public');
    expect(visitor.isShutOut(state(null))).toBe(false);
  });

  it('never restricts somebody who is signed in', () => {
    const member = { isAuthenticated: true };

    expect(visitor.isShutOut(state('registered', member))).toBe(false);
    expect(visitor.isPreviewVisitor(state('preview', member))).toBe(false);
  });

  // A page that could be refused is not drawn until both are in.
  it('knows nothing until the session and the site have both answered', () => {
    expect(visitor.isKnown(state('registered'))).toBe(true);
    expect(visitor.isKnown(state('registered', { isResolved: false }))).toBe(false);

    const waiting = state('registered');
    waiting.app.nodeInfoResolved = false;
    expect(visitor.isKnown(waiting)).toBe(false);
  });

  it('remembers what the site said last time', () => {
    window.localStorage.clear();
    expect(visitor.rememberedReadAccess()).toBe('');

    visitor.rememberReadAccess('registered');
    expect(visitor.rememberedReadAccess()).toBe('registered');
  });

  it('knows the server saying "sign in first" from other failures', () => {
    const refusal = (status, error) => {
      return { response: { status, data: { error } } };
    };

    expect(visitor.isMembersOnlyRefusal(refusal(401, 'members_only'))).toBe(true);
    expect(visitor.isMembersOnlyRefusal(refusal(401, 'unauthorized'))).toBe(false);
    expect(visitor.isMembersOnlyRefusal(refusal(403, 'members_only'))).toBe(false);
    expect(visitor.isMembersOnlyRefusal(new Error('network'))).toBe(false);
    expect(visitor.isMembersOnlyRefusal(undefined)).toBe(false);
  });
});
