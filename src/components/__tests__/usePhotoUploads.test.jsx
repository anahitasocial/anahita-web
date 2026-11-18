/* global globalThis */
import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

import api from '../../api';
import i18n from '../../languages';
import photoFiles from '../../utils/photoFiles';
import usePhotoUploads, { failureText, isPhoto } from '../usePhotoUploads';

// The server, played by the test: each upload answers as the test says.
vi.mock('../../api', () => {
  return { default: { photos: { upload: vi.fn() } } };
});

// A photo is sent as it was picked: making it ready is preparePhoto's, and
// tested there.
vi.mock('../../utils/preparePhoto', () => {
  return {
    PHOTO_TYPES: ['image/jpeg', 'image/png', 'image/heic'],
    preparePhoto: (file) => { return Promise.resolve(file); },
  };
});

const { STATUS } = photoFiles;

const jpeg = (name = 'mars.jpg') => {
  return new File(['x'], name, { type: 'image/jpeg' });
};

// Whatever was promised has answered.
const settle = () => {
  return act(async () => {
    await new Promise((resolve) => { setTimeout(resolve, 0); });
  });
};

describe('usePhotoUploads', () => {
  let box;
  let root;
  let result;
  let items;

  // The editor's list, kept as the composer keeps it, in state.
  const Editor = (props) => {
    const [list, setList] = useState([]);
    items = list;
    result = usePhotoUploads({
      owner: { id: 7 }, items: list, onChange: setList, ...props,
    });
    return null;
  };

  const draw = (props = {}) => {
    act(() => {
      root.render(<Editor {...props} />);
    });
  };

  // Files picked by another button, as the composer's photo button does.
  const pick = (files, props = {}) => {
    act(() => {
      root.render(<Editor {...props} incoming={{ files }} />);
    });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    box = document.createElement('div');
    root = createRoot(box);
    URL.createObjectURL = vi.fn(() => { return 'blob:picked'; });
    URL.revokeObjectURL = vi.fn();
    api.photos.upload.mockReset();
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('takes the photos picked and sends each at once', async () => {
    api.photos.upload.mockResolvedValue({ data: { uploadId: 'u1', urls: {} } });
    const onPicked = vi.fn();
    const onIncomingTaken = vi.fn();
    draw();
    pick([jpeg()], { onPicked, onIncomingTaken });
    expect(items).toHaveLength(1);
    expect(items[0].status).toBe(STATUS.UPLOADING);
    expect(onPicked).toHaveBeenCalledTimes(1);
    expect(onIncomingTaken).toHaveBeenCalledTimes(1);

    await settle();
    expect(api.photos.upload)
      .toHaveBeenCalledWith({ id: 7 }, expect.any(File), expect.any(Function));
    expect(items[0].status).toBe(STATUS.READY);
    expect(items[0].uploadId).toBe('u1');
  });

  it('says how far an upload has got', async () => {
    let told;
    api.photos.upload.mockImplementation((owner, file, onProgress) => {
      told = onProgress;
      return new Promise(() => {});
    });
    pick([jpeg()]);
    await settle();
    act(() => { told(40); });
    expect(items[0].progress).toBe(40);
  });

  it('leaves out what there is no room for, and says how many', () => {
    api.photos.upload.mockReturnValue(new Promise(() => {}));
    pick([jpeg('a.jpg'), jpeg('b.jpg'), jpeg('c.jpg')], { max: 2 });
    expect(items).toHaveLength(2);
    expect(result.leftOut).toBe(1);
    expect(result.room).toBe(0);
  });

  it('gives a video to the composer when no photo is in', () => {
    const onVideo = vi.fn();
    const video = new File(['x'], 'ship.mp4', { type: 'video/mp4' });
    pick([video], { onVideo, videoMimetypes: ['video/mp4'] });
    expect(result.takesVideo).toBe(true);
    expect(onVideo).toHaveBeenCalledWith(video);
    expect(items).toHaveLength(0);
  });

  it('says why an upload failed, and sends it again when asked', async () => {
    api.photos.upload.mockRejectedValueOnce({ response: { status: 413 } });
    pick([jpeg()]);
    await settle();
    expect(items[0].status).toBe(STATUS.FAILED);
    expect(items[0].error).toBe(i18n.t('photos:editor.tooLarge'));
    expect(result.canRetry(items[0].key)).toBe(true);

    api.photos.upload.mockResolvedValueOnce({ data: { uploadId: 'u2', urls: {} } });
    act(() => { result.retry(items[0].key); });
    await settle();
    expect(items[0].status).toBe(STATUS.READY);
    expect(result.canRetry(items[0].key)).toBe(false);
  });

  it('shows a HEIC this browser cannot read by the size the server made', async () => {
    api.photos.upload.mockResolvedValue({
      data: { uploadId: 'u3', urls: { medium: { url: 'https://a.example/m.jpg' } } },
    });
    pick([new File(['x'], 'IMG_0001.HEIC', { type: '' })]);
    await settle();
    expect(items[0].previewUrl).toBe('https://a.example/m.jpg');
  });

  it('lets go of the files it held when it goes away', () => {
    api.photos.upload.mockReturnValue(new Promise(() => {}));
    pick([jpeg()]);
    act(() => { root.unmount(); });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:picked');
    root = createRoot(box);
  });
});

describe('the files and the failures', () => {
  it('knows a photo by its type, or a HEIC by its name', () => {
    const types = ['image/jpeg', 'image/heic'];
    expect(isPhoto({ type: 'image/jpeg', name: 'a.jpg' }, types)).toBe(true);
    expect(isPhoto({ type: '', name: 'a.heic' }, types)).toBe(true);
    expect(isPhoto({ type: '', name: 'a.heic' }, ['image/jpeg'])).toBe(false);
    expect(isPhoto({ type: 'video/mp4', name: 'a.mp4' }, types)).toBe(false);
  });

  it('says in words what the server refused', () => {
    expect(failureText({ response: { data: { error: 'file_unsupported' } } }))
      .toBe(i18n.t('photos:editor.unsupported'));
    expect(failureText({ response: { status: 413 } })).toBe(i18n.t('photos:editor.tooLarge'));
    expect(failureText(new Error('offline'))).toBe(i18n.t('photos:editor.failed'));
  });
});
