import api from '../../../api';
import sendReply, { addAll, notAddedKey } from '../sendReply';

vi.mock('../../../api', () => {
  return {
    default: {
      replies: {
        add: vi.fn(),
        addWithPictures: vi.fn(),
        addReplyThread: vi.fn(),
      },
    },
  };
});

// Somebody who writes in French, so that every note says so.
const viewer = { id: 7, language: 'fr' };
const parent = { id: 10 };
const note = (words, video = null) => {
  return {
    key: words, words, photos: [], video, linkPreviewUrl: '',
  };
};

describe('sendReply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends words alone as a note, with its card', async () => {
    api.replies.add.mockResolvedValue({ data: { id: 11 } });

    const sent = await sendReply(viewer, parent, 'Hello', { linkPreviewUrl: 'https://a.example' });

    expect(api.replies.add).toHaveBeenCalledWith(parent, {
      content: 'Hello', card: { linkPreviewUrl: 'https://a.example' }, language: 'fr', warning: {},
    });
    expect(sent).toEqual({ made: [{ id: 11 }], onTheWay: null });
  });

  it('sends pictures as a photo post, with its warning', async () => {
    api.replies.addWithPictures.mockResolvedValue({ data: { id: 12 } });

    await sendReply(viewer, parent, 'Look', {}, {
      uploads: [{ id: 3 }], warning: { kind: 'graphic', text: '' },
    });

    expect(api.replies.addWithPictures).toHaveBeenCalledWith(parent, {
      content: 'Look', language: 'fr', uploads: [{ id: 3 }], warning: { warning: 'graphic' },
    });
  });

  it('leaves a video on its way, asking nothing of the server yet', async () => {
    const file = { name: 'a.mp4' };

    const sent = await sendReply(viewer, parent, 'Watch', {}, { video: file });

    expect(api.replies.add).not.toHaveBeenCalled();
    expect(sent).toEqual({
      made: [],
      onTheWay: {
        parent, body: 'Watch', language: 'fr', warning: {}, file,
      },
    });
  });

  it('makes a thread of words together, in order', async () => {
    api.replies.addReplyThread.mockResolvedValue({ data: { parts: [{ id: 13 }, { id: 14 }] } });

    const sent = await sendReply(viewer, parent, 'One', { linkPreviewUrl: 'https://a.example' }, {
      thread: [note('Two')],
    });

    expect(api.replies.addReplyThread).toHaveBeenCalledWith(parent, [
      { content: 'One', language: 'fr', linkPreviewUrl: 'https://a.example' },
      { content: 'Two', language: 'fr' },
    ], {});
    expect(sent.made).toEqual([{ id: 13 }, { id: 14 }]);
  });

  it('makes the notes before a thread\'s first file, then sends the file under the last', async () => {
    api.replies.addReplyThread.mockResolvedValue({ data: { parts: [{ id: 15 }, { id: 16 }] } });
    const file = { name: 'b.mp4' };

    const sent = await sendReply(viewer, parent, 'One', {}, {
      firstNote: note('One'),
      thread: [note('Two'), note(' Three ', file), note('Four')],
    });

    expect(api.replies.addReplyThread).toHaveBeenCalledWith(parent, [
      { content: 'One', language: 'fr' },
      { content: 'Two', language: 'fr' },
    ], {});
    expect(sent.made).toEqual([{ id: 15 }, { id: 16 }]);
    expect(sent.onTheWay).toEqual({
      parent: { id: 16 },
      body: 'Three',
      language: 'fr',
      warning: {},
      threadAfter: [{ content: 'Four', language: 'fr' }],
      more: [],
      file,
    });
  });

  it('sends a thread that begins with a file under what it answers', async () => {
    const file = { name: 'c.mp4' };

    const sent = await sendReply(viewer, parent, '', {}, {
      firstNote: note('', file),
      thread: [note('After')],
    });

    expect(api.replies.addReplyThread).not.toHaveBeenCalled();
    expect(sent.onTheWay.parent).toBe(parent);
    expect(sent.onTheWay.threadAfter).toEqual([{ content: 'After', language: 'fr' }]);
  });

  it('passes a refusal on as it came', async () => {
    const refusal = { response: { status: 403 } };
    api.replies.add.mockRejectedValue(refusal);

    await expect(sendReply(viewer, parent, 'No')).rejects.toBe(refusal);
  });
});

describe('notAddedKey', () => {
  it('says a refusal as one, and anything else as not added', () => {
    expect(notAddedKey({ response: { status: 403 } })).toBe('replies:prompts.notAllowed');
    expect(notAddedKey({ response: { status: 500 } })).toBe('replies:prompts.notAdded');
    expect(notAddedKey(undefined)).toBe('replies:prompts.notAdded');
  });
});

describe('addAll', () => {
  it('puts what was made after what is held, in order', () => {
    expect(addAll([{ id: 1 }], [{ id: 2 }, { id: 3 }])).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });
});
