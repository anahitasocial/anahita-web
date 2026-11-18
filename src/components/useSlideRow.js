import { useRef, useState } from 'react';

import photoFiles from '../utils/photoFiles';

// A row of photos, each as wide as the row, that the browser itself scrolls
// sideways and brings to rest on one (SlideRow.jsx has its CSS). The same
// row is what a reader swipes through on a post (PhotoSlides), what an
// author arranges in the composer (PhotoFilesEditor), and the lightbox's
// row of a post's images.
//
// Which photo is on show is read from where the row has been scrolled to,
// whoever scrolled it: a finger, a trackpad, the arrows or the keys.

// Whether somebody has asked their device for less motion: then a step is
// a jump, not a slide.
const isStill = () => {
  return Boolean(window.matchMedia) &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Which photo a row has come to rest on, kept within its count.
const slideAt = (row, count) => {
  return photoFiles.step(Math.round(Math.abs(row.scrollLeft) / row.clientWidth), 0, count);
};

// Scrolls a row to a photo, sliding there unless asked not to or unless the
// device wants less motion.
const scrollRow = (row, to, smooth = true) => {
  row.scrollTo({
    left: to * row.clientWidth,
    behavior: smooth && !isStill() ? 'smooth' : 'auto',
  });
};

// The row of a component that keeps its own place in it: the ref to put on
// the row, which photo is on show, `show(to)` to go to one (kept within the
// row), and `handleScroll` for the row's onScroll.
const useSlideRow = (count) => {
  const scroller = useRef(null);
  const [index, setIndex] = useState(0);

  const show = (to, smooth = true) => {
    const row = scroller.current;
    if (!row) {
      return;
    }
    scrollRow(row, photoFiles.step(to, 0, count), smooth);
  };

  const handleScroll = () => {
    const row = scroller.current;
    if (!row || !row.clientWidth) {
      return;
    }
    setIndex(slideAt(row, count));
  };

  return {
    scroller,
    index,
    setIndex,
    show,
    handleScroll,
  };
};

export { isStill, scrollRow, slideAt };
export default useSlideRow;
