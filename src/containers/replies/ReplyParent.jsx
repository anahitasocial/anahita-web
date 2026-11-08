import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import api from '../../api';
import i18n from '../../languages';
import { excerptOf } from './ReplyContext';

// The reply a reply answers, on its own page, in the box above it (roadmap
// row 129): who wrote it and its first words, a line, leading to it. With
// the post at the top of the box, what is answered reads as a short chain.
// Until it has come, and if it cannot be read, the words that lead to it.
const ReplyParent = ({ id }) => {
  const [parent, setParent] = useState(null);

  useEffect(() => {
    let current = true;
    api.replies.read(id).then((result) => {
      if (current) {
        setParent(result.data);
      }
    }).catch(() => {
      // The words below stay.
    });
    return () => {
      current = false;
    };
  }, [id]);

  const name = parent && parent.author && parent.author.name;
  const excerpt = parent ? excerptOf(parent.content || '') : '';

  return (
    <Link
      href={`/notes/${id}/`}
      color="inherit"
      underline="none"
      sx={{
        display: 'block', mt: 1, pt: 1, borderTop: 1, borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="textSecondary" component="p">
        {name ?
          i18n.t('replies:context.thenTo', { name }) :
          i18n.t('replies:context.answered')}
      </Typography>
      {excerpt &&
        <Typography variant="body2" color="textSecondary" dir="auto" noWrap>
          {excerpt}
        </Typography>}
    </Link>
  );
};

ReplyParent.propTypes = {
  id: PropTypes.number.isRequired,
};

export default ReplyParent;
