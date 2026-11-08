import thread from '../thread';

const ROOT = 100;

const reply = (id, parentId, more = {}) => {
  return {
    id,
    parentId,
    rootId: ROOT,
    content: `reply ${id}`,
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

  it('stops indenting past the depth a mobile can show', () => {
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
    const edited = thread.replace(replies(), { id: 2, content: 'changed' });
    const two = edited.find((item) => {
      return item.id === 2;
    });

    expect(two.content).toBe('changed');
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
    expect(gone.content).toBeUndefined();
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

  it('picks out the part of a thread under one reply', () => {
    const branch = [
      { id: 1, parentId: ROOT },
      { id: 2, parentId: 1 },
      { id: 3, parentId: ROOT },
      { id: 4, parentId: 2 },
      { id: 5, parentId: 3 },
    ];

    expect(thread.under(branch, 1).map((each) => {
      return each.id;
    })).toEqual([2, 4]);
    expect(thread.under(branch, 4)).toEqual([]);

    // Arranged from the reply down, as the page that shows it draws them.
    const nested = thread.nest(thread.under(branch, 1), 1);
    expect(nested.length).toBe(1);
    expect(nested[0].reply.id).toBe(2);
    expect(nested[0].children[0].reply.id).toBe(4);
  });
});

describe('the writer\'s chain (roadmap row 126)', () => {
  const ALICE = 1;
  const BOB = 2;
  const writerOf = (each) => {
    return each.writer;
  };
  // Oldest first, as the server sends them.
  const replies = [
    { id: 10, parentId: ROOT, writer: ALICE },
    { id: 11, parentId: ROOT, writer: BOB },
    { id: 12, parentId: 10, writer: ALICE },
    { id: 13, parentId: 10, writer: BOB },
    { id: 14, parentId: 12, writer: ALICE },
    // Alice again under her post: not the earliest, so not the chain.
    { id: 15, parentId: ROOT, writer: ALICE },
  ];

  it('follows the writer\'s earliest reply to each note, from the post', () => {
    const { chain } = thread.chainOf(replies, ROOT, ALICE, writerOf);
    expect(chain.map((each) => {
      return each.id;
    })).toEqual([10, 12, 14]);
  });

  it('leaves everybody else\'s replies, and says which note they answer', () => {
    const { rest, answers } = thread.chainOf(replies, ROOT, ALICE, writerOf);
    expect(rest.map((each) => {
      return each.id;
    })).toEqual([11, 13, 15]);
    expect(answers({ parentId: 10 })).toBe(2);
    expect(answers({ parentId: 12 })).toBe(3);
    expect(answers({ parentId: ROOT })).toBe(0);
  });

  it('stops at a note removed or hidden, and is nothing without a writer', () => {
    const removed = replies.map((each) => {
      return each.id === 12 ? { ...each, deleted: true } : each;
    });
    expect(thread.chainOf(removed, ROOT, ALICE, writerOf).chain.map((each) => {
      return each.id;
    })).toEqual([10]);
    expect(thread.chainOf(replies, ROOT, 0, writerOf).chain).toEqual([]);
  });
});

describe('a conversation, drawn flat (roadmap row 129)', () => {
  // 10 answers the post; 11 answers 10, then 12 answers 11 and 13 answers
  // 12; 14 also answers 11, later, and 15 answers 14; 16 answers 13.
  const replies = [
    reply(10, ROOT),
    reply(11, 10),
    reply(12, 11),
    reply(13, 12),
    reply(14, 11),
    reply(15, 14),
    reply(16, 13),
  ];
  const [top] = thread.nest(replies, ROOT);
  const ids = (steps) => {
    return steps.map((step) => {
      return step.reply.id;
    });
  };

  it('follows the earliest reply at each step, flat', () => {
    const { steps } = thread.conversationOf(top, 10);
    expect(ids(steps)).toEqual([11, 12, 13, 16]);
  });

  it('counts the branch not followed, where it hangs', () => {
    const { steps } = thread.conversationOf(top, 10);
    const atTwelve = steps.find((step) => { return step.reply.id === 12; });
    expect(atTwelve.more).toBe(2);
    expect(atTwelve.moreAt.id).toBe(11);
    expect(steps.find((step) => { return step.reply.id === 11; }).more).toBe(0);
  });

  it('shows three, and counts every reply for the rest', () => {
    const conversation = thread.conversationOf(top);
    expect(ids(conversation.steps)).toEqual([11, 12, 13]);
    expect(conversation.hasMore).toBe(true);
    expect(conversation.total).toBe(6);
  });

  it('is nothing under a reply nobody answered', () => {
    const [alone] = thread.nest([reply(20, ROOT)], ROOT);
    expect(thread.conversationOf(alone)).toEqual({ steps: [], total: 0, hasMore: false });
  });
});
