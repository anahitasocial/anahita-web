import _ from 'lodash';
import utils from '../utils';

const {
  isAdmin,
  isSuperAdmin,
} = utils.node;

const canEdit = (viewer, node) => {
  // What came from another server is its author's to change, there.
  // Nobody here changes it, and the server refuses it.
  if (utils.federation.isRemote(node)) {
    return false;
  }

  if (node.authorized && node.authorized.edit) {
    return true;
  }

  if (isSuperAdmin(viewer) || isAdmin(viewer)) {
    return true;
  }

  if (node.administrators) {
    const admins = node.administrators || [];
    if (_.find(admins, (admin) => {
      return admin.id === viewer.id;
    })) {
      return true;
    }
  }

  if (node.owner && node.owner.id === viewer.id) {
    return true;
  }

  if (node.author && node.author.id === viewer.id) {
    return true;
  }

  return false;
};

// Whether the viewer may tie a location to a profile or a post, as
// location-service decides it: administrators; the post's author or owner;
// a person on their own profile, which has neither but itself; and whoever
// looks after a group, a website or an event.
const canAdd = (viewer, node = null) => {
  if (isSuperAdmin(viewer) || isAdmin(viewer)) {
    return true;
  }

  if (!node || !viewer || !viewer.id) {
    return false;
  }

  if (node.id === viewer.id) {
    return true;
  }

  const own = (who) => {
    return Boolean(who) && who.id === viewer.id;
  };
  if (own(node.owner) || own(node.author)) {
    return true;
  }

  return Boolean(node.authorized && node.authorized.administration);
};

const canDelete = (viewer, node) => {
  if (node.authorized && node.authorized.delete) {
    return true;
  }

  if (isSuperAdmin(viewer) || isAdmin(viewer)) {
    return true;
  }

  if (node.owner && node.owner.id === viewer.id) {
    return true;
  }

  return false;
};

const canAdminister = (viewer) => {
  return isSuperAdmin(viewer) || isAdmin(viewer);
};

export default {
  canAdd,
  canAdminister,
  canEdit,
  canDelete,
};
