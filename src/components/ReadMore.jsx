/* eslint-disable jsx-a11y/anchor-is-valid, no-alert */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Link from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
import striptags from 'striptags';
import EntityBody from './NodeBody';
import i18n from '../languages';

const CHAR_LIMIT = 280;

const ReadMore = ({
  charLimit = CHAR_LIMIT,
  readMoreText = i18n.t('commons:readMore'),
  children,
  contentFilter = false,
  lang = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  const shortBody = `${striptags(children.substr(0, charLimit))}... `;
  const longBody = `${children} `;

  if (striptags(children).length < charLimit) {
    return (
      <EntityBody contentFilter={contentFilter} lang={lang}>
        {longBody}
      </EntityBody>
    );
  }

  return (
    <>
      <Collapse
        in={!isOpen}
        timeout="auto"
        unmountOnExit
      >
        <EntityBody contentFilter={contentFilter} lang={lang}>
          {shortBody}
        </EntityBody>
        <Link
          component="button"
          onClick={toggleCollapse}
          variant="body2"
        >
          {readMoreText}
        </Link>
      </Collapse>
      <Collapse
        in={isOpen}
        timeout="auto"
        unmountOnExit
      >
        <EntityBody contentFilter={contentFilter} lang={lang}>
          {longBody}
        </EntityBody>
      </Collapse>
    </>
  );
};

ReadMore.propTypes = {
  // The language of the text, passed on to where it is drawn.
  lang: PropTypes.string,
  charLimit: PropTypes.number,
  readMoreText: PropTypes.string,
  children: PropTypes.string.isRequired,
  contentFilter: PropTypes.bool,
};

export default ReadMore;
