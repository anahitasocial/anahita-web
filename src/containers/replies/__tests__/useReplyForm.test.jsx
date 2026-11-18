/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import useReplyForm, { attachedOf, cardOf } from '../useReplyForm';

// Nothing here goes to the server: the networks the viewer is on are
// asked about and answered no, and no link or hashtag is typed.
vi.mock('../../../api', () => {
  return {
    default: {
      federation: {
        settings: () => { return Promise.resolve({ data: { enabled: false } }); },
        blueskySettings: () => { return Promise.resolve({ data: { connected: false } }); },
      },
      hashtags: { suggest: () => { return Promise.resolve({ data: [] }); } },
    },
  };
});
vi.mock('../../../api/linkPreviews', () => {
  return { default: { read: () => { return Promise.resolve({ data: null }); } } };
});

const ready = (uploadId) => {
  return { status: 'ready', uploadId, altText: ' A cat ' };
};
const note = (words) => {
  return {
    key: words, words, photos: [], video: null, linkPreviewUrl: '',
  };
};
const none = { kind: '', text: '' };

describe('attachedOf', () => {
  const nothing = {
    text: 'Hi', threadParts: [], photoItems: [], photosReady: false, video: null, card: {}, warning: none,
  };

  it('sends words alone with nothing else', () => {
    expect(attachedOf(nothing)).toEqual({});
  });

  it('sends pictures that are all stored, with what each shows', () => {
    expect(attachedOf({ ...nothing, photoItems: [ready(4)], photosReady: true })).toEqual({
      uploads: [{ uploadId: 4, altText: 'A cat' }],
    });
  });

  it('sends a GIF or a video on its own', () => {
    const video = { name: 'a.gif' };
    expect(attachedOf({ ...nothing, video })).toEqual({ video });
  });

  it('sends a thread with its first note as the others are', () => {
    const attached = attachedOf({
      ...nothing, threadParts: [note('Two')], card: { url: 'https://a.example' },
    });

    expect(attached.thread).toEqual([note('Two')]);
    expect(attached.firstNote).toEqual({
      words: 'Hi', photos: [], video: null, linkPreviewUrl: 'https://a.example',
    });
  });

  it('adds its content warning to any of them', () => {
    const warning = { kind: 'graphic', text: '' };
    expect(attachedOf({ ...nothing, video: { name: 'b.mp4' }, warning })).toEqual({
      video: { name: 'b.mp4' }, warning,
    });
  });
});

describe('cardOf', () => {
  it('says the link to make a card for, or that the card was taken off', () => {
    expect(cardOf({ url: 'https://a.example' })).toEqual({ linkPreviewUrl: 'https://a.example' });
    expect(cardOf({ isRemoved: true })).toEqual({ linkPreviewRemove: true });
    expect(cardOf({})).toEqual({});
  });
});

describe('useReplyForm', () => {
  let box;
  let root;
  let result;

  const Form = (props) => {
    result = useReplyForm(props);
    return null;
  };

  // A site that offers the kinds of post given, and videos when asked.
  const site = ({ posts = ['note', 'photo'], videoUploads = false } = {}) => {
    const state = {
      session: { viewer: { id: 3, name: 'Jen Barber' } },
      app: { nodeInfo: { metadata: { offers: { posts }, videoUploads } } },
    };
    return createStore(() => { return state; });
  };

  const draw = async (props, store = site()) => {
    await act(async () => {
      root.render(
        <ThemeProvider theme={createTheme()}>
          <Provider store={store}><Form {...props} /></Provider>
        </ThemeProvider>,
      );
    });
  };

  const event = () => {
    return { preventDefault: vi.fn() };
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    box = document.createElement('div');
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('has nothing to send until something is written', async () => {
    const onSubmit = vi.fn();
    await draw({ onSubmit });
    expect(result.hasSomething).toBe(false);

    act(() => { result.submit(event()); });
    expect(onSubmit).not.toHaveBeenCalled();

    act(() => { result.setBody('  Hello  '); });
    expect(result.hasSomething).toBe(true);
  });

  it('sends the words, and empties itself once they are in', async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    await draw({ onSubmit });
    act(() => { result.setBody('  Hello  '); });

    await act(async () => { result.submit(event()); });

    expect(onSubmit).toHaveBeenCalledWith('Hello', {}, {});
    expect(result.body).toBe('');
    expect(result.isSending).toBe(false);
  });

  it('keeps the words when they could not be sent', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('no'));
    await draw({ onSubmit });
    act(() => { result.setBody('Hello'); });

    await act(async () => { result.submit(event()); });

    expect(result.body).toBe('Hello');
  });

  it('holds back a note longer than a note may be', async () => {
    const onSubmit = vi.fn();
    await draw({ onSubmit });
    act(() => { result.setBody('a'.repeat(501)); });

    expect(result.isHeldBack).toBe(true);
    act(() => { result.submit(event()); });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('offers pictures and videos to a new reply where the site offers them', async () => {
    await draw({ onSubmit: vi.fn(), attachments: true }, site({ videoUploads: true }));
    expect(result.canAddPhotos).toBe(true);
    expect(result.canAddVideo).toBe(true);

    await draw({ onSubmit: vi.fn(), attachments: true }, site({ posts: ['note'] }));
    expect(result.canAddPhotos).toBe(false);
    expect(result.canAddVideo).toBe(false);

    await draw({ onSubmit: vi.fn() }, site({ videoUploads: true }));
    expect(result.canAddPhotos).toBe(false);
    expect(result.canAddVideo).toBe(false);
  });

  it('says what is wrong with a file chosen as a video, and takes one that is right', async () => {
    await draw({ onSubmit: vi.fn(), attachments: true }, site({ videoUploads: true }));

    act(() => { result.pickVideo({ name: 'a.txt', type: 'text/plain', size: 10 }); });
    expect(result.videoProblem).not.toBe('');
    expect(result.video).toBe(null);

    act(() => { result.startPickingVideo(); });
    expect(result.videoProblem).toBe('');

    const video = { name: 'b.mp4', type: 'video/mp4', size: 10 };
    act(() => { result.pickVideo(video); });
    expect(result.video).toBe(video);
    expect(result.hasSomething).toBe(true);
  });

  it('opens the pictures once some are picked', async () => {
    await draw({ onSubmit: vi.fn(), attachments: true });

    act(() => { result.pickPhotos([]); });
    expect(result.isAddingPhotos).toBe(false);

    const files = [{ name: 'a.jpg' }];
    act(() => { result.pickPhotos(files); });
    expect(result.isAddingPhotos).toBe(true);
    expect(result.incoming).toEqual({ files });
  });

  it('hands what is written to a dialog as it changes', async () => {
    const onDraft = vi.fn();
    await draw({ onSubmit: vi.fn(), onDraft, initial: 'Hi' });

    act(() => { result.setBody('Hi there'); });

    expect(onDraft).toHaveBeenLastCalledWith('Hi there');
  });
});
