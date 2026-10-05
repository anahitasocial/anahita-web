import photoFiles from '../photoFiles';

const { STATUS } = photoFiles;

const file = (id, altText = '') => {
  return {
    id,
    altText,
    urls: {
      small: { url: `https://media.example/${id}-small` },
      medium: { url: `https://media.example/${id}-medium` },
    },
  };
};

const post = (...files) => {
  return {
    id: 7,
    name: 'Herons',
    portraitUrls: { medium: { url: 'https://media.example/cover' } },
    files,
  };
};

const names = (items) => {
  return items.map((item) => {
    return item.id || item.uploadId;
  });
};

describe('how many images a post holds', () => {
  it('is what the server says', () => {
    expect(photoFiles.maxFiles({ metadata: { photoMaxFiles: 6 } })).toBe(6);
  });

  it('is four until it has said', () => {
    expect(photoFiles.maxFiles(null)).toBe(4);
    expect(photoFiles.maxFiles({ metadata: {} })).toBe(4);
  });
});

describe('the images of a post', () => {
  it('are none for a post that was sent without the list', () => {
    const old = { id: 1, name: 'Old', portraitUrls: {} };

    expect(photoFiles.filesOf(old)).toEqual([]);
    expect(photoFiles.hasSeveral(old)).toBe(false);
    // And it is drawn as it always was.
    expect(photoFiles.asSingle(old, 0)).toBe(old);
  });

  it('are several only when there is more than one', () => {
    expect(photoFiles.hasSeveral(post(file('a')))).toBe(false);
    expect(photoFiles.hasSeveral(post(file('a'), file('b')))).toBe(true);
  });

  it('each stand in as the post\'s one image', () => {
    const medium = post(file('a'), file('b'));
    const second = photoFiles.asSingle(medium, 1);

    expect(second.portraitUrls.medium.url).toBe('https://media.example/b-medium');
    expect(second.name).toBe('Herons');
    // The post itself is not changed.
    expect(medium.portraitUrls.medium.url).toBe('https://media.example/cover');
  });

  it('are described by their own text, and by the title when they have none', () => {
    const medium = post(file('a', 'A heron standing'), file('b'));

    expect(photoFiles.altOf(medium, 0)).toBe('A heron standing');
    expect(photoFiles.altOf(medium, 1)).toBe('Herons');
    expect(photoFiles.altOf({ name: 'Old' }, 0)).toBe('Old');
  });
});

describe('stepping through a post\'s images', () => {
  it('stops at both ends', () => {
    expect(photoFiles.step(0, 1, 3)).toBe(1);
    expect(photoFiles.step(2, 1, 3)).toBe(2);
    expect(photoFiles.step(0, -1, 3)).toBe(0);
    expect(photoFiles.step(0, 1, 0)).toBe(0);
  });
});

describe('arranging images', () => {
  const items = () => {
    return photoFiles.fromMedium(post(file('a', 'first'), file('b'), file('c')));
  };

  it('starts from what the post has, in order', () => {
    const start = items();

    expect(names(start)).toEqual(['a', 'b', 'c']);
    expect(start[0].altText).toBe('first');
    expect(start[0].status).toBe(STATUS.READY);
    expect(start[0].previewUrl).toBe('https://media.example/a-small');
  });

  it('moves one a place at a time and leaves the ends alone', () => {
    const start = items();

    expect(names(photoFiles.move(start, 'file-c', -1))).toEqual(['a', 'c', 'b']);
    expect(names(photoFiles.move(start, 'file-a', 1))).toEqual(['b', 'a', 'c']);
    expect(photoFiles.move(start, 'file-a', -1)).toBe(start);
    expect(photoFiles.move(start, 'file-c', 1)).toBe(start);
    // The list it was given is not changed.
    expect(names(start)).toEqual(['a', 'b', 'c']);
  });

  it('removes one and says how much room is left', () => {
    const fewer = photoFiles.remove(items(), 'file-b');

    expect(names(fewer)).toEqual(['a', 'c']);
    expect(photoFiles.room(fewer, 4)).toBe(2);
    expect(photoFiles.room(items().concat(items()), 4)).toBe(0);
  });
});

describe('sending the list', () => {
  it('waits for every image to be stored', () => {
    const uploading = photoFiles.picked({ name: 'heron.jpg' }, 'blob:1');

    expect(uploading.status).toBe(STATUS.UPLOADING);
    expect(photoFiles.canSubmit([])).toBe(false);
    expect(photoFiles.canSubmit([uploading])).toBe(false);
    expect(photoFiles.isUploading([uploading])).toBe(true);

    const stored = photoFiles.update([uploading], uploading.key, {
      status: STATUS.READY,
      uploadId: 31,
    });
    expect(photoFiles.canSubmit(stored)).toBe(true);

    // One that failed holds the post back until it is removed.
    const failed = photoFiles.update([uploading], uploading.key, { status: STATUS.FAILED });
    expect(photoFiles.canSubmit(failed)).toBe(false);
  });

  it('gives each picked image a key of its own', () => {
    const one = photoFiles.picked({ name: 'same.jpg' }, 'blob:1');
    const two = photoFiles.picked({ name: 'same.jpg' }, 'blob:2');

    expect(one.key).not.toBe(two.key);
  });

  it('names an upload by its upload and a kept image by its id', () => {
    const kept = photoFiles.fromMedium(post(file('a.jpg', 'first')));
    const added = { key: 'picked-x', status: STATUS.READY, uploadId: 31, altText: '  a heron  ' };

    expect(photoFiles.toRequest([added, ...kept])).toEqual([
      { uploadId: 31, altText: 'a heron' },
      { id: 'a.jpg', altText: 'first' },
    ]);
  });

  it('knows when nothing has changed', () => {
    const medium = post(file('a', 'first'), file('b'));
    const start = photoFiles.fromMedium(medium);

    expect(photoFiles.isChanged(start, medium)).toBe(false);
    expect(photoFiles.isChanged(photoFiles.move(start, 'file-b', -1), medium)).toBe(true);
    expect(photoFiles.isChanged(photoFiles.update(start, 'file-b', { altText: 'now described' }), medium)).toBe(true);
    expect(photoFiles.isChanged(photoFiles.remove(start, 'file-b'), medium)).toBe(true);
  });
});
