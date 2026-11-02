/* global ResizeObserver */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

// How wide the column beside a feed is, and the buttons that choose a feed's
// view, in that column or at the end of a row of tabs.
export const sideWidth = 160;

// How tabs look in the column beside a feed: the line that marks the open one
// towards the feed, and their labels lined up on the left.
export const sideTabsSx = {
  '& .MuiTabs-indicator': { left: 0, right: 'auto' },
};

export const sideTabSx = {
  minHeight: 48,
  justifyContent: 'flex-start',
  textAlign: 'left',
};

// For a column beside a feed that may be taller than the window: its `top`,
// so that it scrolls with the page until its foot is in view, and then stays.
// One that fits stays under the top bar.
export const useStickyColumn = (enabled, top = 80) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState(top);

  useEffect(() => {
    const column = ref.current;
    if (!enabled || !column) {
      return undefined;
    }

    const measure = () => {
      setOffset(Math.min(top, window.innerHeight - column.offsetHeight - 16));
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(column);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [enabled]);

  return [ref, offset];
};

// For the list under a page's tabs: where it is, and what to do when a tab is
// chosen. If the page is scrolled down that list, the next one starts under
// the top bar; otherwise nothing moves. `listSx` keeps the list's room while
// the next one is read, or the page would collapse and the window jump.
export const listSx = { minHeight: 'calc(100vh - 80px)' };

export const useTabbedList = () => {
  const listRef = useRef(null);

  const startList = () => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const start = list.getBoundingClientRect().top + window.scrollY - 80;
    if (window.scrollY > start) {
      window.scrollTo(0, start);
    }
  };

  return [listRef, startList];
};

// The column beside a feed. It stays in view as the feed is scrolled, under
// the top bar.
const SideTabs = ({ width = sideWidth, children }) => {
  return (
    <Box sx={{ position: 'sticky', top: 80, width }}>
      {children}
    </Box>
  );
};

SideTabs.propTypes = {
  // The whole of its column, where that has more room than the usual width.
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  children: PropTypes.node.isRequired,
};

export default SideTabs;
