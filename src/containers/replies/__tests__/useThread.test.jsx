/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';

import api from '../../../api';
import i18n from '../../../languages';
import useThread from '../useThread';

vi.mock('../../../api', () => {
  return {
    default: {
      replies: {
        thread: vi.fn(),
        add: vi.fn(),
        edit: vi.fn(),
        deleteItem: vi.fn(),
        setHidden: vi.fn(),
      },
      likes: { add: vi.fn(), deleteItem: vi.fn() },
      warnings: { edit: vi.fn() },
      socialgraph: { block: vi.fn() },
      federation: {
        settings: () => { return Promise.resolve({ data: { enabled: true } }); },
        blueskySettings: () => { return Promise.resolve({ data: { connected: true } }); },
      },
    },
  };
});

// The alerts, as the store is told them; the rest of the actions are not
// this hook's.
vi.mock('../../../actions', () => {
  const alert = (severity) => {
    return (body) => { return { type: 'ALERT', severity, body }; };
  };
  return {
    default: { app: { alert: { success: alert('success'), error: alert('error') } } },
  };
});

// The post's writer, somebody answering, and the viewer.
const writer = { id: 1, name: 'Amos Burton' };
const other = { id: 2, name: 'Naomi Nagata' };
const viewer = { id: 3, name: 'Roy Trenneman', language: 'en' };
const root = { id: 100, author: writer, owner: { id: 50, name: 'Rocinante' } };

const reply = (id, parentId, author, more = {}) => {
  return {
    id, parentId, author, ...more,
  };
};

// The session in a store of its own; what the hook dispatches is written
// down, the alerts among it.
const sessionStore = (session = {}) => {
  const dispatched = [];
  const state = {
    session: {
      viewer, isAuthenticated: true, isResolved: true, ...session,
    },
    app: { nodeInfo: { metadata: { readAccess: 'preview' } } },
  };
  const store = createStore((current = state, action) => {
    dispatched.push(action);
    return current;
  });
  return { store, dispatched };
};

const alertsIn = (dispatched) => {
  return dispatched.filter((a) => { return a.severity; }).map((a) => {
    return [a.severity, a.body];
  });
};

