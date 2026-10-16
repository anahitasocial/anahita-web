# Blocking by a group (item 55)

Decided by the user on 2026-10-16, while finishing item 44
([hiding-replies-across-servers.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/done/hiding-replies-across-servers.md)):
a person's block does not reach the groups they administer, because that
"will really complicate things". A group blocks somebody in its own right,
and one of its administrators does it.

## What there is

The services have it already:

- `POST /socialgraph/<person>/blocks/<group>` makes a block whose source is
  the group. It is allowed to the group's administrators and to site
  administrators (`socialgraph-service/cmd/api/permissions/blocks.go`).
  `DELETE` of the same address lifts it.
- `GET /socialgraph/<group>/blocks/` lists the group's blocks, for the same
  people.
- Since item 44 a group's block hides, for every reader, what the blocked
  person left in the group: their posts there, their replies under the
  group's posts, and their likes of them. It also keeps them out of the
  group as any block keeps somebody away.

The web app has none of it. Block always sends the viewer as the one who
blocks (`src/api/socialgraph.js`), and the Blocked list in settings is the
viewer's own (`containers/actors/Settings/Blocked.jsx`, `viewerOnly`).

## What is to be built

- **Block from the group.** On a post or a reply in a group, the menu of
  somebody who administers the group offers "Block from <group>" beside
  their own Block. It asks first, saying what it does: the person can no
  longer see or take part in the group, and what they left in it is hidden
  from everybody.
- **The group's Blocked list.** In the group's settings, for its
  administrators: who the group has blocked, each with Unblock. The same
  one-line row opening a dialog that a person's settings have.
- **On the blocked person's profile**, for a group's administrator, nothing
  new: blocking from there stays a person's own block.

## Not part of it

- **Telling other servers.** Groups are not on ActivityPub for now (the
  user, 2026-10-16), so a group's block stays here.
- A person's block reaching their groups: decided against.

## Documentation

- `docs/architecture.md`: where blocking is described, the group's block.
- anahita-services `docs/permissions.md`: what a group's block hides, beside
  a person's.
