import thread from '../thread';

const ROOT = 100;

const reply = (id, parentId, more = {}) => {
  return {
    id,
    parentId,
    rootId: ROOT,
    body: `reply ${id}`,
    ...more,
  };
};

const shape = (nodes) => {
  return nodes.map((node) => {
    return node.children.length ?
      `${node.reply.id}[${shape(node.children)}]` :
      `${node.reply.id}`;
  }).join(',');
};

describe('arranging a thread', () => {
  it('puts each reply under what it answers, to any depth, in the order sent', () => {
    const replies = [
      reply(1, ROOT),
      reply(2, 1),
      reply(3, ROOT),
      reply(4, 2),
      reply(5, 1),
    ];

    expect(shape(thread.nest(replies, ROOT))).toBe('1[2[4],5],3');
  });

  it('shows a reply at the top when what it answered was not sent', () => {
    const replies = [reply(1, ROOT), reply(7, 999)];

    expect(shape(thread.nest(replies, ROOT))).toBe('1,7');
  });

  it('is empty for a post nobody has answered', () => {
    expect(thread.nest([], ROOT)).toEqual([]);
  });

  it('stops indenting past the depth a phone can show', () => {
    expect(thread.indentOf(0)).toBe(0);
    expect(thread.indentOf(3)).toBe(3);
    expect(thread.indentOf(12)).toBe(thread.MAX_INDENT);
  });
});

describe('what is hidden from a thread', () => {
  const replies = [
    reply(1, ROOT),
    reply(2, ROOT, { hidden: true }),
    reply(3, 2, { hidden: true }),
    reply(4, 3, { hidden: true }),
    reply(5, 1),
    reply(6, ROOT, { hidden: true }),
  ];

  it('is taken out of the thread, with everything under it', () => {
    const { thread: shown } = thread.split(replies, ROOT);

    expect(shape(shown)).toBe('1[5]');
  });

  it('is listed apart, by the reply that was hidden', () => {
    const { hidden } = thread.split(replies, ROOT);

    expect(shape(hidden)).toBe('2[3[4]],6');
  });

  it('leaves a thread with nothing hidden as it is', () => {
    const { thread: shown, hidden } = thread.split([reply(1, ROOT), reply(2, 1)], ROOT);

    expect(shape(shown)).toBe('1[2]');
    expect(hidden).toEqual([]);
  });
});

describe('counting replies', () => {
  it('leaves out what was removed and what is hidden', () => {
    const replies = [
      reply(1, ROOT),
      reply(2, ROOT, { deleted: true }),
      reply(3, 2),
      reply(4, ROOT, { hidden: true }),
    ];

    expect(thread.count(replies)).toBe(2);
  });
});

describe('changing a thread without reading it again', () => {
  const replies = () => {
    return [reply(1, ROOT), reply(2, 1), reply(3, 2), reply(4, ROOT)];
  };

  it('adds a new reply at the end', () => {
    const more = thread.add(replies(), reply(9, 4));

    expect(shape(thread.nest(more, ROOT))).toBe('1[2[3]],4[9]');
  });

  it('takes in an edited reply and keeps what the edit did not send', () => {
    const edited = thread.replace(replies(), { id: 2, body: 'changed' });
    const two = edited.find((item) => {
      return item.id === 2;
    });

    expect(two.body).toBe('changed');
    expect(two.parentId).toBe(1);
  });

  it('removes a reply nobody answered', () => {
    const fewer = thread.remove(replies(), 4);

    expect(shape(thread.nest(fewer, ROOT))).toBe('1[2[3]]');
  });

  it('leaves an empty placeholder where an answered reply was', () => {
    const fewer = thread.remove(replies(), 2);
    const gone = fewer.find((item) => {
      return item.id === 2;
    });

    // What was under it is still under it.
    expect(shape(thread.nest(fewer, ROOT))).toBe('1[2[3]],4');
    expect(gone.deleted).toBe(true);
    expect(gone.body).toBeUndefined();
    expect(gone.author).toBeUndefined();
  });

  it('hides a reply with everything under it, and shows it all again', () => {
    const hidden = thread.setHidden(replies(), 1, true);

    expect(hidden.filter((item) => {
      return item.hidden;
    }).map((item) => {
      return item.id;
    })).toEqual([1, 2, 3]);

    const shown = thread.setHidden(hidden, 1, false);
    expect(shown.some((item) => {
      return item.hidden;
    })).toBe(false);

    // The list it was given is not changed.
    expect(replies().some((item) => {
      return item.hidden;
    })).toBe(false);
  });
});
