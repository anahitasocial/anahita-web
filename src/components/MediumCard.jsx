import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import PlayCircleIcon from '@mui/icons-material/PlayCircleOutlined';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';

import PostActionsRow from './PostActionsRow';
import PostTitle from './PostTitle';
import MediumType from '../proptypes/Medium';
import ActorTitle from './ActorTitle';
import ActorAvatar from './ActorAvatar';
import CardHeaderOwner from './MediumOwnerCardHeader';
import PhotoSlides from './PhotoSlides';
import VideoElsewhere from './VideoElsewhere';
import videoElsewhere from '../utils/videoElsewhere';
import PinnedLabel from './PinnedLabel';
import QuoteEmbed from './QuoteEmbed';
import LinkPreviewCard from './LinkPreviewCard';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import videos from '../utils/videos';
import i18n from '../languages';
import linkPreviews from '../utils/linkPreviews';
import Progress from './Progress';
import LongSummary, { isLong, SummaryPicture } from './LongSummary';
import ReadMore from './ReadMore';
import SignInPrompt from './SignInPrompt';
import utils from '../utils';
import photoFiles from '../utils/photoFiles';
import openOnClick from '../utils/openOnClick';
import AltBadge from './AltBadge';
import RemovedPictures from './RemovedPictures';
import WarningCover, { Blurred, useWarning } from './WarningCover';
import timeAgo from '../utils/timeAgo';

const {
  getAuthor,
  getURL,
  getPortraitURL,
  getCoverURL,
} = utils.node;

const styles = () => {
  return {
    cover: {
      height: 0,
      paddingTop: '30%',
    },
    content: {},
  };
};