describe('useThread', () => {
  let box;
  let root$;
  let result;

  const Thread = (props) => {
    result = useThread(props);
    return null;
  };

  const draw = async (store, props = {}) => {
    await act(async () => {
      root$.render(<Provider store={store}><Thread root={root} {...props} /></Provider>);
    });
  };

  const answer = (replies, more = {}) => {
    api.replies.thread.mockResolvedValue({
      data: {
        data: replies, canReply: true, replyAccess: 'anyone', ...more,
      },
    });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.clearAllMocks();
    window.localStorage.clear();
    box = document.createElement('div');
    root$ = createRoot(box);
  });

  afterEach(() => {
    act(() => { root$.unmount(); });
  });

  it('reads the thread, the writer\'s chain first and everybody else after', async () => {
    answer([
      reply(101, 100, writer),
      reply(102, 100, other),
      reply(103, 101, other),
    ]);
    const { store } = sessionStore();

    await draw(store);

    expect(api.replies.thread).toHaveBeenCalledWith(root);
    expect(result.isLoading).toBe(false);
    expect(result.canReply).toBe(true);
    expect(result.writerId).toBe(1);
    expect(result.chain.map((r) => { return r.id; })).toEqual([101]);
    // Newest first, as nobody has chosen otherwise.
    expect(result.shown.map((n) => { return n.reply.id; })).toEqual([103, 102]);
    // The one under the writer's note says which note it answers.
    expect(result.answersOf(reply(103, 101, other))).toBe(2);
  });

  it('shows only what is under a reply on that reply\'s own page', async () => {
    answer([
      reply(101, 100, other),
      reply(102, 101, writer),
      reply(103, 100, other),
    ]);
    const { store } = sessionStore();

    await draw(store, { under: reply(101, 100, other) });

    expect(result.chain).toEqual([]);
    expect(result.shown.map((n) => { return n.reply.id; })).toEqual([102]);
  });

  it('asks for nothing from a visitor on a site that shows a preview', async () => {
    const { store } = sessionStore({ isAuthenticated: false, viewer: {} });

    await draw(store);

    expect(result.heldBack).toBe(true);
    expect(result.isLoading).toBe(false);
    expect(api.replies.thread).not.toHaveBeenCalled();
  });

  it('says when the thread could not be read, and reads it again when asked', async () => {
    api.replies.thread.mockRejectedValueOnce(new Error('down'));
    const { store } = sessionStore();
    await draw(store);
    expect(result.hasFailed).toBe(true);

    answer([reply(101, 100, other)]);
    await act(async () => { await result.load(); });

    expect(result.hasFailed).toBe(false);
    expect(result.shown).toHaveLength(1);
  });

  it('puts a new reply in the thread, and says why one was refused', async () => {
    answer([]);
    const { store, dispatched } = sessionStore();
    await draw(store);

    api.replies.add.mockResolvedValue({ data: reply(104, 100, viewer) });
    await act(async () => { await result.add(root, 'Hello'); });
    expect(result.shown.map((n) => { return n.reply.id; })).toEqual([104]);

    const refusal = { response: { status: 403 } };
    api.replies.add.mockRejectedValue(refusal);
    let thrown = null;
    await act(async () => {
      await result.add(root, 'Again').catch((error) => { thrown = error; });
    });
    expect(thrown).toBe(refusal);
    expect(alertsIn(dispatched)).toEqual([['error', i18n.t('replies:prompts.notAllowed')]]);
  });

  it('holds a reply with a video on its way until it is gone', async () => {
    answer([]);
    const { store } = sessionStore();
    await draw(store);

    await act(async () => { await result.add(root, 'Watch', {}, { video: { name: 'a.mp4' } }); });
    expect(result.onTheWay).toHaveLength(1);
    expect(result.onTheWay[0].parent).toBe(root);

    act(() => { result.gone(result.onTheWay[0].key); });
    expect(result.onTheWay).toEqual([]);
  });

  it('asks before deleting, and deletes only on yes', async () => {
    answer([reply(102, 100, other)]);
    api.replies.deleteItem.mockResolvedValue({});
    const { store, dispatched } = sessionStore();
    await draw(store);

    act(() => { result.deleteItem(reply(102, 100, other)); });
    expect(result.asking.message).toBe(i18n.t('replies:confirm.delete'));
    act(() => { result.dismiss(); });
    expect(result.asking).toBe(null);
    expect(api.replies.deleteItem).not.toHaveBeenCalled();

    act(() => { result.deleteItem(reply(102, 100, other)); });
    await act(async () => { result.confirm(); });
    expect(api.replies.deleteItem).toHaveBeenCalled();
    expect(result.shown).toEqual([]);
    expect(alertsIn(dispatched)).toEqual([['success', i18n.t('replies:prompts.deleted')]]);
  });

  it('shows a reply again without asking, but asks before hiding one', async () => {
    answer([reply(102, 100, other)]);
    api.replies.setHidden.mockResolvedValue({});
    const { store } = sessionStore();
    await draw(store);

    await act(async () => { result.hide(reply(102, 100, other), false); });
    expect(api.replies.setHidden).toHaveBeenCalledWith(reply(102, 100, other), false);
    expect(result.asking).toBe(null);

    act(() => { result.hide(reply(102, 100, other), true); });
    expect(result.asking.message).toBe(i18n.t('replies:confirm.hide'));
  });

  it('likes a reply, counting it as the server does or by one', async () => {
    answer([reply(102, 100, other, { likesCount: 2 })]);
    api.likes.add.mockResolvedValue({ data: {} });
    const { store } = sessionStore();
    await draw(store);

    await act(async () => { result.like(result.shown[0].reply); });

    expect(result.shown[0].reply.isLikedByViewer).toBe(true);
    expect(result.shown[0].reply.likesCount).toBe(3);
  });

  it('changes only what an edit changes', async () => {
    answer([reply(102, 100, other, { content: 'Before', likesCount: 5 })]);
    api.replies.edit.mockResolvedValue({ data: { content: 'After', language: 'en' } });
    const { store } = sessionStore();
    await draw(store);

    await act(async () => { await result.edit(result.shown[0].reply, 'After'); });

    expect(result.shown[0].reply).toMatchObject({
      content: 'After', likesCount: 5, linkPreview: null,
    });
  });

  it('keeps the order chosen in the browser', async () => {
    answer([]);
    const { store } = sessionStore();
    await draw(store);

    act(() => { result.choose('oldest'); });

    expect(result.order).toBe('oldest');
    expect(window.localStorage.getItem('replies.order')).toBe('oldest');
  });
});
