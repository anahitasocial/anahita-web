import { act } from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import useShortFiles from '../useShortFiles';
import { drawHook } from './drawHook';

const nodeInfo = { metadata: { videoUploads: true } };
const all = ['note', 'photo', 'video', 'audio'];
const video = new File(['x'], 'tardis.mp4', { type: 'video/mp4' });

describe('useShortFiles', () => {
  let hook;
  let choices;
  let upload;

  const draw = (props = {}) => {
    hook.draw({
      open: true, takes: all, nodeInfo, choices, upload, busy: false, ...props,
    });
    return hook.result.current;
  };

  beforeEach(() => {
    hook = drawHook(useShortFiles);
    choices = { noticeFiles: vi.fn() };
    upload = { phase: 'idle', kind: 'video', reset: vi.fn() };
  });

  afterEach(() => {
    hook.unmount();
  });

  it('offers photos, a video and a sound, as the profile and the server allow', () => {
    expect(draw().offers).toMatchObject({ photos: true, video: true, audio: true });
    expect(draw({ nodeInfo: null }).offers)
      .toMatchObject({ photos: true, video: false, audio: false });
    expect(draw({ takes: ['note'] }).offers).toMatchObject({ photos: false, video: false });
  });

  it('offers nothing to add while posting', () => {
    expect(draw({ busy: true }).offers).toEqual({
      photos: false, video: false, audio: false, record: false,
    });
  });

  it('takes a video, says it to the choices, and offers nothing more', () => {
    draw();
    act(() => { hook.result.current.takeVideo(video); });
    const files = hook.result.current;
    expect(files.video).toBe(video);
    expect(files.videoProblem).toBe('');
    expect(choices.noticeFiles).toHaveBeenCalledWith([video]);
    expect(files.offers).toMatchObject({ photos: false, video: false, audio: false });
  });

  it('takes no video while another is on its way, and says so', () => {
    upload.phase = 'uploading';
    draw();
    act(() => { hook.result.current.takeVideo(video); });
    expect(hook.result.current.video).toBe(null);
    expect(hook.result.current.videoProblem).toBe(hook.result.current.onItsWay);
    expect(hook.result.current.offers.video).toBe(false);
  });

  it('lets go a video posted earlier that is done', () => {
    upload.phase = 'ready';
    draw();
    act(() => { hook.result.current.takeVideo(video); });
    expect(upload.reset).toHaveBeenCalled();
  });

  it('opens the photos with those picked, and closes them once the last is out', () => {
    draw();
    act(() => { hook.result.current.addPhotos(['a']); });
    expect(hook.result.current.isAddingPhotos).toBe(true);
    expect(hook.result.current.incoming).toEqual({ files: ['a'] });
    act(() => { hook.result.current.setPhotoItems([{ id: 1 }]); });
    expect(hook.result.current.offers.video).toBe(false);
    act(() => { hook.result.current.setPhotoItems([]); });
    expect(hook.result.current.isAddingPhotos).toBe(false);
  });

  it('lets everything go once posted', () => {
    draw();
    act(() => {
      hook.result.current.setPhotoItems([{ id: 1 }]);
      hook.result.current.setPeople([{ id: 5 }]);
    });
    act(() => { hook.result.current.clear(); });
    expect(hook.result.current.photoItems).toEqual([]);
    expect(hook.result.current.people).toEqual([]);
    expect(hook.result.current.video).toBe(null);
  });
});
