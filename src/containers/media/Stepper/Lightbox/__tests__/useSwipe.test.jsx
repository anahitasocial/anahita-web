/* global globalThis, HTMLElement */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

import useSwipe from '../useSwipe';

// A touch across the pane, from one place to another.
const touch = (x) => {
  return { changedTouches: [{ clientX: x }] };
};

describe('useSwipe', () => {
  let box;
  let root;
  let seen;
  let asked;

  // The pane, with the row of a post's images when it has one: a row 400
  // pixels wide that writes down where it was asked to scroll to.
  // eslint-disable-next-line react/prop-types
  const Pane = ({ withRow = false, ...props }) => {
    seen = useSwipe(props);
    return withRow ? <div ref={seen.rowRef} /> : null;
  };

  const steps = () => {
    return {
      hasNext: true,
      hasPrev: true,
      handleNext: vi.fn(),
      handlePrev: vi.fn(),
      handleFileIndex: vi.fn(),
    };
  };

  const draw = (props) => {
    act(() => {
      root.render(<Pane {...props} />);
    });
  };

  const swipe = (from, to) => {
    act(() => { seen.handleTouchStart(touch(from)); });
    act(() => { seen.handleTouchEnd(touch(to)); });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    box = document.createElement('div');
    root = createRoot(box);
    asked = [];
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { value: 400, configurable: true });
    HTMLElement.prototype.scrollTo = function scrollTo(to) {
      asked.push(to);
    };
    window.matchMedia = () => { return { matches: false }; };
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    delete HTMLElement.prototype.clientWidth;
    delete HTMLElement.prototype.scrollTo;
    delete window.matchMedia;
  });

  it('goes on to the next post by a swipe to the left, back by one to the right', () => {
    const props = { ...steps(), medium: { id: 1 }, fileCount: 0 };
    draw(props);
    swipe(300, 100);
    expect(props.handleNext).toHaveBeenCalledTimes(1);
    swipe(100, 300);
    expect(props.handlePrev).toHaveBeenCalledTimes(1);
  });

  it('takes a short touch for no swipe, and none at all while zoomed', () => {
    const props = { ...steps(), medium: { id: 1 }, fileCount: 0 };
    draw(props);
    swipe(300, 270);
    draw({ ...props, isZoomed: true });
    swipe(300, 100);
    expect(props.handleNext).not.toHaveBeenCalled();
  });

  it('leaves a post of several images only from its ends', () => {
    const props = {
      ...steps(), medium: { id: 1 }, fileCount: 3, hasRow: true, withRow: true,
    };
    draw({ ...props, fileIndex: 1 });
    swipe(300, 100);
    swipe(100, 300);
    expect(props.handleNext).not.toHaveBeenCalled();
    expect(props.handlePrev).not.toHaveBeenCalled();

    draw({ ...props, fileIndex: 2 });
    swipe(300, 100);
    expect(props.handleNext).toHaveBeenCalledTimes(1);
  });

  it('puts a new row on its image at once, and slides to the next', () => {
    const props = {
      ...steps(), medium: { id: 1 }, fileCount: 3, hasRow: true, withRow: true,
    };
    draw({ ...props, fileIndex: 2 });
    expect(asked).toEqual([{ left: 800, behavior: 'auto' }]);
    draw({ ...props, fileIndex: 1 });
    expect(asked[1]).toEqual({ left: 400, behavior: 'smooth' });
  });

  it('tells the stepper where the row was swiped to, and does not scroll it again', () => {
    const props = {
      ...steps(), medium: { id: 1 }, fileCount: 3, hasRow: true, withRow: true,
    };
    draw({ ...props, fileIndex: 0 });
    box.firstChild.scrollLeft = 410;
    act(() => { seen.handleRowScroll(); });
    expect(props.handleFileIndex).toHaveBeenCalledWith(1);
    draw({ ...props, fileIndex: 1 });
    expect(asked).toHaveLength(1);
  });
});
