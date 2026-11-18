import { act } from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import api from '../../../../api';
import coverApi from '../../../../api/cover';
import useLongComposer from '../useLongComposer';
import { drawHook, settle, storeOf } from './drawHook';

// The rest of the API as it is: the actions are made from it.
vi.mock('../../../../api', async (importOriginal) => {
  const real = await importOriginal();
  const writing = (namespace) => {
    return {
      ...real.default[namespace], add: vi.fn(), edit: vi.fn(), publish: vi.fn(),
    };
  };
  return {
    default: {
      ...real.default,
      federation: { settings: vi.fn(), blueskySettings: vi.fn() },
      articles: writing('articles'),
      topics: writing('topics'),
      warnings: { edit: vi.fn() },
    },
  };
});

vi.mock('../../../../api/cover', () => {
  return { default: { add: vi.fn() } };
});

vi.mock('../../../../api/linkPreviews', () => {
  return { default: { read: vi.fn(() => { return Promise.resolve({}); }) } };
});

let lastId = 300;
const person = (name) => {
  lastId += 1;
  return {
    id: lastId, name, type: 'com.anahita.actor.person', language: 'en',
  };
};

describe('useLongComposer', () => {
  let hook;
  let viewer;
  let held;
  let onClose;

  const draw = (props = {}) => {
    hook.draw({
      actor: viewer, kinds: ['article', 'topic'], open: true, onClose, ...props,
    });
    return hook.result.current;
  };

  const write = (title, body) => {
    act(() => {
      hook.result.current.setTitle(title);
      hook.result.current.setBody(body);
    });
  };

  const submit = () => {
    act(() => { hook.result.current.submit({ preventDefault: () => {} }); });
  };

  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    api.federation.settings.mockResolvedValue({ data: { enabled: true } });
    viewer = person('Daniel Jackson');
    onClose = vi.fn();
    held = storeOf({ session: { viewer }, app: { nodeInfo: null } });
    hook = drawHook(useLongComposer, held.store);
  });

  afterEach(() => {
    hook.unmount();
  });

  it('opens on the first kind the profile takes', () => {
    expect(draw().kind).toBe('article');
    expect(draw({ kinds: ['topic'] }).kind).toBe('topic');
  });

  it('carries what was written in the short box, after what is there', () => {
    draw({ open: false });
    act(() => { hook.result.current.setBody('Before'); });
    draw({ open: true, carried: 'From the short box' });
    expect(hook.result.current.body).toBe('Before\n\nFrom the short box');
  });

  it('says what is missing only once posting is tried', () => {
    draw();
    expect(hook.result.current.tried).toBe(false);
    expect(hook.result.current.bodyError).toBe('');
    submit();
    expect(hook.result.current.tried).toBe(true);
    expect(hook.result.current.titleShort).toBe(true);
    expect(hook.result.current.bodyError).not.toBe('');
    expect(api.articles.add).not.toHaveBeenCalled();
  });

  it('posts an article, its cover once it exists, then empties and closes', async () => {
    api.articles.add.mockResolvedValue({ data: { id: 41 } });
    coverApi.add.mockResolvedValue({});
    draw();
    act(() => { hook.result.current.setCover(new File(['x'], 'stargate.jpg')); });
    write('Chevron seven', 'Locked.');
    submit();
    await settle();
    expect(api.articles.add.mock.calls[0][0]).toMatchObject({
      title: 'Chevron seven', content: 'Locked.', access: 'public',
    });
    expect(coverApi.add).toHaveBeenCalledWith({ id: 41 }, expect.any(File));
    expect(onClose).toHaveBeenCalled();
    expect(hook.result.current.title).toBe('');
    expect(held.alerts().map((each) => { return each.severity; })).toEqual(['success']);
  });

  it('saves a draft on the server, and saves over it after', async () => {
    api.topics.add.mockResolvedValue({ data: { id: 52 } });
    api.topics.edit.mockResolvedValue({ data: { id: 52 } });
    api.warnings.edit.mockResolvedValue({});
    draw({ kinds: ['topic'] });
    write('Ascension', 'Talked about.');
    act(() => { hook.result.current.saveDraft(); });
    await settle();
    expect(api.topics.add.mock.calls[0][0]).toMatchObject({ draft: true, title: 'Ascension' });
    expect(hook.result.current.draftId).toBe(52);
    act(() => { hook.result.current.saveDraft(); });
    await settle();
    expect(api.topics.edit).toHaveBeenCalledWith({
      id: 52, title: 'Ascension', content: 'Talked about.', language: 'en',
    });
  });

  it('takes a draft up again in its own kind, and begins anew', () => {
    draw();
    act(() => {
      hook.result.current.openDraft({
        id: 8, kind: 'topic', title: 'Abydos', content: 'Sand.',
      });
    });
    expect(hook.result.current).toMatchObject({
      kind: 'topic', title: 'Abydos', body: 'Sand.', draftId: 8,
    });
    act(() => { hook.result.current.newDraft(); });
    expect(hook.result.current).toMatchObject({ title: '', body: '', draftId: 0 });
  });

  it('says where an article goes; a topic stays here, and is said nothing of', async () => {
    draw();
    await settle();
    expect(hook.result.current.goesOut).toBe(true);
    draw({ kinds: ['topic'] });
    expect(hook.result.current.goesOut).toBe(false);
    expect(hook.result.current.staysHere).toBe(false);
  });
});
