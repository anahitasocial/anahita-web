/* eslint-env jest */
import replyOrder from '../replyOrder';
import thread from '../thread';

const ROOT = 100;
const reply = (id, parentId) => { return { id, parentId, rootId: ROOT }; };
const ids = (nodes) => { return nodes.map((node) => { return node.reply.id; }); };

describe('replyOrder', () => {
  const nodes = thread.nest([reply(1, ROOT), reply(2, 1), reply(3, 1), reply(4, ROOT)], ROOT);

  it('puts the newest reply to the post first', () => {
    expect(ids(replyOrder.arrange(nodes, replyOrder.NEWEST))).toEqual([4, 1]);
  });

  it('keeps what answers a reply oldest first, so it reads in order', () => {
    const [, first] = replyOrder.arrange(nodes, replyOrder.NEWEST);
    expect(ids(first.children)).toEqual([2, 3]);
  });

  it('leaves the thread as it came when asked for the oldest first', () => {
    expect(ids(replyOrder.arrange(nodes, replyOrder.OLDEST))).toEqual([1, 4]);
  });

  it('does not change what it is given', () => {
    replyOrder.arrange(nodes, replyOrder.NEWEST);
    expect(ids(nodes)).toEqual([1, 4]);
  });

  it('remembers the choice, and starts with the newest', () => {
    window.localStorage.removeItem('replies.order');
    expect(replyOrder.load()).toBe(replyOrder.NEWEST);
    replyOrder.save(replyOrder.OLDEST);
    expect(replyOrder.load()).toBe(replyOrder.OLDEST);
    window.localStorage.removeItem('replies.order');
  });
});
