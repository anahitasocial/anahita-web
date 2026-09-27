// What the Permissions tab shows and what it sends back.
//
// The defaults live server side, in graph-grpc-defaults/actor_features, and
// arrive already merged into actor.features — an actor that has never saved
// this tab reads exactly the defaults. Saving stores the whole feature list as
// that actor's override; restoring sends an empty list, which the server
// stores as "no override" so the defaults apply again.
//
// JSX-free for the same reason as sections.js: it can be read and tested as
// data.

// Every choice here is one permissions.AddAccessAllows enforces, and the
// server validators accept exactly these. A value that saved but matched
// nothing would refuse everybody but the owner, with nothing to say why.
//
// People have leaders and mutuals; a group follows nobody, so for a group
// they would match nobody. "admins" on a person is the person themselves.
const CHOICES = {
  person: {
    comment: ['registered', 'followers'],
    like: ['registered', 'followers', 'leaders', 'mutuals', 'admins'],
    content: ['followers', 'leaders', 'mutuals', 'admins'],
  },
  group: {
    comment: ['registered', 'followers'],
    like: ['registered', 'followers', 'admins'],
    content: ['followers', 'admins'],
    follower: ['followers', 'admins'],
  },
};

// Who can add somebody else as a follower. Only groups are gated by it —
// socialgraph-service lets anybody follow a person before it reads this — so
// on a person it would be a row with no effect.
const FOLLOWER = 'follower';
const COMMENT = 'comment';

// The profile access levels on which the comment setting applies. On anything
// narrower the profile's access decides — see permissions.CommentAccess.
const OPEN_ACCESS = ['public', 'registered'];

export const choicesFor = (entity, { isPerson }) => {
  const table = isPerson ? CHOICES.person : CHOICES.group;
  return table[entity] || table.content;
};

// Why a comment row cannot be set, or null when it can.
//
//   followers — a followers-only profile has followers-only comments
//   readers   — a narrower profile: whoever can see it can comment
export const commentLockFor = (actorAccess) => {
  if (!actorAccess || OPEN_ACCESS.includes(actorAccess)) {
    return null;
  }

  return actorAccess === 'followers' ? 'followers' : 'readers';
};

// 'text-service' -> 'text', the key the features language file uses.
export const serviceKey = (service) => {
  return service.replace(/-service$/, '');
};

// The editable rows, grouped by service in the order the profile shows them.
// A service that is switched off, or has nothing to set, is left out rather
// than rendered as an empty heading.
export const getPermissionGroups = (features = [], { isPerson, access }) => {
  const commentLock = commentLockFor(access);

  return [...(features || [])]
    .filter((feature) => {
      return feature.enabled;
    })
    .sort((a, b) => {
      return a.ordering - b.ordering;
    })
    .map((feature) => {
      const rows = (feature.addPermissions || [])
        .filter((permission) => {
          return !(isPerson && permission.entity === FOLLOWER);
        })
        .map((permission) => {
          const choices = choicesFor(permission.entity, { isPerson });

          return {
            entity: permission.entity,
            access: permission.access,
            // A stored value outside the list — saved before the list was
            // narrowed — still shows, rather than leaving the select blank.
            choices: choices.includes(permission.access) ?
              choices :
              [...choices, permission.access],
            lock: permission.entity === COMMENT ? commentLock : null,
          };
        });

      return {
        service: feature.service,
        key: serviceKey(feature.service),
        rows,
      };
    })
    .filter((group) => {
      return group.rows.length > 0;
    });
};

// Local form state: { [service]: { [entity]: access } }.
export const toValues = (features = []) => {
  return (features || []).reduce((values, feature) => {
    return {
      ...values,
      [feature.service]: (feature.addPermissions || []).reduce((acc, p) => {
        return { ...acc, [p.entity]: p.access };
      }, {}),
    };
  }, {});
};

// The full feature list with the edited access values folded in.
//
// Every feature goes back, not only the changed ones: the server stores the
// request as the actor's override wholesale, and its enabled flag is a plain
// bool, so a feature sent without it would be stored switched off.
//
// Fields are listed rather than spread so nothing the server does not expect
// rides along.
export const toFeatures = (features = [], values = {}) => {
  return (features || []).map((feature) => {
    const edited = values[feature.service] || {};

    return {
      service: feature.service,
      nodeTypes: feature.nodeTypes || [],
      composers: feature.composers || [],
      optional: Boolean(feature.optional),
      enabled: Boolean(feature.enabled),
      addPermissions: (feature.addPermissions || []).map((permission) => {
        return {
          entity: permission.entity,
          access: edited[permission.entity] || permission.access,
        };
      }),
      ordering: feature.ordering,
    };
  });
};
