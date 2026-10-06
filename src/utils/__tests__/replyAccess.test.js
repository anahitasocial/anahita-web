import replyAccess from '../replyAccess';

describe('replyAccess', () => {
  it('reads a post that says nothing as anyone', () => {
    expect(replyAccess.normalize(undefined)).toBe('anyone');
    expect(replyAccess.normalize('')).toBe('anyone');
    expect(replyAccess.normalize('anyone')).toBe('anyone');
    expect(replyAccess.normalize('something else')).toBe('anyone');
  });

  it('keeps groups in the order the server stores them', () => {
    expect(replyAccess.normalize('mentioned,followers')).toBe('followers,mentioned');
    expect(replyAccess.groupsOf('nobody')).toEqual([]);
  });

  it('turns a value into the two questions the dialog asks, and back', () => {
    ['anyone', 'nobody', 'followers', 'following,mentioned', 'followers,following,mentioned'].forEach((value) => {
      expect(replyAccess.fromChoice(replyAccess.toChoice(value))).toBe(value);
    });
  });

  it('reads nobody with a box ticked as that group', () => {
    expect(replyAccess.fromChoice({ anyone: false, mentioned: true })).toBe('mentioned');
    expect(replyAccess.fromChoice({ anyone: false })).toBe('nobody');
  });

  it('ignores the boxes when anyone is chosen', () => {
    expect(replyAccess.fromChoice({ anyone: true, followers: true })).toBe('anyone');
  });

  it('sends nothing with a new post that anyone may reply to', () => {
    expect(replyAccess.toRequest('anyone')).toEqual({});
    expect(replyAccess.toRequest('nobody')).toEqual({ reply_access: 'nobody' });
    expect(replyAccess.toRequest('mentioned,followers')).toEqual({ reply_access: 'followers,mentioned' });
  });

  it('names a value in one of three short ways', () => {
    expect(replyAccess.labelKey('')).toBe('replies:access.short.anyone');
    expect(replyAccess.labelKey('nobody')).toBe('replies:access.short.nobody');
    expect(replyAccess.labelKey('following')).toBe('replies:access.short.some');
    expect(replyAccess.isLimited('following')).toBe(true);
    expect(replyAccess.isLimited('anyone')).toBe(false);
  });

  it('says who may reply in a sentence', () => {
    const t = (key, vars) => {
      return vars ? `${key}(${vars.groups})` : key;
    };
    expect(replyAccess.summary('nobody', t)).toBe('replies:access.summary.nobody');
    expect(replyAccess.summary('followers,mentioned', t)).toBe(
      'replies:access.summary.some(replies:access.summary.followersreplies:access.summary.orreplies:access.summary.mentioned)',
    );
  });
});
