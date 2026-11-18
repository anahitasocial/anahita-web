/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

import api from '../../api';
import { usePost, useProfile } from '../useEmbedded';
import { citedIn, siteOf } from '../Citations';
import { excerptOf } from '../EmbedParts';

// The server, played by the test.
vi.mock('../../api', () => {
  return {
    default: {
      notes: { read: vi.fn() },
      handles: { read: vi.fn() },
      people: { read: vi.fn() },
    },
  };
});

// Whatever was promised has answered.
const settle = () => {
  return act(async () => {
    await new Promise((resolve) => { setTimeout(resolve, 0); });
  });
};

describe('useEmbedded', () => {
  let box;
  let root;
  let seen;

  // Each test reads posts and profiles of its own: what was read is kept
  // for the page, and so between tests.
  // eslint-disable-next-line react/prop-types
  const Embed = ({ at = null, alias = '' }) => {
    seen = { ...usePost(at), profile: useProfile(alias) };
    return null;
  };

  const draw = (props) => {
    act(() => {
      root.render(<Embed {...props} />);
    });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    box = document.createElement('div');
    root = createRoot(box);
    api.notes.read.mockReset();
    api.handles.read.mockReset();
    api.people.read.mockReset();
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('reads the post an address is to', async () => {
    api.notes.read.mockResolvedValue({ data: { id: 1, content: 'Hello' } });
    draw({ at: { namespace: 'notes', kind: 'note', id: 1 } });
    expect(seen.post).toBe(null);
    await settle();
    expect(api.notes.read).toHaveBeenCalledWith(1);
    expect(seen.post).toEqual({ id: 1, content: 'Hello' });
    expect(seen.failed).toBe(false);
  });

  it('reads each post once for the page', async () => {
    api.notes.read.mockResolvedValue({ data: { id: 2 } });
    draw({ at: { namespace: 'notes', id: 2 } });
    await settle();
    act(() => { root.unmount(); });
    root = createRoot(box);
    draw({ at: { namespace: 'notes', id: 2 } });
    await settle();
    expect(api.notes.read).toHaveBeenCalledTimes(1);
    expect(seen.post).toEqual({ id: 2 });
  });

  it('says when a post could not be read, and asks again the next time', async () => {
    api.notes.read.mockRejectedValueOnce(new Error('gone'));
    draw({ at: { namespace: 'notes', id: 3 } });
    await settle();
    expect(seen.failed).toBe(true);

    api.notes.read.mockResolvedValue({ data: { id: 3 } });
    draw({ at: { namespace: 'notes', id: 4 } });
    draw({ at: { namespace: 'notes', id: 3 } });
    await settle();
    expect(seen.failed).toBe(false);
    expect(api.notes.read).toHaveBeenCalledTimes(3);
  });

  it('asks for nothing without an address', async () => {
    draw({});
    await settle();
    expect(api.notes.read).not.toHaveBeenCalled();
    expect(api.handles.read).not.toHaveBeenCalled();
  });

  it('reads a profile by its alias: its kind, then itself', async () => {
    api.handles.read.mockResolvedValue({ data: { kind: 'people', id: 9 } });
    api.people.read.mockResolvedValue({ data: { id: 9, name: 'Naomi Nagata' } });
    draw({ alias: 'naomi' });
    await settle();
    expect(api.handles.read).toHaveBeenCalledWith('naomi');
    expect(api.people.read).toHaveBeenCalledWith(9);
    expect(seen.profile.actor).toEqual({ id: 9, name: 'Naomi Nagata' });
  });

  it('drops an answer that comes after the address changed', async () => {
    let answer;
    api.notes.read.mockImplementationOnce(() => {
      return new Promise((resolve) => { answer = resolve; });
    });
    api.notes.read.mockResolvedValueOnce({ data: { id: 6 } });
    draw({ at: { namespace: 'notes', id: 5 } });
    draw({ at: { namespace: 'notes', id: 6 } });
    await settle();
    answer({ data: { id: 5 } });
    await settle();
    expect(seen.post).toEqual({ id: 6 });
  });
});

describe('what a text cites', () => {
  it('lists each address on a line of its own, once, in order', () => {
    const text = 'Read this:\nhttps://a.example/one\nand https://a.example/inline\n'
      + 'https://b.example/two\nhttps://a.example/one';
    expect(citedIn(text)).toEqual(['https://a.example/one', 'https://b.example/two']);
  });

  it('names a page by its site', () => {
    expect(siteOf(null, 'https://www.a.example/page')).toBe('a.example');
    expect(siteOf(null, 'not an address')).toBe('');
  });

  it('cuts a long opening at a word', () => {
    expect(excerptOf('Hello there Moss', 13)).toBe('Hello there…');
    expect(excerptOf('**Short**')).toBe('Short');
  });
});
