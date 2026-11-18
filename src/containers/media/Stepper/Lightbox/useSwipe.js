import { useLayoutEffect, useRef } from 'react';

import photoFiles from '../../../../utils/photoFiles';
import { scrollRow } from '../../../../components/useSlideRow';

const SWIPE_THRESHOLD = 50;

// How the lightbox is stepped through by hand: the row of a post's images,
// kept where the stepper says it is and telling the stepper where it was
// swiped to, and a swipe across the picture that goes on to the next post
// or back to the one before.
//
// It gives the ref and onScroll for the row, and the touch handlers for the
// pane.
const useSwipe = ({
  medium,
  fileIndex = 0,
  fileCount,
  hasRow,
  isZoomed,
  handleFileIndex = null,
  hasNext,
  hasPrev,
  handleNext,
  handlePrev,
}) => {
  const touchStartRef = useRef(null);
  // The row of a post's images, the image it was last scrolled to, and
  // whether it has only just been put on the page.
  const rowRef = useRef(null);
  const scrolledToRef = useRef(0);
  const rowIsNewRef = useRef(true);
  const rowMediumRef = useRef(null);

  // Keeps the row where the stepper says it is. The stepper moves through
  // a post's images for the arrows and the arrow keys; a swipe moves the
  // row itself and tells the stepper afterwards, and that must not be
  // answered by scrolling the row again.
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) {
      // Not on the page: zoomed, or a post with one image. When it comes
      // back it starts at the first image and has to be put right.
      rowIsNewRef.current = true;
      return;
    }

    // Each post has a row of its own, so another post is a new row too.
    const isNew = rowIsNewRef.current || rowMediumRef.current !== medium.id;
    rowIsNewRef.current = false;
    rowMediumRef.current = medium.id;
    if (!isNew && scrolledToRef.current === fileIndex) {
      return;
    }

    scrolledToRef.current = fileIndex;
    // A step slides. Arriving at a post, or back from a zoom, does not:
    // the image wanted is simply there.
    scrollRow(row, fileIndex, !isNew);
  }, [fileIndex, medium.id, isZoomed, hasRow]);

  const handleRowScroll = () => {
    const row = rowRef.current;
    if (!row || !row.clientWidth) return;

    const at = photoFiles.step(Math.round(row.scrollLeft / row.clientWidth), 0, fileCount);
    if (at === scrolledToRef.current) return;

    scrolledToRef.current = at;
    if (handleFileIndex) handleFileIndex(at);
  };

  const handleTouchStart = (event) => {
    if (isZoomed) return;
    touchStartRef.current = {
      x: event.changedTouches[0].clientX,
      fileIndex,
    };
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    // While zoomed a horizontal drag is panning the photo, not stepping off it.
    if (isZoomed || start === null) return;

    const distance = event.changedTouches[0].clientX - start.x;
    if (Math.abs(distance) < SWIPE_THRESHOLD) return;

    // Within a post's images the row scrolls itself. A swipe leaves the
    // post only from its ends: on from the last image, back from the
    // first.
    if (hasRow) {
      if (distance < 0 && start.fileIndex < fileCount - 1) return;
      if (distance > 0 && start.fileIndex > 0) return;
    }

    if (distance < 0 && hasNext) handleNext();
    if (distance > 0 && hasPrev) handlePrev();
  };

  return {
    rowRef,
    handleRowScroll,
    handleTouchStart,
    handleTouchEnd,
  };
};

export default useSwipe;
