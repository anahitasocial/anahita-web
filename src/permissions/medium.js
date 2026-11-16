import nodePermissions from './node';
import utils from '../utils';
import warnings from '../utils/warnings';

const canEdit = (viewer, medium) => {
  return nodePermissions.canEdit(viewer, medium);
};

const canAdd = (viewer, owner) => {
  return nodePermissions.canAdd(viewer, owner);
};

const canDelete = (viewer, medium) => {
  return nodePermissions.canDelete(viewer, medium);
};

// A site administrator gives a post a content warning as a moderator when
// they did not write it (anahita-services row 122, phase 4): on any post,
// a reply or one from another server too, and its author may not take it
// off. Mirrors anahita-libs handlers.IsWarningModerator.
const isWarningModerator = (viewer, medium) => {
  if (!utils.node.isAdmin(viewer) || !medium) {
    return false;
  }
  const authorId = medium.author ? medium.author.id : 0;
  return authorId !== viewer.id;
};

// Whether the viewer may give a post its warning, change it or take it off:
// a moderator; or whoever may edit it, on a post made here, unless the
// administrators gave the one it has.
const canSetWarning = (viewer, medium) => {
  if (isWarningModerator(viewer, medium)) {
    return true;
  }
  return canEdit(viewer, medium) && !utils.federation.isRemote(medium) &&
    !warnings.of(medium).byModerator;
};

export default {
  isWarningModerator,
  canSetWarning,
  canAdd,
  canEdit,
  canDelete,
};
