import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import LinkPreviewCard from './LinkPreviewCard';
import PhotoSlides from './PhotoSlides';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import {
  SPACE,
  Caption,
  Framed,
  PlainLink,
  Who,
  Words,
  clamp,
  excerptOf,
} from './EmbedParts';
import { usePost, useProfile } from './useEmbedded';
import embeds from '../utils/embeds';
import utils from '../utils';
import i18n from '../languages';
import WarningCover, { useWarning } from './WarningCover';

const { getURL, getCoverURL } = utils.node;

// Room kept while a post or a profile is read, so the text under it moves
// as little as it can when it comes.
const Reading = () => {
  return <Skeleton variant="rounded" height={120} sx={SPACE} />;
};

// A profile here, a person, a group or an event, framed as a page's card
// is: its cover, who it is, a few lines of what it says of itself, and a
// way to it (the user, 2026-10-16).
const Profile = ({ url, alias }) => {
  const { actor, failed } = useProfile(alias);

  if (failed) {
    return <PlainLink url={url} />;
  }
  if (!actor) {
    return <Reading />;
  }

  const about = excerptOf(actor.body || '', 200);
  return (
    <Framed cover={getCoverURL(actor, 'medium')}>
      <Who actor={actor} size={40} />
      {about &&
        <Typography variant="body2" component="div" dir="auto" sx={{ mt: 1, ...clamp(3) }}>
          {about}
        </Typography>}
      <Typography variant="body2" component="div" sx={{ mt: 1 }}>
        <Link component={RouterLink} to={getURL(actor)} underline="hover">
          {i18n.t('media:embed.viewProfile')}
        </Link>
      </Typography>
    </Framed>
  );
};

Profile.propTypes = {
  url: PropTypes.string.isRequired,
  alias: PropTypes.string.isRequired,
};

// The kinds of post that are embedded as what they show, with a caption
// under it, by the kind an address is to (utils/embeds): whether the post
// has it, and how it is drawn. Any other kind, or one without what it
// should show, is embedded as its words.
const SHOWN = {
  photo: {
    has: () => {
      return true;
    },
    draw: (post) => {
      return <PhotoSlides medium={post} size="large" natural />;
    },
  },
  video: {
    has: (post) => {
      return Boolean(post.video);
    },
    draw: (post) => {
      return <VideoPlayer video={post.video} title={post.title} />;
    },
  },
  audio: {
    has: (post) => {
      return Boolean(post.audio);
    },
    draw: (post) => {
      return <AudioPlayer audio={post.audio} title={post.title} />;
    },
  },
};

// A post of this installation, read as the reader: one they may not see,
// or that is gone, is the link and nothing else.
const Post = ({ url, at }) => {
  const { post, failed } = usePost(at);
  // Its content warning, over its picture, video or sound and not its
  // caption, or over its words when it has nothing else (row 122).
  const warned = useWarning(post);

  if (failed) {
    return <PlainLink url={url} />;
  }
  if (!post) {
    return <Reading />;
  }

  const shown = SHOWN[at.kind];
  if (shown && shown.has(post)) {
    return (
      <Box sx={SPACE}>
        <WarningCover state={warned}>
          {shown.draw(post)}
        </WarningCover>
        <Caption post={post} />
      </Box>
    );
  }

  return (
    <WarningCover state={warned}>
      <Words post={post} />
    </WarningCover>
  );
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
// post of this installation as itself, a profile here as its card, a page
// elsewhere by the card kept with the post when it was saved (`cards`). See
// utils/embeds. The parts it is drawn with are in EmbedParts and the reading
// in useEmbedded; what the text cites, at its end, is in Citations.
const PostEmbed = ({
  url,
  cards = [],
}) => {
  if (embeds.isOurs(url)) {
    const at = embeds.postAt(url);
    if (at) {
      return <Post url={url} at={at} />;
    }
    const profile = embeds.profileAt(url);
    if (profile) {
      return <Profile url={url} alias={profile.alias} />;
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

// The post an address is to, read once for the page: LongSummary reads it
// too.
export { usePost };
export default PostEmbed;
