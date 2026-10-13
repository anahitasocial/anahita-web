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

const canAdd = (viewer, node = null) => {
  if (isSuperAdmin(viewer) || isAdmin(viewer)) {
    return true;
  }

  if (node && node.owner && viewer.id === node.owner.id) {
    return true;
  }

  return false;
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
