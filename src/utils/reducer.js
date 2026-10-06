import _ from 'lodash';

// The shape every list slice has. Defaulted here because a parent can be
// written to before anything has browsed it — tagging a location adds to a
// slice the gadget never fills in, and `{ ...undefined }.byId` is undefined,
// which threw before the add could resolve.
const emptyList = () => {
  return {
    byId: {},
    allIds: [],
  };
};

const editItem = (list, item, defaultItem) => {
  const items = {
    ...emptyList(),
    ...list,
  };

  // Replaced, not written through. The spread above is shallow, so byId and
  // allIds were still the previous state's own objects and both helpers
  // edited them in place — mutating the state redux had already handed out.
  items.byId = {
    ...items.byId,
    [item.id]: item,
  };
  items.allIds = _.union(items.allIds, [item.id]);
  items.current = {
    ...defaultItem,
    ...item,
  };

  return items;
};

// The list after a post was pinned or unpinned.
//
// A profile has one pin, so pinning a post takes the pin from whichever
// post on that profile had it. The server does that; this does the same to
// the copies held here, so the old one does not go on saying it is pinned.
// Works on any list of posts or of feed items: a feed item that is a repost
// is left alone, the mark is on posts.
//
// Returns the same list when nothing in it changes.
const pinChanged = (list, node) => {
  if (!list || !list.byId || !node || !node.id) {
    return list;
  }

  const ownerId = node.owner && node.owner.id;
  const byId = { ...list.byId };
  let changed = false;

  Object.keys(byId).forEach((key) => {
    const item = byId[key];
    if (!item) {
      return;
    }

    if (item.id === node.id) {
      if (Boolean(item.pinned) !== Boolean(node.pinned)) {
        byId[key] = { ...item, pinned: Boolean(node.pinned) };
        changed = true;
      }
      return;
    }

    const sameProfile = ownerId && item.owner && item.owner.id === ownerId;
    if (node.pinned && sameProfile && item.pinned) {
      byId[key] = { ...item, pinned: false };
      changed = true;
    }
  });

  if (!changed) {
    return list;
  }

  const current = list.current && byId[list.current.id] ?
    { ...list.current, pinned: byId[list.current.id].pinned } :
    list.current;

  return { ...list, byId, current };
};

// The list after the viewer saved a post, or took it out of what they
// saved: the mark on that post, wherever it is in the list, and on a post a
// feed item reposts. Returns the same list when nothing in it changes.
const savedChanged = (list, id, saved) => {
  if (!list || !list.byId || !id) {
    return list;
  }

  const byId = { ...list.byId };
  let changed = false;

  Object.keys(byId).forEach((key) => {
    const item = byId[key];
    if (!item) {
      return;
    }

    if (item.id === id && Boolean(item.isSavedByViewer) !== Boolean(saved)) {
      byId[key] = { ...item, isSavedByViewer: Boolean(saved) };
      changed = true;
    }

    const { parent } = item;
    if (parent && parent.id === id && Boolean(parent.isSavedByViewer) !== Boolean(saved)) {
      byId[key] = {
        ...byId[key],
        parent: { ...parent, isSavedByViewer: Boolean(saved) },
      };
      changed = true;
    }
  });

  if (!changed) {
    return list;
  }

  const current = list.current && list.current.id === id ?
    { ...list.current, isSavedByViewer: Boolean(saved) } :
    list.current;

  return { ...list, byId, current };
};

const deleteItem = (list, item, defaultItem) => {
  const items = {
    ...emptyList(),
    ...list,
  };

  items.byId = _.omit(items.byId, [item.id]);
  items.allIds = items.allIds.filter((id) => {
    return id !== item.id;
  });
  items.current = { ...defaultItem };

  return items;
};

export default {
  editItem,
  deleteItem,
  pinChanged,
  savedChanged,
};