const MediumCard = ({
  classes,
  medium,
  stats = null,
  actions = null,
  access = null,
  ownerActions = null,
  menu = null,
  handleView = null,
  cardProps = {
    component: 'section',
  },
}) => {
  const navigate = useNavigate();
  const portrait = getPortraitURL(medium);
  const cover = getCoverURL(medium);
  const url = getURL(medium);
  const author = getAuthor(medium);
  const createdAt = moment.utc(medium.createdAt).local().format('LLL').toString();
  const creationTimeFromNow = timeAgo(medium.createdAt);

  // A post with several images is drawn as slides, which load their own.
  const hasSlides = photoFiles.hasSeveral(medium);
  // A video from elsewhere shows as its poster, leading to it, and its
  // words without the line that did.
  const elsewhere = videoElsewhere.of(medium);
  const content = elsewhere ? elsewhere.content : medium.content;

  const [isPortraitLoaded, setIsPortraitLoaded] = useState(!portrait);
  // Its content warning: its pictures, words and cover behind it until
  // View is pressed (row 122).
  const warned = useWarning(medium);

  useEffect(() => {
    if (portrait) {
      // eslint-disable-next-line no-undef
      const image = new Image();

      image.src = portrait;

      image.onload = () => {
        setIsPortraitLoaded(true);
      };
    }
  }, [portrait]);

  return (
    <Card {...cardProps}>
      <PinnedLabel show={Boolean(medium.pinned)} />
      {medium.author && medium.owner.id !== medium.author.id &&
        <CardHeaderOwner
          owner={medium.owner}
          actions={ownerActions}
        />}
      <Blurred state={warned}>
        {cover &&
          <Link href={url}>
            <CardMedia
              className={classes.cover}
              image={cover}
              title={medium.title}
              src="picture"
            />
          </Link>}
        {!cover && isLong(medium) && <SummaryPicture node={medium} url={url} />}
      </Blurred>
      <CardHeader
        avatar={
          <ActorAvatar
            actor={author}
            linked={Boolean(author.id)}
          />
        }
        title={
          <ActorTitle
            actor={author}
            linked={Boolean(author.id)}
            withHandle
          />
        }
        subheader={
          <>
            <Link
              href={url}
              title={createdAt}
            >
              {creationTimeFromNow}
            </Link>
            {access}
          </>
        }
        action={menu}
      />
      <WarningCover state={warned}>
        {medium.mediaRemoved && photoFiles.countOf(medium) === 0 &&
        <RemovedPictures medium={medium} />}
        {hasSlides &&
        <PhotoSlides
          medium={medium}
          onOpen={() => {
            if (handleView) {
              return handleView(medium.id);
            }
            return navigate(url);
          }}
        />}
        {elsewhere &&
        <VideoElsewhere
          node={medium}
          elsewhere={elsewhere}
          poster={photoFiles.hasSeveral(medium) ? '' : (portrait || '')}
          alt={photoFiles.altOf(medium)}
          description={photoFiles.descriptionOf(medium)}
          title={medium.title || ''}
        />}
        {!hasSlides && portrait && isPortraitLoaded && !elsewhere &&
        <Box sx={{ position: 'relative' }}>
          <ButtonBase
            style={{
              width: '100%',
              display: 'inline',
            }}
            // In a list that steps through its photos (a profile's Photos
            // tab), one photo opens there too, as a post with several does;
            // anywhere else it opens its post, as its title does.
            onClick={() => {
              if (handleView) {
                return handleView(medium.id);
              }
              return navigate(url);
            }}
          >
            <CardMedia
              component="img"
              title={medium.title}
              alt={photoFiles.altOf(medium)}
              image={portrait}
            />
          </ButtonBase>
          <AltBadge text={photoFiles.descriptionOf(medium)} />
        </Box>}
        {!hasSlides && !isPortraitLoaded &&
        <CardContent>
          <Progress />
        </CardContent>}
        {/* In a list that steps through its posts (a profile's Videos tab), a
          video is its poster, opened in the stepper to play; elsewhere it
          plays where it is. */}
        {medium.video && handleView && !elsewhere &&
        <ButtonBase
          onClick={() => {
            return handleView(medium.id);
          }}
          aria-label={i18n.t('media:stepper.open')}
          sx={{
            display: 'block', width: '100%', position: 'relative', bgcolor: '#000',
          }}
        >
          {medium.video.poster &&
            <CardMedia
              component="img"
              image={videos.urlOf(medium.video.poster)}
              alt={medium.title || ''}
            />}
          <PlayCircleIcon
            sx={{
              position: 'absolute', inset: 0, m: 'auto', fontSize: 64, color: '#fff', opacity: 0.9,
            }}
          />
        </ButtonBase>}
        {medium.video && !handleView && !elsewhere &&
        <VideoPlayer video={medium.video} title={medium.title} />}
        {/* A sound plays where it is, in a list too: it is small. */}
        {medium.audio && <AudioPlayer audio={medium.audio} title={medium.title} />}
        {/* The title and the text open the post when clicked, unless text
          is being selected or a link in it was clicked. */}
        <CardContent
          component="article"
          className={classes.content}
          {...openOnClick.handlersFor(url, navigate)}
        >
          {medium.title &&
          <PostTitle href={url} lang={medium.language}>
            {medium.title}
          </PostTitle>}
          {medium.content && isLong(medium) && <LongSummary node={medium} url={url} />}
          {content && !isLong(medium) &&
          <ReadMore contentFilter lang={medium.language} to={url}>
            {content}
          </ReadMore>}
          {linkPreviews.isShown(medium.linkPreview) &&
          <LinkPreviewCard preview={medium.linkPreview} />}
          <QuoteEmbed quote={medium.quote} />
          <SignInPrompt show={Boolean(medium.truncated)} />
        </CardContent>
      </WarningCover>
      <PostActionsRow actions={actions} stats={stats} />
    </Card>
  );
};

MediumCard.propTypes = {
  classes: PropTypes.object.isRequired,
  stats: PropTypes.node,
  actions: PropTypes.node,
  access: PropTypes.node,
  ownerActions: PropTypes.node,
  menu: PropTypes.node,
  medium: MediumType.isRequired,
  handleView: PropTypes.func,
  cardProps: PropTypes.objectOf(PropTypes.any),
};

export default withStyles(MediumCard, styles);
