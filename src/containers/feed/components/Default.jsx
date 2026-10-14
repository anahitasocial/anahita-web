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

import PostActionsRow from '../../../components/PostActionsRow';
import ReadMore from '../../../components/ReadMore';
import ActorAvatar from '../../../components/ActorAvatar';
import NodeType from '../../../proptypes/Node';
import CardOwner from '../../../components/MediumOwnerCardHeader';
import PostTitle from '../../../components/PostTitle';
import PhotoSlides from '../../../components/PhotoSlides';
import PinnedLabel from '../../../components/PinnedLabel';
import QuoteEmbed from '../../../components/QuoteEmbed';
import Player from '../../../components/Player';
import LinkPreviewCard from '../../../components/LinkPreviewCard';
import VideoPlayer from '../../../components/VideoPlayer';
import linkPreviews from '../../../utils/linkPreviews';
import utils from '../../../utils';
import photoFiles from '../../../utils/photoFiles';
import AltBadge from '../../../components/AltBadge';
import RemovedPictures from '../../../components/RemovedPictures';

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
  // A post's title is its name. This read `title`, which no post is sent
  // with, so no title was ever drawn on a card in a feed.
  const { body } = node;
  const title = node.name || '';
  const url = getURL(node);
  const createdAt = moment.utc(node.createdAt).local().format('LLL').toString();
  const creationTimeFromNow = moment.utc(node.createdAt).fromNow();

  return (
    <Card
      className={classes.root}
      component="article"
    >
      <PinnedLabel show={Boolean(node.pinned)} />
      {showOwner && node.owner && <CardOwner owner={node.owner} />}
      {context}
      <CardHeader
        avatar={
          <ActorAvatar
            actor={node.author}
            linked={node.author.id > 0}
          />
        }
        title={node.author.id > 0 ? (
          <Link href={getURL(node.author)}>
            {authorName}
          </Link>
        ) : authorName}
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
      {cover &&
        <Link href={url}>
          <CardMedia
            className={classes.cover}
            image={cover}
            title={title}
            src="picture"
          />
        </Link>}
      {node.mediaRemoved && photoFiles.countOf(node) === 0 &&
        <RemovedPictures medium={node} />}
      {photoFiles.hasSeveral(node) &&
        <PhotoSlides
          medium={node}
          onOpen={() => {
            navigate(url);
          }}
        />}
      {!photoFiles.hasSeveral(node) && portrait &&
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
      {node.video && <VideoPlayer video={node.video} title={title} />}
      {body && <Player text={body} />}
      <CardContent>
        {title &&
          <PostTitle href={url} lang={node.language}>
            {title}
          </PostTitle>}
        {body &&
          <ReadMore contentFilter>
            {body}
          </ReadMore>}
        {linkPreviews.isShown(node.linkPreview, body) &&
          <LinkPreviewCard preview={node.linkPreview} />}
        <QuoteEmbed quote={node.quote} />
      </CardContent>
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
