import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import moment from 'moment';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import ActorHandle from '../../components/ActorHandle';
import AudioPlayer from '../../components/AudioPlayer';
import EntityBody from '../../components/NodeBody';
import LinkPreviewCard from '../../components/LinkPreviewCard';
import PhotoSlides from '../../components/PhotoSlides';
import VideoPlayer from '../../components/VideoPlayer';
import WarningCover, { Blurred } from '../../components/WarningCover';
import WrittenBy from '../../components/WrittenBy';
import i18n from '../../languages';
import linkPreviews from '../../utils/linkPreviews';
import openOnClick from '../../utils/openOnClick';
import timeAgo from '../../utils/timeAgo';
import utils from '../../utils';

const { getActorName, getURL } = utils.node;

// One line, cut short where it does not fit.
const oneLine = {
  minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
};

// A picture or a video in a reply: a step above it, two under, its corners
// rounded.
const framed = {
  mt: 1, mb: 2, borderRadius: 1, overflow: 'hidden',
};

// How tall the line with somebody's name on it is, which their picture
// beside it is centred on (ReplyItem).
export const HEAD = 32;

// What a reply says, beside its writer's picture: who wrote it and when,
// then its pictures, video or sound and its words, under its content
// warning. While it is being changed, its words and card make way for the
// form, which ReplyItem draws in their place.
const ReplyContent = ({
  reply,
  author,
  isWriter = false,
  warned,
  media,
  isEditing = false,
}) => {
  const navigate = useNavigate();
  // The reply's own page: what it answers above it, its replies under it.
  const page = getURL(reply);

  return (
    <>
      {/* Name, handle and when, on one line, the handle cut short
          before anything wraps; the words right under it. */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, minHeight: HEAD, minWidth: 0,
      }}
      >
        <Typography
          component="span"
          variant="subtitle2"
          sx={{ ...oneLine, flexShrink: 0, maxWidth: '60%' }}
        >
          {author.id ?
            <Link href={getURL(author)} color="inherit" underline="hover">
              {getActorName(author)}
            </Link> :
            getActorName(author)}
        </Typography>
        {/* Their handle in grey: @ana here, and the whole handle for
            somebody on another server, which says where they are. */}
        <Box component="span" sx={{ ...oneLine, flexShrink: 1 }}>
          <ActorHandle actor={author} />
        </Box>
        {/* The post's writer, among the replies to it. */}
        {isWriter &&
          <Typography variant="caption" color="textSecondary" sx={{ flexShrink: 0 }}>
            {i18n.t('replies:writer')}
          </Typography>}
        {/* When, a link to the reply's own page, where its replies are
            under it: one that can be opened in a new tab or copied. */}
        <Link
          component={RouterLink}
          to={page}
          variant="caption"
          color="textSecondary"
          underline="hover"
          title={moment.utc(reply.createdAt).local().format('LLL').toString()}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {timeAgo(reply.createdAt)}
        </Link>
        {reply.hidden &&
          <Chip size="small" label={i18n.t('replies:hidden.badge')} sx={{ flexShrink: 0 }} />}
      </Box>
      <WrittenBy node={reply} />
      {/* A reply with pictures or a video shows them first, its words
          under them. 16 pixels show above and below: 8 above, since
          the line with the name is as tall as the picture beside it
          and already leaves some 8 under the name. */}
      {/* Its content warning (row 122): over its pictures, video or
          sound, its words shown; over its words when it has none. */}
      <WarningCover state={warned} off={!media}>
        {Array.isArray(reply.files) && reply.files.length > 0 &&
        <Box sx={framed}>
          <PhotoSlides medium={reply} size="medium" />
        </Box>}
        {reply.video &&
        <Box sx={framed}>
          <VideoPlayer video={reply.video} title={reply.title || ''} />
        </Box>}
        {reply.audio &&
        <Box sx={{ mt: 1, mb: 2 }}>
          <AudioPlayer audio={reply.audio} title={reply.title || ''} padded={false} />
        </Box>}
      </WarningCover>
      <WarningCover state={warned} off={media}>
        {/* A click on its words opens its page too, as a post's card
            does, but for a selection, a link or a button in them. */}
        {!isEditing &&
        <Box
          sx={{ '& p:first-of-type': { mt: 0 } }}
          {...openOnClick.handlersFor(page, navigate)}
        >
          <EntityBody contentFilter size="body2" lang={reply.language}>
            {reply.content || ''}
          </EntityBody>
        </Box>}
        {!isEditing && linkPreviews.isShown(reply.linkPreview) &&
        <Blurred state={warned} off={!media}>
          <LinkPreviewCard preview={reply.linkPreview} />
        </Blurred>}
      </WarningCover>
    </>
  );
};

ReplyContent.propTypes = {
  reply: PropTypes.object.isRequired,
  // Who wrote it: nobody for a reply that was removed.
  author: PropTypes.object.isRequired,
  // Whether its writer wrote the post the thread is under.
  isWriter: PropTypes.bool,
  // Its content warning, as useWarning gives it.
  warned: PropTypes.object.isRequired,
  // Whether it has pictures, a video or a sound for the warning to cover.
  media: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool,
};

export default ReplyContent;
