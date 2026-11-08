import utils from '../utils';
import meetsRoleLevel from './roleLevel';

// Whether the viewer may create an actor — a group, today.
//
// Mirrors anahita-libs ActorsPermissions.CanAdd and group-service's
// Config.MayCreateGroup. Who may create one is a SERVER SETTING, GROUPS_FROM,
// naming a minimum role of registered, administrators or super-administrators,
// so it cannot be derived from the viewer alone. It arrives through NodeInfo
// as metadata.groupsFrom.
//
// This used to be a bare isAdmin with a @TODO saying a field was needed to
// decide it properly. The field is groupsFrom, and it is compared by rank with
// no administrator shortcut above it — one would make `super-administrators` a
// level that does nothing.
//
// Absent until NodeInfo answers, which ranks above every role, so nothing
// offers to create a group before the server has said who may.
const canAdd = (viewer, { groupsFrom = '' } = {}) => {
  return meetsRoleLevel(viewer, groupsFrom);
};

// Whether the viewer may make an event of their own: the installation's
// EVENTS_FROM, published in NodeInfo as eventsFrom. A setting of its own,
// since an installation may keep groups to its administrators and let
// anybody hold an event. Absent, as before NodeInfo answers, it ranks above
// every role and nobody is offered the +.
//
// An event for a group is not this: that is for the group's administrators.
const canAddEvent = (viewer, { eventsFrom = '' } = {}) => {
  return meetsRoleLevel(viewer, eventsFrom);
};

// Whether the viewer may connect a website as a website: the installation's
// WEBSITES_FROM, published in NodeInfo as websitesFrom, administrators unless it
// says otherwise. syndication-service enforces the same.
const canConnect = (viewer, { websitesFrom = '' } = {}) => {
  return meetsRoleLevel(viewer, websitesFrom);
};

const canEdit = (actor) => {
  const { authorized } = actor;
  return Boolean(authorized && authorized.edit);
};

const canDelete = (actor) => {
  const { authorized } = actor;
  return Boolean(authorized && authorized.delete);
};

const canAdminister = (actor) => {
  const { authorized } = actor;
  return Boolean(authorized && authorized.administration);
};

// Not somebody the viewer has blocked: the block is lifted first. It asked
// `isBlocked`, twice, which nothing sends.
const canFollow = (actor, viewer) => {
  return Boolean(actor) && actor.id !== viewer.id && !actor.isBlockedByViewer;
};

const canBlock = (actor, viewer) => {
  return utils.node.isPerson(actor) && actor.id !== viewer.id;
};

// A person, here or elsewhere, not the viewer, and not blocked by them: a
// block hides more than a mute (roadmap row 133).
const canMute = (actor, viewer) => {
  return Boolean(actor) && canBlock(actor, viewer) && !actor.isBlockedByViewer;
};

// Whether the viewer may feature an actor for onboarding. A statement by the
// installation rather than by any one group's administrators, so super
// administrators only — the same rule the server enforces.
const canFeature = (actor, viewer) => {
  return utils.node.isSuperAdmin(viewer) && Boolean(actor && actor.id);
};

export default {
  canAdd,
  canAddEvent,
  canConnect,
  canAdminister,
  canEdit,
  canDelete,
  canFollow,
  canBlock,
  canMute,
  canFeature,
};
