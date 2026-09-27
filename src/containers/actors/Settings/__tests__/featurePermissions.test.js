/**
 * @jest-environment node
 */
/* eslint-env jest */
import {
  choicesFor,
  commentLockFor,
  getPermissionGroups,
  toFeatures,
  toValues,
} from '../featurePermissions';

// A person's features as person-service returns them once the response is
// camel-cased: the defaults from graph-grpc-defaults/actor_features, merged.
const FEATURES = [
  {
    service: 'feed-service',
    nodeTypes: [],
    composers: [],
    optional: false,
    enabled: true,
    addPermissions: [],
    ordering: 1,
  },
  {
    service: 'socialgraph-service',
    nodeTypes: [],
    composers: [],
    optional: false,
    enabled: true,
    addPermissions: [{ entity: 'follower', access: 'admins' }],
    ordering: 2,
  },
  {
    service: 'photo-service',
    nodeTypes: ['photo'],
    composers: ['photo'],
    optional: true,
    enabled: true,
    addPermissions: [
      { entity: 'photo', access: 'followers' },
      { entity: 'comment', access: 'followers' },
    ],
    ordering: 4,
  },
  {
    service: 'text-service',
    nodeTypes: ['note'],
    composers: ['note'],
    optional: false,
    enabled: true,
    addPermissions: [
      { entity: 'note', access: 'followers' },
      { entity: 'like', access: 'followers' },
    ],
    ordering: 3,
  },
];

describe('getPermissionGroups', () => {
  it('lists services in profile order and skips ones with nothing to set', () => {
    const groups = getPermissionGroups(FEATURES, { isPerson: false, access: 'public' });

    expect(groups.map((g) => {
      return g.key;
    })).toEqual(['socialgraph', 'text', 'photo']);
  });

  // socialgraph-service lets anybody follow a person before it reads this
  // permission, so on a person the row would change nothing.
  it('hides who can add followers on a person', () => {
    const groups = getPermissionGroups(FEATURES, { isPerson: true, access: 'public' });

    expect(groups.map((g) => {
      return g.key;
    })).toEqual(['text', 'photo']);
  });

  it('leaves out a service that is switched off', () => {
    const features = FEATURES.map((f) => {
      return f.service === 'photo-service' ? { ...f, enabled: false } : f;
    });

    expect(getPermissionGroups(features, { isPerson: true, access: 'public' }).map((g) => {
      return g.key;
    })).toEqual(['text']);
  });

  it('survives an actor with no features', () => {
    expect(getPermissionGroups(undefined, { isPerson: true, access: 'public' })).toEqual([]);
  });
});

// Only values permissions.AddAccessAllows enforces, which are also exactly
// what the server validators accept. Anything else would save and then refuse
// everybody but the owner.
describe('choicesFor', () => {
  const person = { isPerson: true };
  const group = { isPerson: false };

  it('offers registered or followers for comments', () => {
    expect(choicesFor('comment', person)).toEqual(['registered', 'followers']);
    expect(choicesFor('comment', group)).toEqual(['registered', 'followers']);
  });

  it('offers leaders and mutuals to people only', () => {
    expect(choicesFor('like', person)).toEqual(['registered', 'followers', 'leaders', 'mutuals', 'admins']);
    expect(choicesFor('like', group)).toEqual(['registered', 'followers', 'admins']);
    expect(choicesFor('photo', person)).toEqual(['followers', 'leaders', 'mutuals', 'admins']);
    expect(choicesFor('photo', group)).toEqual(['followers', 'admins']);
    expect(choicesFor('follower', group)).toEqual(['followers', 'admins']);
  });

  // MediumPermissions.CanAdd never admits "anyone signed in" to post.
  it('never offers registered for posts', () => {
    expect(choicesFor('note', person)).not.toContain('registered');
    expect(choicesFor('note', group)).not.toContain('registered');
  });
});

// Comments follow the profile's access once it is narrower than registered —
// see permissions.CommentAccess on the server.
describe('commentLockFor', () => {
  it('leaves comments settable on public and registered profiles', () => {
    expect(commentLockFor('public')).toBeNull();
    expect(commentLockFor('registered')).toBeNull();
  });

  it('locks them to followers on a followers-only profile', () => {
    expect(commentLockFor('followers')).toBe('followers');
  });

  it('leaves them to whoever can read on anything narrower', () => {
    ['leaders', 'mutuals', 'admins', 'myself'].forEach((access) => {
      expect(commentLockFor(access)).toBe('readers');
    });
  });

  it('marks only the comment rows', () => {
    const groups = getPermissionGroups(FEATURES, { isPerson: true, access: 'followers' });
    const photo = groups.find((g) => {
      return g.key === 'photo';
    });

    expect(photo.rows.map((r) => {
      return [r.entity, r.lock];
    })).toEqual([['photo', null], ['comment', 'followers']]);
  });
});

// A value saved before the lists narrowed still shows instead of a blank select.
it('keeps a stored value that is no longer offered', () => {
  const features = [{
    ...FEATURES[3],
    addPermissions: [{ entity: 'like', access: 'admins' }],
  }];
  const [text] = getPermissionGroups(features, { isPerson: false, access: 'public' });

  expect(text.rows[0].choices).toEqual(['registered', 'followers', 'admins']);

  const [comment] = getPermissionGroups([{
    ...FEATURES[3],
    addPermissions: [{ entity: 'comment', access: 'admins' }],
  }], { isPerson: true, access: 'public' });
  expect(comment.rows[0].choices).toEqual(['registered', 'followers', 'admins']);
});

describe('toFeatures', () => {
  it('folds edits into the full list and keeps the rest as they were', () => {
    const values = toValues(FEATURES);
    values['text-service'].note = 'admins';

    const features = toFeatures(FEATURES, values);

    // Every feature goes back: the server stores the request wholesale, and
    // one left out would be stored without its enabled flag.
    expect(features).toHaveLength(FEATURES.length);
    expect(features.find((f) => {
      return f.service === 'text-service';
    }).addPermissions).toEqual([
      { entity: 'note', access: 'admins' },
      { entity: 'like', access: 'followers' },
    ]);
    expect(features.find((f) => {
      return f.service === 'photo-service';
    })).toEqual(FEATURES[2]);
  });

  // The follower row is hidden on a person but must still be sent.
  it('keeps permissions the tab does not show', () => {
    const features = toFeatures(FEATURES, {});

    expect(features.find((f) => {
      return f.service === 'socialgraph-service';
    }).addPermissions).toEqual([{ entity: 'follower', access: 'admins' }]);
  });
});
