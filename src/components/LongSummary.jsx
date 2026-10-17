import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { usePost } from './PostEmbed';
import summary from '../utils/summary';
import utils from '../utils';
import i18n from '../languages';

const { getPortraitURL } = utils.node;

// Whether a post is long writing, an article or a topic, which a list shows
// by its summary and not in full (the user, 2026-10-16).
const isLong = (node) => {
  return /\.(article|topic)\.v1$/.test((node && node.type) || '');
};

// The picture of an article that has no cover: the first photo it shows,
// as WordPress takes a featured image.
const SummaryPicture = ({ node, url }) => {
  const { firstPhoto } = summary.contentsOf(node.content);
  const { post } = usePost(firstPhoto);
  const image = post ? (getPortraitURL(post, 'medium') || getPortraitURL(post, 'large')) : '';
  if (!image) {
    return null;
  }
  return (
    <Link component={RouterLink} to={url} sx={{ display: 'block' }}>
      <Box
        component="img"
        src={image}
        alt=""
        loading="lazy"
        sx={{
          width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block',
        }}
      />
    </Link>
  );
};

SummaryPicture.propTypes = {
  node: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
};

// An article or a topic in a list or a feed: its opening, as plain words,
// what is in it, and Read more, which opens it in place. What it shows
// within itself is on its page.
const LongSummary = ({ node, url }) => {
  const opening = summary.openingOf(node.content);
  const contents = summary.contentsOf(node.content);
  const inside = ['photos', 'videos', 'citations'].filter((what) => {
    return contents[what] > 0;
  }).map((what) => {
    return i18n.t(`media:summary.${what}`, { count: contents[what] });
  });
  const lang = node.language && node.language !== 'und' ? node.language : undefined;

  return (
    <Box>
      {opening &&
        <Typography variant="body1" dir="auto" lang={lang}>
          {opening}
        </Typography>}
      {inside.length > 0 &&
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {inside.join(' · ')}
        </Typography>}
      <Link component={RouterLink} to={url} variant="body2" sx={{ mt: 1, display: 'inline-block' }}>
        {i18n.t('commons:readMore')}
      </Link>
    </Box>
  );
};

LongSummary.propTypes = {
  node: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
};

export { isLong, SummaryPicture };
export default LongSummary;
