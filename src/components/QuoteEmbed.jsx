import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import ActorAvatar from './ActorAvatar';
import i18n from '../languages';
import utils from '../utils';
import quotes from '../utils/quotes';

const { getURL, getPortraitURL } = utils.node;

// How much of the quoted post's text is shown. The rest is a click away.
const EXCERPT = 280;

const excerptOf = (text = '') => {
  const plain = String(text).replace(/\s+/g, ' ').trim();
  return plain.length > EXCERPT ? `${plain.slice(0, EXCERPT).trim()}…` : plain;
};

// The post a note quotes, drawn inside the note under its own words.
//
// The server sends the post only to somebody who may see it, and otherwise
// says why it is not there: the reader may not see it or it is gone
// ("unavailable"), or its author took it out of this quote ("detached").
// Both are drawn as a line in the same frame, so the note still reads as
// one that quoted something.
//
// `onDetach`, when given, offers the quoted post's author a way to take
// their post out. `onRemove` is for a quote being written: a way to drop it.
const QuoteEmbed = ({
  quote = null,
  onDetach = null,
  onRemove = null,
  detaching = false,
}) => {
  const state = quotes.stateOf(quote);

  if (!state) {
    return null;
  }

  const frame = {
    mt: 2,
    border: 1,
    borderColor: 'divider',
    borderRadius: 1,
    overflow: 'hidden',
  };

  if (state !== 'shown') {
    return (
      <Box sx={{ ...frame, p: 2 }}>
        <Typography variant="body2" color="textSecondary">
          {i18n.t(`replies:quote.${state}`)}
        </Typography>
      </Box>
    );
  }

  const { post } = quote;
  const author = post.author || {};
  const url = getURL(post);
  const image = getPortraitURL(post, 'medium');
  const excerpt = excerptOf(post.body);
  const createdAt = post.createdAt ? moment.utc(post.createdAt) : null;

  return (
    <Box sx={frame} component="blockquote" style={{ marginLeft: 0, marginRight: 0, marginBottom: 0 }}>
      <CardHeader
        sx={{ pb: 0 }}
        avatar={
          <ActorAvatar
            actor={author}
            linked={Boolean(author.id)}
            size="small"
          />
        }
        title={author.id ? (
          <Link href={getURL(author)}>
            {author.name}
          </Link>
        ) : author.name}
        subheader={createdAt &&
          <Link
            href={url}
            color="inherit"
            title={createdAt.local().format('LLL')}
          >
            {createdAt.fromNow()}
          </Link>}
      />
      <Box sx={{ p: 2 }}>
        {post.name &&
          <Typography variant="subtitle2" dir="auto">
            <Link href={url} color="inherit">
              {post.name}
            </Link>
          </Typography>}
        {excerpt &&
          <Typography
            variant="body2"
            dir="auto"
            sx={{ overflowWrap: 'anywhere' }}
          >
            {excerpt}
          </Typography>}
        {!post.name && !excerpt && !image &&
          <Link href={url} variant="body2">
            {i18n.t('replies:quote.open')}
          </Link>}
      </Box>
      {image &&
        <Link href={url} sx={{ display: 'block', lineHeight: 0 }}>
          <Box
            component="img"
            src={image}
            alt={post.name || ''}
            sx={{
              width: '100%',
              maxHeight: 320,
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Link>}
      {(onDetach || onRemove) &&
        <Box sx={{ p: 1 }}>
          {onDetach &&
            <Button
              size="small"
              color="inherit"
              fullWidth
              disabled={detaching}
              onClick={onDetach}
            >
              {i18n.t('replies:quote.detach')}
            </Button>}
          {onRemove &&
            <Button
              size="small"
              color="inherit"
              fullWidth
              onClick={onRemove}
            >
              {i18n.t('replies:quote.remove')}
            </Button>}
        </Box>}
    </Box>
  );
};

QuoteEmbed.propTypes = {
  // As the server sends it on a note that quotes: { state } or { post }.
  quote: PropTypes.shape({
    state: PropTypes.string,
    post: PropTypes.object,
  }),
  onDetach: PropTypes.func,
  onRemove: PropTypes.func,
  detaching: PropTypes.bool,
};

export default QuoteEmbed;
