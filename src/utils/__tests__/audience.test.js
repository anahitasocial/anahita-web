/* eslint-env jest */
import audience from '../audience';

const PERSON = 'node.actor.person-service.person.v1';
const GROUP = 'node.actor.group-service.group.v1';

const viewer = { id: 7 };
const own = { id: 7, type: PERSON, access: 'public' };
const someone = { id: 8, type: PERSON, access: 'public' };
const group = { id: 20, type: GROUP, access: 'public' };
const adminned = { ...group, authorized: { administration: true } };

const levels = (options) => {
  return options.map((option) => {
    return option.level;
  });
};

const enabled = (options) => {
  return levels(options.filter((option) => {
    return !option.disabled;
  }));
};

describe('composer audience', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // The server sends what a post here may be shown to, and that is what
  // is offered: not a second copy of its rule.
  it('offers what the server says, without "leaders"', () => {
    const answered = {
      ...group,
      authorized: { audiences: ['public', 'followers', 'leaders', 'admins'] },
    };

    expect(audience.levelsFor(answered, viewer)).toEqual(['public', 'followers', 'admins']);
  });

  it('falls back to the rule it knows when the server does not say', () => {
    expect(audience.levelsFor({ ...group, authorized: {} }, viewer))
      .toEqual(['public', 'registered', 'followers']);
    expect(audience.levelsFor({ ...group, authorized: { audiences: [] } }, viewer))
      .toEqual(['public', 'registered', 'followers']);
  });

  it('knows the rule for each kind of place', () => {
    expect(audience.levelsFor(own, viewer))
      .toEqual(['public', 'registered', 'followers', 'mutuals', 'myself']);
    expect(audience.levelsFor(group, viewer))
      .toEqual(['public', 'registered', 'followers']);
    expect(audience.levelsFor(adminned, viewer))
      .toEqual(['public', 'registered', 'followers', 'admins']);
  });

  // That would be a post only the two of you can see: a private message.
  it('has no "only me" on somebody else\'s profile', () => {
    expect(audience.levelsFor(someone, viewer)).not.toContain('myself');
  });

  it('never offers a group "mutuals" or "only me"', () => {
    expect(audience.levelsFor(adminned, viewer)).not.toContain('mutuals');
    expect(audience.levelsFor(adminned, viewer)).not.toContain('myself');
  });

  // A reader has to get past the profile before the post, so a wider
  // post is not seen more widely. Shown, so it is clear why; not
  // choosable.
  it('disables what is wider than the profile itself', () => {
    const options = audience.optionsFor({ ...group, access: 'followers' }, viewer);

    expect(levels(options)).toEqual(['public', 'registered', 'followers']);
    expect(enabled(options)).toEqual(['followers']);
  });

  describe('for a post that exists', () => {
    const post = (extra) => {
      return {
        id: 100,
        access: 'public',
        owner: own,
        author: own,
        ...extra,
      };
    };

    it('offers what the server sends with the post', () => {
      const options = audience.optionsForMedium(post({
        authorized: { audiences: ['public', 'registered', 'followers', 'leaders', 'mutuals', 'myself'] },
      }));

      expect(levels(options)).toEqual(['public', 'registered', 'followers', 'mutuals', 'myself']);
    });

    // An administrator changing somebody's post sees that person's
    // choices: "only me" depends on who wrote it.
    it('judges "only me" by the author when the server does not say', () => {
      expect(levels(audience.optionsForMedium(post({})))).toContain('myself');
      expect(levels(audience.optionsForMedium(post({ author: someone }))))
        .not.toContain('myself');
    });

    it('keeps the audience the post has now, even one no longer offered', () => {
      const options = audience.optionsForMedium(post({
        access: 'leaders',
        authorized: { audiences: ['public', 'registered', 'followers', 'leaders', 'mutuals'] },
      }));

      expect(levels(options)).toEqual(['public', 'registered', 'followers', 'leaders', 'mutuals']);
    });

    it('never disables the audience the post has now', () => {
      const options = audience.optionsForMedium(post({
        access: 'public',
        owner: { ...group, access: 'followers' },
        author: someone,
      }));

      expect(enabled(options)).toEqual(['public', 'followers']);
    });
  });

  it('starts on the widest that can be chosen', () => {
    expect(audience.defaultFor(own, viewer)).toBe('public');
    expect(audience.defaultFor({ ...group, access: 'followers' }, viewer)).toBe('followers');
    expect(audience.defaultFor({ ...own, access: 'registered' }, viewer)).toBe('registered');
  });

  it('remembers the last choice for that kind of place only', () => {
    audience.remember(own, viewer, 'followers');

    expect(audience.defaultFor(own, viewer)).toBe('followers');
    // A group is a different kind of place, and so is another person's
    // profile.
    expect(audience.defaultFor(group, viewer)).toBe('public');
    expect(audience.defaultFor(someone, viewer)).toBe('public');
  });

  it('keeps one person\'s choice from the next person on the same browser', () => {
    audience.remember(own, viewer, 'myself');

    const other = { id: 9 };
    expect(audience.defaultFor({ ...own, id: 9 }, other)).toBe('public');
  });

  it('forgets a remembered choice that cannot be made here', () => {
    audience.remember(adminned, viewer, 'admins');

    // The same person, in a group they do not administer.
    expect(audience.defaultFor(group, viewer)).toBe('public');

    // Remembered "public", on a group that has since become
    // followers-only.
    audience.remember(group, viewer, 'public');
    expect(audience.defaultFor({ ...group, access: 'followers' }, viewer)).toBe('followers');
  });

  it('works when storage holds something else, or nothing can be stored', () => {
    window.localStorage.setItem('composer.audience', 'not json');
    expect(audience.defaultFor(own, viewer)).toBe('public');
    expect(() => {
      audience.remember(own, viewer, 'followers');
    }).not.toThrow();
  });
});
