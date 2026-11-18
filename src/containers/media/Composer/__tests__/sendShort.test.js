import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

import api from '../../../../api';
import { tagPeople } from '../../TagPeopleDialog';
import sendShort from '../sendShort';
import warnings from '../../../../utils/warnings';

vi.mock('../../../../api', () => {
  return { default: { replies: { addThread: vi.fn() } } };
});

vi.mock('../../TagPeopleDialog', () => {
  return {
    tagPeople: vi.fn(),
    tagOutcomeMessage: () => { return { error: false, text: 'Tagged' }; },
  };
});

vi.mock('../../../../actions', () => {
  const alert = (severity) => {
    return (body, link = '') => {
      return {
        type: 'ALERT', severity, body, link,
      };
    };
  };
  const add = (namespace) => {
    return (post, actor) => {
      return {
        type: 'ADD', namespace, post, actor,
      };
    };
  };
  return {
    default: {
      app: { alert: { success: alert('success'), error: alert('error') } },
      notes: { add: add('notes') },
      photos: { add: add('photos') },
    },
  };
});

const actor = { id: 2, name: 'Naomi Nagata' };
const viewer = { id: 3, name: 'Amos Burton' };
const photo = { uploadId: 'u1', status: 'ready', altText: ' A ship ' };
const video = new File(['x'], 'rocinante.mp4', { type: 'video/mp4' });

// What is written, as the composer gives it: words alone unless said.
const written = (more = {}) => {
  return {
    text: 'Hello',
    photoItems: [],
    photosReady: false,
    people: [],
    video: null,
    linkPreviewUrl: '',
    threadParts: [],
    ...more,
  };
};

const note = (words, more = {}) => {
  return {
    key: words, words, photos: [], video: null, linkPreviewUrl: '', ...more,
  };
};

describe('sendShort', () => {
  let to;
  let dispatched;
  let made;

  beforeEach(() => {
    vi.clearAllMocks();
    dispatched = [];
    made = { id: 7 };
    to = {
      actor,
      viewer,
      choices: {
        request: () => { return { access: 'public', language: 'en' }; },
        allowDownload: true,
        warning: warnings.NONE,
      },
      locationIds: () => { return { location_ids: [11] }; },
      upload: { start: vi.fn() },
      setIsSending: vi.fn(),
      reset: vi.fn(),
      alertSuccess: vi.fn(),
      alertError: vi.fn(),
      dispatch: (action) => {
        dispatched.push(action);
        return action.type === 'ADD' ? Promise.resolve(made) : action;
      },
    };
  });

  const added = () => {
    return dispatched.filter((action) => { return action.type === 'ADD'; });
  };

  it('posts words as a note, with its card and locations', async () => {
    await sendShort(written({ linkPreviewUrl: 'https://example.org' }), to);
    expect(added()).toEqual([{
      type: 'ADD',
      namespace: 'notes',
      actor,
      post: {
        content: 'Hello',
        access: 'public',
        language: 'en',
        location_ids: [11],
        link_preview_url: 'https://example.org',
      },
    }]);
    expect(to.setIsSending.mock.calls).toEqual([[true], [false]]);
    expect(dispatched.find((action) => { return action.severity === 'success'; }).body).toBeTruthy();
    expect(to.reset).toHaveBeenCalled();
  });

  it('posts photos as a photo post, and tags who is in them', async () => {
    tagPeople.mockResolvedValue([{ outcome: 'tagged' }]);
    const people = [{ id: 9, name: 'Roy Trenneman' }];
    await sendShort(written({ photoItems: [photo], photosReady: true, people }), to);
    const [{ namespace, post }] = added();
    expect(namespace).toBe('photos');
    expect(post).toMatchObject({
      title: '',
      uploads: [{ uploadId: 'u1', altText: 'A ship' }],
      allow_download: true,
    });
    expect(tagPeople).toHaveBeenCalledWith(made, people);
    expect(to.alertSuccess).toHaveBeenCalled();
    expect(to.reset).toHaveBeenCalled();
  });

  it('hands a video to the app to send, and closes at once', () => {
    sendShort(written({ video }), to);
    expect(to.upload.start).toHaveBeenCalledWith(actor, {
      title: '', content: 'Hello', access: 'public', language: 'en', allowDownload: true,
    }, video);
    expect(added()).toEqual([]);
    expect(to.reset).toHaveBeenCalled();
  });

  it('makes a thread together, the first note taking what a post takes', async () => {
    api.replies.addThread.mockResolvedValue({ data: { parts: [{ id: 21 }, { id: 22 }] } });
    await sendShort(written({ threadParts: [note('Second')] }), to);
    const [onWhat, post, parts] = api.replies.addThread.mock.calls[0];
    expect(onWhat).toBe(actor);
    expect(post).toEqual({ access: 'public', language: 'en', location_ids: [11] });
    expect(parts).toEqual([
      { content: 'Hello', language: 'en' },
      { content: 'Second', language: 'en' },
    ]);
    expect(dispatched).toContainEqual({ type: 'NOTES_ADD_SUCCESS', node: { id: 21 } });
    expect(to.reset).toHaveBeenCalled();
  });

  it('makes the notes before a file, then has the app send the file in answer', async () => {
    api.replies.addThread.mockResolvedValue({ data: { parts: [{ id: 31 }] } });
    await sendShort(written({ threadParts: [note('With a file', { video }), note('After')] }), to);
    expect(api.replies.addThread.mock.calls[0][2]).toEqual([{ content: 'Hello', language: 'en' }]);
    const [owner, post, file, more] = to.upload.start.mock.calls[0];
    expect(owner).toBe(viewer);
    expect(post).toMatchObject({
      title: '',
      content: 'With a file',
      parentId: 31,
      threadAfter: [{ content: 'After', language: 'en' }],
    });
    expect(file).toBe(video);
    expect(more).toEqual([]);
  });

  it('keeps what is written when the server refuses it', async () => {
    api.replies.addThread.mockRejectedValue(new Error('no'));
    await sendShort(written({ threadParts: [note('Second')] }), to);
    expect(to.alertError).toHaveBeenCalled();
    expect(to.reset).not.toHaveBeenCalled();
    expect(to.setIsSending.mock.calls).toEqual([[true], [false]]);
  });
});
