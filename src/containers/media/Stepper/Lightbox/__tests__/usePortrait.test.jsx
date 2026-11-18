/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import usePortrait from '../usePortrait';

// The images the hook loads out of band, each answered by the test.
let loading = [];
class FakeImage {
  constructor() {
    loading.push(this);
  }
}

const load = (src) => {
  const image = loading.find((each) => { return each.src === src; });
  act(() => { image.onload(); });
};

const fail = (src) => {
  const image = loading.find((each) => { return each.src === src; });
  act(() => { image.onerror(); });
};

const LARGE = 'https://a.example/large.jpg';
const MEDIUM = 'https://a.example/medium.jpg';
const ORIGINAL = 'https://a.example/original.jpg';

const photo = (id = 1) => {
  return {
    id,
    portraitUrls: {
      large: { url: LARGE },
      medium: { url: MEDIUM },
      original: { url: ORIGINAL },
    },
  };
};

describe('usePortrait', () => {
  let box;
  let root;
  let seen;
  let realImage;

  const Pane = (props) => {
    seen = usePortrait(props);
    return null;
  };

  const draw = (props) => {
    act(() => {
      root.render(<Pane {...props} />);
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

  it('shows the large size once it has loaded, and not before', () => {
    draw({ medium: photo() });
    expect(seen.hasPortrait).toBe(true);
    expect(seen.src).toBe('');
    load(LARGE);
    expect(seen.src).toBe(LARGE);
    expect(seen.isPortraitLoaded).toBe(false);
    act(() => { seen.handleImageLoad(); });
    expect(seen.isPortraitLoaded).toBe(true);
  });

  it('steps down to a smaller size the server never stored', () => {
    draw({ medium: photo() });
    fail(LARGE);
    load(MEDIUM);
    expect(seen.src).toBe(MEDIUM);
  });

  it('has nothing to show for a post with no picture', () => {
    draw({ medium: { id: 2 } });
    expect(seen.hasPortrait).toBe(false);
    expect(seen.canZoom).toBe(false);
  });

  it('fetches the original only when asked to zoom, and shows it once it is in', () => {
    draw({ medium: photo() });
    load(LARGE);
    expect(loading.some((each) => { return each.src === ORIGINAL; })).toBe(false);

    act(() => { seen.handleZoomToggle(); });
    expect(seen.isZoomLoading).toBe(true);
    expect(seen.isZoomed).toBe(false);
    expect(seen.src).toBe(LARGE);

    load(ORIGINAL);
    expect(seen.isZoomed).toBe(true);
    expect(seen.isZoomLoading).toBe(false);
    expect(seen.src).toBe(ORIGINAL);
    expect(seen.isPortraitLoaded).toBe(true);

    act(() => { seen.handleZoomToggle(); });
    expect(seen.isZoomed).toBe(false);
    expect(seen.src).toBe(LARGE);
    expect(seen.isPortraitLoaded).toBe(true);
  });

  it('offers no zoom once the original failed', () => {
    draw({ medium: photo() });
    load(LARGE);
    act(() => { seen.handleZoomToggle(); });
    fail(ORIGINAL);
    expect(seen.canZoom).toBe(false);
    expect(seen.isZoomed).toBe(false);
  });

  it('zooms out for another post, and drops the original on its way', () => {
    draw({ medium: photo(1) });
    load(LARGE);
    act(() => { seen.handleZoomToggle(); });
    const original = loading.find((each) => { return each.src === ORIGINAL; });
    draw({ medium: photo(2) });
    expect(seen.isZoomLoading).toBe(false);
    expect(original.onload).toBe(null);
  });

  it('takes a press that went nowhere for a click, and a drag for a pan', () => {
    draw({ medium: photo() });
    load(LARGE);
    act(() => { seen.handleZoomToggle(); });
    load(ORIGINAL);

    const pane = { scrollLeft: 100, scrollTop: 100 };
    seen.paneRef.current = pane;
    const press = { clientX: 50, clientY: 50, preventDefault: () => {} };
    act(() => { seen.handleMouseDown(press); });
    expect(seen.isPanning).toBe(true);
    act(() => { seen.handleMouseMove({ clientX: 30, clientY: 40 }); });
    expect(pane).toEqual({ scrollLeft: 120, scrollTop: 110 });
    act(() => { seen.handleMouseUp(); });
    expect(seen.isPanning).toBe(false);
    expect(seen.isZoomed).toBe(true);

    act(() => { seen.handleMouseDown(press); });
    act(() => { seen.handleMouseUp(); });
    expect(seen.isZoomed).toBe(false);
  });

  it('shows the image on show of a post with several', () => {
    const files = [
      { id: 1, urls: { large: { url: 'https://a.example/one.jpg' } } },
      { id: 2, urls: { large: { url: 'https://a.example/two.jpg' } } },
    ];
    draw({ medium: { id: 3, files, portraitUrls: files[0].urls }, fileIndex: 1 });
    load('https://a.example/two.jpg');
    expect(seen.src).toBe('https://a.example/two.jpg');
  });
});
