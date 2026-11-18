/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import useMediumRead from '../useMediumRead';

// The images the hook loads out of band, each answered by the test.
let loading = [];
class FakeImage {
  constructor() {
    loading.push(this);
  }
}

const PHOTO = 'node.medium.photo-service.photo.v1';
const ORIGINAL = 'https://a.example/original.jpg';

describe('useMediumRead', () => {
  let box;
  let root;
  let seen;
  let realImage;

  // eslint-disable-next-line react/prop-types
  const Page = ({ medium, cover = null }) => {
    seen = useMediumRead(medium, cover);
    return null;
  };

  const draw = (props) => {
    act(() => {
      root.render(<Page {...props} />);
    });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    box = document.createElement('div');
    root = createRoot(box);
    loading = [];
    realImage = window.Image;
    window.Image = FakeImage;
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    window.Image = realImage;
  });

  it('shows one photo once it has loaded', () => {
    draw({ medium: { id: 1, type: PHOTO, portraitUrls: { original: { url: ORIGINAL } } } });
    expect(seen.portrait).toBe(ORIGINAL);
    expect(seen.isLoaded).toBe(false);
    act(() => { loading[0].onload(); });
    expect(seen.isLoaded).toBe(true);
  });

  it('has nothing to wait for without a photo', () => {
    draw({ medium: { id: 2, type: 'node.medium.text-service.note.v1', content: 'Hello' } });
    expect(seen.isLoaded).toBe(true);
    expect(loading).toHaveLength(0);
    expect(seen.content).toBe('Hello');
  });

  it('draws a post of several photos as slides', () => {
    const files = [{ id: 1 }, { id: 2 }];
    draw({ medium: { id: 3, type: PHOTO, files } });
    expect(seen.hasSlides).toBe(true);
  });

  it('says where pictures were taken away', () => {
    draw({ medium: { id: 4, type: PHOTO, mediaRemoved: true } });
    expect(seen.isRemoved).toBe(true);
  });

  it('puts the warning over the pictures of a photo', () => {
    draw({
      medium: {
        id: 5, type: PHOTO, files: [{ id: 1 }], portraitUrls: { original: { url: ORIGINAL } },
      },
    });
    expect(seen.media).toBe(true);
    expect(seen.coversPictures).toBe(true);
    expect(seen.coversPlaying).toBe(false);
  });

  it('puts it over a sound, which has no pictures', () => {
    draw({ medium: { id: 6, type: 'node.medium.video-service.audio.v1', audio: { id: 1 } } });
    expect(seen.coversPictures).toBe(false);
    expect(seen.coversPlaying).toBe(true);
  });

  it('puts it over neither for long writing, whose words it covers', () => {
    draw({
      medium: { id: 7, type: 'node.medium.text-service.article.v1' },
      cover: <span />,
    });
    expect(seen.isLong).toBe(true);
    expect(seen.coversPictures).toBe(false);
    expect(seen.coversPlaying).toBe(false);
  });
});
