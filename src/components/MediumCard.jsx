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
import PinnedLabel from './PinnedLabel';
import QuoteEmbed from './QuoteEmbed';
import LinkPreviewCard from './LinkPreviewCard';
import VideoPlayer from './VideoPlayer';
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
  const creationTimeFromNow = moment.utc(medium.createdAt).fromNow();

  // A post with several images is drawn as slides, which load their own.
  const hasSlides = photoFiles.hasSeveral(medium);

  const [isPortraitLoaded, setIsPortraitLoaded] = useState(!portrait);

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
      {!hasSlides && portrait && isPortraitLoaded &&
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
      {medium.video && handleView &&
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
      {medium.video && !handleView &&
        <VideoPlayer video={medium.video} title={medium.title} />}
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
        {medium.content && !isLong(medium) &&
          <ReadMore contentFilter lang={medium.language} to={url}>
            {medium.content}
          </ReadMore>}
        {linkPreviews.isShown(medium.linkPreview) &&
          <LinkPreviewCard preview={medium.linkPreview} />}
        <QuoteEmbed quote={medium.quote} />
        <SignInPrompt show={Boolean(medium.truncated)} />
      </CardContent>
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
