/* eslint-disable jsx-a11y/anchor-is-valid */
// The link is drawn as a <button> (component="button"), which the rule
// cannot see.

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import EntityBody from './NodeBody';
import i18n from '../languages';

// The height of a line of a body, in ems, as the theme sets it.
const LINE = 1.5;

// A long text, shown by its first lines until the reader asks for the
// rest.
//
// The whole text is always drawn, and only its height is kept short, with
// the last line fading out. Cutting the text itself at so many characters
// cut through whatever was there, so that half a link or half of something
// bold was shown as the marks it is written with. Kept whole, nothing is
// cut, and a screen reader has all of it.
//
// "Read more" is offered only when the text is taller than the lines it is
// kept to, measured as drawn and again when its size changes, as when a
// picture in it loads.
const ReadMore = ({
  lines = 6,
  readMoreText = i18n.t('commons:readMore'),
  children,
  contentFilter = false,
  lang = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLong, setIsLong] = useState(false);
  const body = useRef(null);

  useEffect(() => {
    const element = body.current;
    if (!element || isOpen) {
      return undefined;
    }

    const measure = () => {
      setIsLong(element.scrollHeight > element.clientHeight + 1);
    };
    measure();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    // eslint-disable-next-line no-undef
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    // What is inside grows as pictures load; the box itself does not.
    Array.from(element.children).forEach((child) => {
      observer.observe(child);
    });
    return () => {
      observer.disconnect();
    };
  }, [children, isOpen, lines]);

  const isClipped = !isOpen && isLong;
  const fade = 'linear-gradient(to bottom, black 70%, transparent 100%)';

  return (
    <>
      <Box
        ref={body}
        sx={isOpen ? undefined : {
          maxHeight: `${lines * LINE}em`,
          overflow: 'hidden',
          ...(isClipped ? { maskImage: fade, WebkitMaskImage: fade } : {}),
        }}
      >
        <EntityBody contentFilter={contentFilter} lang={lang}>
          {children}
        </EntityBody>
      </Box>
      {isClipped &&
        <Link
          component="button"
          onClick={() => {
            setIsOpen(true);
          }}
          variant="body2"
          aria-expanded={false}
        >
          {readMoreText}
        </Link>}
    </>
  );
};

ReadMore.propTypes = {
  // The language of the text, passed on to where it is drawn.
  lang: PropTypes.string,
  // How many lines are shown until the reader asks for the rest.
  lines: PropTypes.number,
  readMoreText: PropTypes.string,
  children: PropTypes.string.isRequired,
  contentFilter: PropTypes.bool,
};

export default ReadMore;
