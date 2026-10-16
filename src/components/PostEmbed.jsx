import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import LinkPreviewCard from './LinkPreviewCard';
import PhotoSlides from './PhotoSlides';
import VideoPlayer from './VideoPlayer';
import api from '../api';
import embeds from '../utils/embeds';
import plainText from '../utils/plainText';
import utils from '../utils';

const {
  getAuthor,
  getActorName,
  getURL,
  getCoverURL,
} = utils.node;

// How much of an embedded post's words are shown. The rest is a click away.
const EXCERPT = 280;

const excerptOf = (text = '') => {
  const plain = plainText(text).replace(/\s+/g, ' ').trim();
  return plain.length > EXCERPT ? `${plain.slice(0, EXCERPT).trim()}…` : plain;
};

// The space an embed takes in the text: a paragraph's, so it reads as part
// of what is written around it rather than as something set beside it.
const SPACE = { my: 2 };

// The address as a link, for whatever cannot be shown: a page with no card,
// a post the reader may not see or that is gone.
const PlainLink = ({ url }) => {
  return (
    <Box component="p" sx={SPACE}>
      <Link href={url} rel="noopener noreferrer nofollow" target="_blank" sx={{ wordWrap: 'break-word' }}>
        {url}
      </Link>
    </Box>
  );
};

PlainLink.propTypes = {
  url: PropTypes.string.isRequired,
};

// Who wrote an embedded post, and where it is: under its pictures or its
// video, small, a link to the post itself.
const Byline = ({ post }) => {
  const name = getActorName(getAuthor(post));
  return (
    <Typography variant="caption" color="textSecondary" component="div" sx={{ mt: 1 }} dir="auto">
      <Link component={RouterLink} to={getURL(post)} color="inherit" underline="hover">
        {[post.name, name].filter(Boolean).join(' · ')}
      </Link>
    </Typography>
  );
};

Byline.propTypes = {
  post: PropTypes.object.isRequired,
};

// An embedded post that is words: as a quotation is set, a rule down its
// side and no frame, with an article's cover above its title.
const Words = ({ post }) => {
  const cover = getCoverURL(post, 'medium');
  const text = excerptOf(post.excerpt || post.body);
  return (
    <Link
      component={RouterLink}
      to={getURL(post)}
      color="inherit"
      underline="none"
      sx={{
        ...SPACE,
        display: 'block',
        borderInlineStart: 3,
        borderColor: 'divider',
        pl: 2,
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      {cover &&
        <Box
          component="img"
          src={cover}
          alt=""
          loading="lazy"
          sx={{
            width: '100%',
            aspectRatio: '3 / 1',
            objectFit: 'cover',
            display: 'block',
            borderRadius: 1,
            mb: 1,
          }}
        />}
      {post.name &&
        <Typography variant="subtitle1" component="div" dir="auto" sx={{ fontWeight: 500 }}>
          {post.name}
        </Typography>}
      {text &&
        <Typography variant="body2" color="textSecondary" dir="auto">
          {text}
        </Typography>}
      <Typography variant="caption" color="textSecondary" component="div" sx={{ mt: 0.5 }}>
        {getActorName(getAuthor(post))}
      </Typography>
    </Link>
  );
};

Words.propTypes = {
  post: PropTypes.object.isRequired,
};

// A post of this installation, read as the reader: one they may not see,
// or that is gone, is the link and nothing else.
const Post = ({ url, at }) => {
  const [post, setPost] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let current = true;
    setPost(null);
    setFailed(false);
    api[at.namespace].read(at.id).then((result) => {
      if (current) {
        setPost(result.data);
      }
    }).catch(() => {
      if (current) {
        setFailed(true);
      }
    });
    return () => {
      current = false;
    };
  }, [at.namespace, at.id]);

  if (failed) {
    return <PlainLink url={url} />;
  }

  // Room kept while it is read, so the text under it moves as little as it
  // can when it comes.
  if (!post) {
    return <Skeleton variant="rounded" height={120} sx={SPACE} />;
  }

  if (at.kind === 'photo') {
    return (
      <Box sx={SPACE}>
        <PhotoSlides medium={post} size="large" />
        <Byline post={post} />
      </Box>
    );
  }

  if (at.kind === 'video' && post.video) {
    return (
      <Box sx={SPACE}>
        <VideoPlayer video={post.video} title={post.name} />
        <Byline post={post} />
      </Box>
    );
  }

  return <Words post={post} />;
};

Post.propTypes = {
  url: PropTypes.string.isRequired,
  at: PropTypes.shape({
    namespace: PropTypes.string,
    kind: PropTypes.string,
    id: PropTypes.number,
  }).isRequired,
};

// What an address on a line of its own in an article or a topic shows: a
// post of this installation as itself, a page elsewhere by the card kept
// with the post when it was saved (`cards`). See utils/embeds.
const PostEmbed = ({
  url,
  cards = [],
}) => {
  if (embeds.isOurs(url)) {
    const at = embeds.postAt(url);
    if (at) {
      return <Post url={url} at={at} />;
    }
    return <PlainLink url={url} />;
  }

  const card = (cards || []).find((each) => {
    return embeds.samePage(each.url, url);
  });
  if (!card) {
    return <PlainLink url={url} />;
  }

  // The card's own top margin, and one below to match.
  return (
    <Box sx={{ mb: 2 }}>
      <LinkPreviewCard preview={card} />
    </Box>
  );
};

PostEmbed.propTypes = {
  url: PropTypes.string.isRequired,
  cards: PropTypes.arrayOf(PropTypes.object),
};

export default PostEmbed;
