import { act } from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import useThreadNote from '../useThreadNote';
import { drawHook } from './drawHook';

vi.mock('../../../../api/linkPreviews', () => {
  return { default: { read: vi.fn(() => { return Promise.resolve({}); }) } };
});

const writer = { id: 4, name: 'Jen Barber' };
const video = new File(['x'], 'reynholm.mp4', { type: 'video/mp4' });

const note = (more = {}) => {
  return {
    key: 'note-a', words: '', photos: [], video: null, linkPreviewUrl: '', ...more,
  };
};

describe('useThreadNote', () => {
  let hook;
  let notes;

  // The notes' setter, as the composer's state is: given a function from
  // the notes as they are to the notes as they are to be.
  const onChange = (update) => {
    notes = update(notes);
  };

  const draw = (props = {}) => {
    hook.draw({
      note: notes[0], onChange, uploader: writer, photosMax: 4, checkVideo: () => { return ''; }, ...props,
    });
    return hook.result.current;
  };

  beforeEach(() => {
    notes = [note(), note({ key: 'note-b', words: 'Another' })];
    hook = drawHook(useThreadNote);
  });

  afterEach(() => {
    hook.unmount();
  });

  it('changes its own words, and no other note', () => {
    draw();
    act(() => { hook.result.current.setWords('Have you tried'); });
    expect(notes.map((each) => { return each.words; })).toEqual(['Have you tried', 'Another']);
  });

  it('offers photos and a file while it has neither, and photos only for a writer', () => {
    expect(draw()).toMatchObject({ canPhotos: true, offersVideo: true });
    expect(draw({ uploader: null }).canPhotos).toBe(false);
    expect(draw({ note: note({ video }) })).toMatchObject({ canPhotos: false, offersVideo: false });
  });

  it('takes a file, or says why not', () => {
    draw({ checkVideo: () => { return 'Too long'; } });
    act(() => { hook.result.current.takeVideo(video); });
    expect(hook.result.current.videoProblem).toBe('Too long');
    expect(notes[0].video).toBe(null);
    draw();
    act(() => { hook.result.current.takeVideo(video); });
    expect(hook.result.current.videoProblem).toBe('');
    expect(notes[0].video).toBe(video);
    draw({ note: notes[0] });
    act(() => { hook.result.current.removeVideo(); });
    expect(notes[0].video).toBe(null);
  });

  it('hands photos picked to the editor, and lets them go once taken', () => {
    draw();
    act(() => { hook.result.current.addPhotos(['a']); });
    expect(hook.result.current.incoming).toEqual({ files: ['a'] });
    expect(hook.result.current.offersVideo).toBe(false);
    act(() => { hook.result.current.takeIncoming(); });
    expect(hook.result.current.incoming).toBe(null);
  });

  it('changes its photos as the editor says', () => {
    draw();
    act(() => {
      hook.result.current.changePhotos((photos) => { return [...photos, { id: 1 }]; });
    });
    expect(notes[0].photos).toEqual([{ id: 1 }]);
  });

  it('takes itself out of the thread', () => {
    draw();
    act(() => { hook.result.current.remove(); });
    expect(notes.map((each) => { return each.key; })).toEqual(['note-b']);
  });
});
