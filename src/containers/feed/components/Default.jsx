import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';

import ThreadNext from './ThreadNext';
import PostActionsRow from '../../../components/PostActionsRow';
import ReadMore from '../../../components/ReadMore';
import ActorAvatar from '../../../components/ActorAvatar';
import NodeType from '../../../proptypes/Node';
import ActorHandle from '../../../components/ActorHandle';
import LongSummary, { isLong, SummaryPicture } from '../../../components/LongSummary';
import CardOwner from '../../../components/MediumOwnerCardHeader';
import openOnClick from '../../../utils/openOnClick';
import PostTitle from '../../../components/PostTitle';
import PhotoSlides from '../../../components/PhotoSlides';
import VideoElsewhere from '../../../components/VideoElsewhere';
import videoElsewhere from '../../../utils/videoElsewhere';
import PinnedLabel from '../../../components/PinnedLabel';
import QuoteEmbed from '../../../components/QuoteEmbed';
import LinkPreviewCard from '../../../components/LinkPreviewCard';
import VideoPlayer from '../../../components/VideoPlayer';
import AudioPlayer from '../../../components/AudioPlayer';
import linkPreviews from '../../../utils/linkPreviews';
import utils from '../../../utils';
import photoFiles from '../../../utils/photoFiles';
import AltBadge from '../../../components/AltBadge';
import RemovedPictures from '../../../components/RemovedPictures';
import WarningCover, { Blurred, useWarning } from '../../../components/WarningCover';
import warnings from '../../../utils/warnings';
import timeAgo from '../../../utils/timeAgo';

const {
  getURL,
  getPortraitURL,
  getCoverURL,
  getPersonName,
} = utils.node;

const styles = (theme) => {
  return {
    root: {
      marginBottom: theme.spacing(2),
    },
    cover: {
      height: 0,
      paddingTop: '30%',
    },
    media: {
      height: 0,
      paddingTop: '100%',
    },
    title: {
      textTransform: 'capitalize',
      marginBottom: theme.spacing(2),
    },
    authorName: {
      fontSize: 16,
    },
    ownerName: {
      fontSize: 14,
    },
  };
};

const FeedCardDefault = ({
  classes,
  node,
  stats = null,
  actions = null,
  menu,
  showOwner = false,
  context = null,
}) => {
  const navigate = useNavigate();
  const authorName = getPersonName(node.author);
  const portrait = getPortraitURL(node, 'medium');
  const cover = getCoverURL(node, 'medium');
  // A video from elsewhere shows as its poster, leading to it, and its
  // words without the line that did.
  const elsewhere = videoElsewhere.of(node);
  const content = elsewhere ? elsewhere.content : node.content;
  const title = node.title || '';
  const url = getURL(node);
  const long = isLong(node);
  const warned = useWarning(node);
  const media = warnings.hasMedia(node);
  const createdAt = moment.utc(node.createdAt).local().format('LLL').toString();
  const creationTimeFromNow = timeAgo(node.createdAt);

  return (
    <Card
      className={classes.root}
      component="article"
    >
      <PinnedLabel show={Boolean(node.pinned)} />
      {showOwner && node.owner && <CardOwner owner={node.owner} author={node.author} />}
      {context}
      <CardHeader
        avatar={
          <ActorAvatar
            actor={node.author}
            linked={node.author.id > 0}
          />
        }
        title={
          // The handle after the name, in grey, or under it where the line is
          // too narrow for both.
          <Box
            component="span"
            sx={{
              display: 'flex', alignItems: 'baseline', columnGap: 1, flexWrap: 'wrap', minWidth: 0,
            }}
          >
            {node.author.id > 0 ? (
              <Link href={getURL(node.author)}>
                {authorName}
              </Link>
            ) : authorName}
            <ActorHandle actor={node.author} />
          </Box>
        }
        subheader={
          <Link
            href={url}
            title={createdAt}
          >
            {creationTimeFromNow}
          </Link>
        }
        action={menu}
      />
      {/* Its content warning (row 122): over its pictures, its words shown;
          over all of it, the notes after it in its thread too, when it has
          none. One View opens both. */}
      <WarningCover state={warned} off={!media}>
        {cover &&
        <Link href={url}>
          <CardMedia
            className={classes.cover}
            image={cover}
            title={title}
            src="picture"
          />
        </Link>}
        {!cover && long && <SummaryPicture node={node} url={url} />}
        {node.mediaRemoved && photoFiles.countOf(node) === 0 &&
        <RemovedPictures medium={node} />}
        {photoFiles.hasSeveral(node) &&
        <PhotoSlides
          medium={node}
          onOpen={() => {
            navigate(url);
          }}
        />}
        {elsewhere &&
        <VideoElsewhere
          node={node}
          elsewhere={elsewhere}
          poster={photoFiles.hasSeveral(node) ? '' : (portrait || '')}
          alt={photoFiles.altOf(node)}
          description={photoFiles.descriptionOf(node)}
          title={title || ''}
        />}
        {!photoFiles.hasSeveral(node) && portrait && !elsewhere &&
        <Box sx={{ position: 'relative' }}>
          <Link href={url}>
            <CardMedia
              component="img"
              title={title}
              alt={photoFiles.altOf(node)}
              image={portrait}
            />
          </Link>
          <AltBadge text={photoFiles.descriptionOf(node)} />
        </Box>}
        {node.video && !elsewhere && <VideoPlayer video={node.video} title={title} />}
        {node.audio && <AudioPlayer audio={node.audio} title={title} />}
      </WarningCover>
      <WarningCover state={warned} off={media}>
        {/* The title and the text open the post when clicked, unless text
          is being selected or a link in it was clicked. */}
        <CardContent {...openOnClick.handlersFor(url, navigate)}>
          {title &&
          <PostTitle href={url} lang={node.language}>
            {title}
          </PostTitle>}
          {/* An article or a topic by its summary: what it shows within
            itself is on its page. */}
          {content && long && <LongSummary node={node} url={url} />}
          {content && !long &&
          <ReadMore contentFilter to={url}>
            {content}
          </ReadMore>}
          {linkPreviews.isShown(node.linkPreview) &&
          <Blurred state={warned} off={!media}>
            <LinkPreviewCard preview={node.linkPreview} />
          </Blurred>}
          <QuoteEmbed quote={node.quote} />
        </CardContent>
        <ThreadNext thread={node.thread} next={node.threadNext} url={url} />
      </WarningCover>
      <PostActionsRow actions={actions} stats={stats} />
    </Card>
  );
};

FeedCardDefault.propTypes = {
  // Above a reply: what it is a reply to.
  context: PropTypes.node,
  classes: PropTypes.object.isRequired,
  stats: PropTypes.node,
  actions: PropTypes.node,
  menu: PropTypes.node,
  node: NodeType.isRequired,
  showOwner: PropTypes.bool,
};

export default withStyles(FeedCardDefault, styles);
