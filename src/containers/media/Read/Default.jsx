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
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

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
import { useStickyColumn } from '../../../components/SideTabs';
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
  const isWide = useMediaQuery((theme) => {
    return theme.breakpoints.up('md');
  });
  // Each keeps its place beside the other, however long the other is.
  const [postRef, postTop] = useStickyColumn(isWide, 64);
  const [talkRef, talkTop] = useStickyColumn(isWide, 64);

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

  // Who wrote it.
  const header = (
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
  );

  const post = (
    <Card component="article">
      <PinnedLabel show={Boolean(medium.pinned)} />
      {context}
      {/* The profile it was posted on, when that is not its author's
            own: a group, or somebody else's profile. A reply says where
            it was said in its context, below. */}
      {!context && medium.owner && medium.owner.id !== author.id &&
      <CardHeaderOwner owner={medium.owner} author={medium.author} roomy />}
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
      {header}
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
            // Long writing is read at length, in larger type.
            size={/\.(article|topic)\.v1$/.test(medium.type || '') ? 'reading' : 'body1'}
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
          {linkPreviews.isShown(medium.linkPreview) &&
            <LinkPreviewCard preview={medium.linkPreview} />}
          {quote}
          <SignInPrompt show={Boolean(medium.truncated)} />
        </CardContent>
        <PostActionsRow actions={actions} stats={stats} />
      </>}
    </Card>
  );

  // Said for md: the theme sets a wider minWidth there, too wide for a third
  // of a narrower page.
  const tabSx = { minWidth: { md: 0 } };

  const tabs = (
    <Tabs
      value={tab}
      onChange={changeTab}
      variant="fullWidth"
      indicatorColor="primary"
      textColor="primary"
    >
      <Tab label={i18n.t('replies:cTitle')} value={TABS.REPLIES} sx={tabSx} />
      <Tab label={i18n.t('locations:cTitle')} value={TABS.LOCATIONS} sx={tabSx} />
      <Tab label={i18n.t('media:citations.citedBy')} value={TABS.CITED_BY} sx={tabSx} />
    </Tabs>
  );

  const panel = (
    <>
      {tab === TABS.REPLIES && replies}
      {tab === TABS.LOCATIONS && locations}
      {tab === TABS.CITED_BY && <CitedByTab medium={medium} />}
    </>
  );

  if (!isWide) {
    return (
      <PageColumn width={800}>
        {post}
        {tabs}
        {panel}
      </PageColumn>
    );
  }

  // Two thirds for the post, and a third for what was said about it: the
  // tabs at the head of one card with what they open.
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        columnGap: 2,
        alignItems: 'start',
      }}
    >
      <Box ref={postRef} sx={{ position: 'sticky', top: postTop, minWidth: 0 }}>
        {post}
      </Box>
      <Card ref={talkRef} sx={{ position: 'sticky', top: talkTop, minWidth: 0 }}>
        {tabs}
        <Divider />
        {/* One card: those inside it lose their own edges. */}
        <Box sx={{ '& .MuiCard-root': { boxShadow: 'none', backgroundImage: 'none' } }}>
          {panel}
        </Box>
      </Card>
    </Box>
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
