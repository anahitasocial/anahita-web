// A thread: the replies under a post, as the server sends them and as they
// are drawn.
//
// The server sends every reply in a thread as one flat list, oldest first,
// each naming what it answers (parentId). This arranges them by what answers
// what. Plain functions, with nothing from React or the router, so the
// arranging can be tested on its own.

// How far replies are indented. A long back-and-forth goes deeper than a
// phone is wide, so past this depth replies line up under each other: the
// order still shows who answered whom, and nothing is squeezed off the side.
const MAX_INDENT = 4;

// Arranges a flat list into the replies made directly to the post, each
// carrying the replies made to it, to any depth.
//
// A reply whose parent is not in the list is put at the top level. That
// happens when what it answered was hidden or is beyond what was sent, and
// showing it out of place is better than not showing it.
const nest = (replies, rootId) => {
  const byId = {};
  replies.forEach((reply) => {
    byId[reply.id] = { reply, children: [] };
  });

  const top = [];
  replies.forEach((reply) => {
    const node = byId[reply.id];
    const parent = byId[reply.parentId];
    if (parent && reply.parentId !== rootId) {
      parent.children.push(node);
    } else {
      top.push(node);
    }
  });

  return top;
};

// The thread as most people read it, and what has been hidden from it.
//
// Hidden replies are sent only to whoever looks after the thread, each
// marked, along with everything said under them. They are taken out of the
// thread here and listed apart, by the reply that was hidden, so that the
// thread reads the same to its author as to everybody else.
const split = (replies, rootId) => {
  const shown = replies.filter((reply) => {
    return !reply.hidden;
  });
  const hidden = replies.filter((reply) => {
    return reply.hidden;
  });

  // A hidden branch starts at the reply somebody hid: the one whose parent
  // is not itself hidden.
  const hiddenIds = {};
  hidden.forEach((reply) => {
    hiddenIds[reply.id] = true;
  });
  const branches = hidden.filter((reply) => {
    return !hiddenIds[reply.parentId];
  }).map((start) => {
    return {
      reply: start,
      children: nest(hidden.filter((reply) => {
        return reply.id !== start.id;
      }), start.id).filter((node) => {
        return node.reply.parentId === start.id || hiddenIds[node.reply.parentId];
      }),
    };
  });

  return {
    thread: nest(shown, rootId),
    hidden: branches,
  };
};

// The part of a thread that is under one reply: the replies made to it, the
// replies made to those, and so on. For the page that shows a reply on its
// own, which is sent the whole thread it is in.
//
// The list is oldest first, so a reply always comes after what it answers
// and one pass finds every descendant.
const under = (replies, id) => {
  const inBranch = { [id]: true };
  return replies.filter((reply) => {
    if (reply.id !== id && inBranch[reply.parentId]) {
      inBranch[reply.id] = true;
      return true;
    }
    return false;
  });
};

const indentOf = (depth) => {
  return Math.min(depth, MAX_INDENT);
};

// How many replies there are to read: not the placeholders left where one
// was removed, and not the hidden ones.
const count = (replies) => {
  return replies.filter((reply) => {
    return !reply.deleted && !reply.hidden;
  }).length;
};

const add = (replies, reply) => {
  return [...replies, reply];
};

const replace = (replies, reply) => {
  return replies.map((existing) => {
    return existing.id === reply.id ? { ...existing, ...reply } : existing;
  });
};

// Whether anything in the list answers this reply.
const isAnswered = (replies, id) => {
  return replies.some((reply) => {
    return reply.parentId === id;
  });
};

// The list after a reply is removed. One that has been answered stays, as an
// empty placeholder, so the replies under it still hang from something. One
// that has not simply goes. This is what the server does; doing it here too
// means the thread does not have to be read again to show it.
const remove = (replies, id) => {
  if (isAnswered(replies, id)) {
    return replies.map((reply) => {
      return reply.id === id ? {
        id: reply.id,
        parentId: reply.parentId,
        rootId: reply.rootId,
        createdAt: reply.createdAt,
        deleted: true,
        hidden: reply.hidden,
        authorized: {},
      } : reply;
    });
  }

  return replies.filter((reply) => {
    return reply.id !== id;
  });
};

// The list after a reply is hidden or shown again: it, and everything said
// under it, to any depth.
const setHidden = (replies, id, hidden) => {
  const branch = { [id]: true };
  // Oldest first, so a reply always comes after what it answers and one
  // pass finds every descendant.
  replies.forEach((reply) => {
    if (branch[reply.parentId]) {
      branch[reply.id] = true;
    }
  });

  return replies.map((reply) => {
    return branch[reply.id] ? { ...reply, hidden } : reply;
  });
};

export default {
  MAX_INDENT,
  add,
  count,
  indentOf,
  isAnswered,
  nest,
  remove,
  replace,
  setHidden,
  split,
  under,
};
