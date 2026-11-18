import { act } from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import api from '../../../../api';
import sendShort from '../sendShort';
import useShortComposer from '../useShortComposer';
import { drawHook, settle, storeOf } from './drawHook';

vi.mock('../../../../api', async (importOriginal) => {
  const real = await importOriginal();
  return {
    default: {
      ...real.default,
      federation: { settings: vi.fn(), blueskySettings: vi.fn() },
    },
  };
});

// What is sent is sendShort's, tested on its own: here only that it is.
vi.mock('../sendShort', () => {
  return { default: vi.fn() };
});

const upload = { phase: 'idle', kind: 'video', reset: vi.fn() };
vi.mock('../Video/SharedVideoUpload', () => {
  return { useSharedVideoUpload: () => { return upload; } };
});

let lastId = 200;
const person = (name) => {
  lastId += 1;
  return {
    id: lastId, name, type: 'com.anahita.actor.person', language: 'en',
  };
};

describe('useShortComposer', () => {
  let hook;
  let viewer;
  let onClose;
  let onExpand;

  const draw = (props = {}) => {
    hook.draw({
      actor: viewer,
      kinds: ['note', 'photo', 'video', 'audio'],
      open: true,
      onClose,
      onExpand,
      ...props,
    });
    return hook.result.current;
  };

  const type = (words) => {
    act(() => { hook.result.current.setBody(words); });
  };

  const submit = () => {
    act(() => { hook.result.current.submit({ preventDefault: () => {} }); });
  };

  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    api.federation.settings.mockResolvedValue({ data: { enabled: false } });
    api.federation.blueskySettings.mockResolvedValue({ data: { connected: false } });
    viewer = person('Martha Jones');
    onClose = vi.fn();
    onExpand = vi.fn();
    const { store } = storeOf({ session: { viewer }, app: { nodeInfo: null } });
    hook = drawHook(useShortComposer, store);
  });

  afterEach(() => {
    hook.unmount();
  });

  it('opens on the words, with nothing to post yet', () => {
    const composer = draw();
    expect(composer.onDetails).toBe(false);
    expect(composer.hasSomething).toBe(false);
    expect(composer.canGoOn).toBe(false);
  });

  it('goes on to the choices once there are words, and posts from there', async () => {
    draw();
    type('  Bigger on the inside  ');
    expect(hook.result.current.canGoOn).toBe(true);
    submit();
    expect(hook.result.current.onDetails).toBe(true);
    expect(sendShort).not.toHaveBeenCalled();
    submit();
    await settle();
    expect(sendShort).toHaveBeenCalledTimes(1);
    const [post, to] = sendShort.mock.calls[0];
    expect(post).toMatchObject({ text: 'Bigger on the inside', threadParts: [], video: null });
    expect(to.actor).toBe(viewer);
  });

  it('goes back to the words with them kept', () => {
    draw();
    type('Allons-y');
    submit();
    act(() => { hook.result.current.back(); });
    expect(hook.result.current.onDetails).toBe(false);
    expect(hook.result.current.body).toBe('Allons-y');
  });

  it('holds back a note longer than a note may be', () => {
    draw();
    type('x'.repeat(501));
    expect(hook.result.current.canGoOn).toBe(false);
    expect(hook.result.current.split.canSplit).toBe(true);
  });

  it('takes no words alone where the profile takes no notes', () => {
    draw({ kinds: ['photo'] });
    type('Words alone');
    expect(hook.result.current.canWords).toBe(false);
    expect(hook.result.current.hasSomething).toBe(false);
    expect(hook.result.current.canThread).toBe(false);
  });

  it('keeps the words as a draft, for each profile', () => {
    draw();
    type('Kept');
    expect(window.localStorage.getItem(`composer-draft:${viewer.id}`)).toBe('Kept');
  });

  it('carries the words to the extended composer, and lets the draft go', () => {
    draw();
    type('At length');
    act(() => { hook.result.current.expand(); });
    expect(onClose).toHaveBeenCalled();
    expect(onExpand).toHaveBeenCalledWith('At length');
    expect(hook.result.current.body).toBe('');
  });

  it('offers no extended composer where the profile takes no long writing', () => {
    expect(draw({ onExpand: null }).expand).toBe(null);
  });

  it('empties and closes once posted', () => {
    draw();
    type('Posted');
    submit();
    submit();
    return settle().then(() => {
      const [, to] = sendShort.mock.calls[0];
      act(() => { to.reset(); });
      expect(hook.result.current.body).toBe('');
      expect(hook.result.current.onDetails).toBe(false);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
