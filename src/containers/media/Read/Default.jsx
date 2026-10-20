import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withStyles } from 'tss-react/mui';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';

import PostActionsRow from '../../../components/PostActionsRow';
import MediumType from '../../../proptypes/Medium';
import ActorTitle from '../../../components/ActorTitle';
import ActorAvatar from '../../../components/ActorAvatar';
import CardHeaderOwner from '../../../components/MediumOwnerCardHeader';
import PhotoSlides from '../../../components/PhotoSlides';
import PinnedLabel from '../../../components/PinnedLabel';
import LinkPreviewCard from '../../../components/LinkPreviewCard';
import VideoPlayer from '../../../components/VideoPlayer';
import linkPreviews from '../../../utils/linkPreviews';
import Progress from '../../../components/Progress';
import EntityBody from '../../../components/NodeBody';
import { Citations } from '../../../components/PostEmbed';
import CitedByTab from './CitedByTab';
import SignInPrompt from '../../../components/SignInPrompt';
import i18n from '../../../languages';
import utils from '../../../utils';
import photoFiles from '../../../utils/photoFiles';
import AltBadge from '../../../components/AltBadge';
import RemovedPictures from '../../../components/RemovedPictures';
import styles from './styles';
import PageColumn from '../../../components/PageColumn';
import PeopleInPost from '../PeopleInPost';

const {
  getAuthor,
  getPortraitURL,
  getCoverURL,
} = utils.node;

const TABS = {
  REPLIES: 'replies',
  LOCATIONS: 'locations',
  CITED_BY: 'cited-by',
};

const MediumReadDefault = ({
  classes,
  medium,
  access = null,
  actions = null,
  menu = null,
  locations = null,
  replies = null,
  context = null,
  quote = null,
  editing = false,
  form = null,
  stats = null,
  handleView = null,
  // An article's cover as its author may change it (containers/cover), in
  // place of the picture alone.
  cover = null,
}) => {
  const [tab, setTab] = useState(TABS.REPLIES);

  const changeTab = (event, value) => {
    setTab(value);
  };

  const portrait = getPortraitURL(medium, 'original');
  const coverUrl = getCoverURL(medium, 'large');
  const author = getAuthor(medium);
  const createdAt = moment.utc(medium.createdAt).local().format('LLL').toString();

  // A post with several images is drawn as slides, which load their own.
  const hasSlides = photoFiles.hasSeveral(medium);

  const [isLoaded, setIsLoaded] = useState(!portrait);

  useEffect(() => {
    if (portrait) {
      // eslint-disable-next-line no-undef
      const image = new Image();

      image.src = portrait;

      image.onload = () => {
        setIsLoaded(true);
      };
    }
  }, [portrait]);

  const portraitMedia = (
    <CardMedia
      component="img"
      title={medium.title}
      alt={photoFiles.altOf(medium)}
      image={portrait}
    />
  );

  return (
    <PageColumn>
      <Card component="article">
        <PinnedLabel show={Boolean(medium.pinned)} />
        {context}
        {/* The profile it was posted on, when that is not its author's
              own: a group, or somebody else's profile. A reply says where
              it was said in its context, below. */}
        {!context && medium.owner && medium.owner.id !== author.id &&
        <CardHeaderOwner owner={medium.owner} />}
        {cover}
        {!cover && coverUrl &&
        <CardMedia
          className={classes.cover}
          title={medium.title}
          image={coverUrl}
          src="picture"
        />}
        {medium.mediaRemoved && photoFiles.countOf(medium) === 0 &&
        <RemovedPictures medium={medium} auto />}
        {hasSlides &&
        <PhotoSlides
          medium={medium}
          size="large"
          onOpen={handleView ? () => {
            handleView();
          } : null}
        />}
        {/* One photo opens in the theatre too, as several do, to be seen
            larger and zoomed into (asked for again by the user on
            2026-10-17). */}
        {!hasSlides && portrait && isLoaded &&
        <Box sx={{ position: 'relative' }}>
          {handleView ?
            <ButtonBase
              onClick={handleView}
              aria-label={i18n.t('media:stepper.open')}
              sx={{ display: 'block', width: '100%' }}
            >
              {portraitMedia}
            </ButtonBase> :
            portraitMedia}
          <AltBadge text={photoFiles.descriptionOf(medium)} />
        </Box>}
        {!hasSlides && !isLoaded &&
        <CardContent>
          <Progress />
        </CardContent>}
        {/* Who is in it, right under the picture (roadmap row 103). */}
        {!medium.video && <PeopleInPost medium={medium} />}
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
              isAuthor
            />
            }
          subheader={
            <>
              <time dateTime={moment.utc(medium.createdAt).toISOString()}>{createdAt}</time>
              {access}
            </>
            }
          action={menu}
        />
        {editing && form}
        {!editing &&
        <>
          {medium.video && <VideoPlayer video={medium.video} title={medium.title} />}
          {medium.video && <PeopleInPost medium={medium} />}
          {/* The card is the <article>; this is its text. One article,
              with an h1 and a byline, is what reading views (Safari's
              Reader, Firefox's) look for: an article within an article
              read as none. */}
          <CardContent>
            {medium.title &&
            <Typography
              variant="h2"
              component="h1"
              dir="auto"
              lang={medium.language && medium.language !== 'und' ? medium.language : undefined}
              className={classes.title}
            >
              {medium.title}
            </Typography>}
            {medium.content &&
            <EntityBody
              contentFilter
              lang={medium.language}
              // Long writing shows what an address on a line of its own
              // is to: a post here as itself, a page by its card.
              embeds={/\.(article|topic)\.v1$/.test(medium.type || '')}
              cards={medium.linkPreviews || []}
            >
              {medium.content}
            </EntityBody>}
            {/\.(article|topic)\.v1$/.test(medium.type || '') && medium.content &&
              <Citations text={medium.content} cards={medium.linkPreviews || []} />}
            {linkPreviews.isShown(medium.linkPreview, medium.content) &&
              <LinkPreviewCard preview={medium.linkPreview} />}
            {quote}
            <SignInPrompt show={Boolean(medium.truncated)} />
          </CardContent>
          <PostActionsRow actions={actions} stats={stats} />
        </>}
      </Card>
      <Tabs
        value={tab}
        onChange={changeTab}
        centered
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label={i18n.t('replies:cTitle')} value={TABS.REPLIES} />
        <Tab label={i18n.t('locations:cTitle')} value={TABS.LOCATIONS} />
        <Tab label={i18n.t('media:citations.citedBy')} value={TABS.CITED_BY} />
      </Tabs>
      {tab === TABS.REPLIES && replies}
      {tab === TABS.LOCATIONS && locations}
      {tab === TABS.CITED_BY && <CitedByTab medium={medium} />}
    </PageColumn>
  );
};

MediumReadDefault.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.node,
  menu: PropTypes.node,
  medium: MediumType.isRequired,
  access: PropTypes.node,
  locations: PropTypes.node,
  // The post a note quotes, under the note's own words.
  quote: PropTypes.node,
  // What a reply is a reply to, above a reply shown on its own.
  context: PropTypes.node,
  // The thread of replies under the post.
  replies: PropTypes.node,
  form: PropTypes.node,
  stats: PropTypes.node,
  editing: PropTypes.bool,
  handleView: PropTypes.func,
  cover: PropTypes.node,
};

export default withStyles(MediumReadDefault, styles);
