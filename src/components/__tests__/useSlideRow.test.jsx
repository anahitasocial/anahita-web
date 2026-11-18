/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import useSlideRow, { scrollRow, slideAt } from '../useSlideRow';

// A row 400 pixels wide, scrolled to where the test says, that writes down
// where it was asked to scroll to.
const rowOf = (element, scrollLeft = 0) => {
  const row = element;
  Object.defineProperty(row, 'clientWidth', { value: 400, configurable: true });
  row.scrollLeft = scrollLeft;
  row.asked = [];
  row.scrollTo = (to) => {
    row.asked.push(to);
  };
  return row;
};

// A device that has asked for less motion, or not.
const still = (isStill) => {
  window.matchMedia = () => {
    return { matches: isStill };
  };
};

describe('useSlideRow', () => {
  let box;
  let root;
  let result;

  // eslint-disable-next-line react/prop-types
  const Row = ({ count }) => {
    result = useSlideRow(count);
    return <div ref={result.scroller} />;
  };

  const draw = (count) => {
    act(() => {
      root.render(<Row count={count} />);
    });
    return rowOf(box.firstChild);
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    box = document.createElement('div');
    root = createRoot(box);
    still(false);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    delete window.matchMedia;
  });

  it('starts on the first photo', () => {
    draw(3);
    expect(result.index).toBe(0);
  });

  it('slides to a photo, a row width each', () => {
    const row = draw(3);
    result.show(2);
    expect(row.asked).toEqual([{ left: 800, behavior: 'smooth' }]);
  });

  it('goes no further than the ends', () => {
    const row = draw(3);
    result.show(5);
    result.show(-1);
    expect(row.asked.map((to) => { return to.left; })).toEqual([800, 0]);
  });

  it('jumps when asked not to slide, or when the device wants less motion', () => {
    const row = draw(3);
    result.show(1, false);
    still(true);
    result.show(2);
    expect(row.asked.map((to) => { return to.behavior; })).toEqual(['auto', 'auto']);
  });

  it('reads the photo on show from where the row was scrolled to', () => {
    const row = draw(4);
    row.scrollLeft = 790;
    act(() => { result.handleScroll(); });
    expect(result.index).toBe(2);
    row.scrollLeft = 4000;
    act(() => { result.handleScroll(); });
    expect(result.index).toBe(3);
  });

  it('reads nothing from a row not laid out yet', () => {
    const row = draw(4);
    Object.defineProperty(row, 'clientWidth', { value: 0, configurable: true });
    row.scrollLeft = 800;
    act(() => { result.handleScroll(); });
    expect(result.index).toBe(0);
  });
});

describe('the row on its own', () => {
  afterEach(() => {
    delete window.matchMedia;
  });

  it('rests on the nearest photo, within the count', () => {
    const row = rowOf(document.createElement('div'), 610);
    expect(slideAt(row, 4)).toBe(2);
    expect(slideAt(row, 1)).toBe(0);
  });

  it('scrolls to a photo', () => {
    still(false);
    const row = rowOf(document.createElement('div'));
    scrollRow(row, 3);
    scrollRow(row, 1, false);
    expect(row.asked).toEqual([
      { left: 1200, behavior: 'smooth' },
      { left: 400, behavior: 'auto' },
    ]);
  });
});
