import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withStyles } from 'tss-react/mui';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import PostActionsRow from '../../../components/PostActionsRow';
import MediumType from '../../../proptypes/Medium';
import ActorTitle from '../../../components/ActorTitle';
import ActorAvatar from '../../../components/ActorAvatar';
import CardHeaderOwner from '../../../components/MediumOwnerCardHeader';
import PinnedLabel from '../../../components/PinnedLabel';
import LinkPreviewCard from '../../../components/LinkPreviewCard';
import VideoPlayer from '../../../components/VideoPlayer';
import AudioPlayer from '../../../components/AudioPlayer';
import linkPreviews from '../../../utils/linkPreviews';
import EntityBody from '../../../components/NodeBody';
import Citations from '../../../components/Citations';
import CitedByTab from './CitedByTab';
import SignInPrompt from '../../../components/SignInPrompt';
import utils from '../../../utils';
import WarningCover, { Blurred } from '../../../components/WarningCover';
import styles from './styles';
import PageColumn from '../../../components/PageColumn';
import { useStickyColumn } from '../../../components/SideTabs';
import PeopleInPost from '../PeopleInPost';
import InPostDialog from '../../../routes/postDialogContext';
import WrittenBy from '../../../components/WrittenBy';
import Pictures from './Pictures';
import useMediumRead from './useMediumRead';

const { getAuthor } = utils.node;

// A post on its own page: its pictures, who wrote it, its words, what it
// plays and its buttons, in a card; then its replies, and what it is tied
// to, beside them on a wide screen. What it shows of the post is worked out
// by useMediumRead.
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
  // Opened over a list, it is the post and its replies alone, in one
  // column: its places and what cites it are on its own page.
  const inDialog = useContext(InPostDialog);
  const isWide = useMediaQuery((theme) => {
    return theme.breakpoints.up('md');
  }) && !inDialog;
  // Each keeps its place beside the other, however long the other is.
  const [postRef, postTop] = useStickyColumn(isWide, 64);
  const [talkRef, talkTop] = useStickyColumn(isWide, 64);

  const read = useMediumRead(medium, cover);
  const {
    elsewhere,
    content,
    warned,
    media,
    isLong,
  } = read;
  const Top = read.coversPictures ? WarningCover : Blurred;
  const Playing = read.coversPlaying ? WarningCover : Blurred;
  const author = getAuthor(medium);
  const createdAt = moment.utc(medium.createdAt).local().format('LLL').toString();

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
          <WrittenBy node={medium} />
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
      <Top state={warned}>
        <Pictures
          classes={classes}
          medium={medium}
          read={read}
          cover={cover}
          handleView={handleView}
        />
      </Top>
      {header}
      {editing && form}
      {!editing &&
      <>
        <Playing state={warned}>
          {medium.video && !elsewhere && <VideoPlayer video={medium.video} title={medium.title} />}
          {medium.audio && <AudioPlayer audio={medium.audio} title={medium.title} />}
          {medium.video && <PeopleInPost medium={medium} />}
        </Playing>
        <WarningCover state={warned} off={media}>
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
            {content &&
            <EntityBody
              contentFilter
            // Long writing is read at length, in larger type.
              size={isLong ? 'reading' : 'body1'}
              lang={medium.language}
            // Long writing shows what an address on a line of its own
            // is to: a post here as itself, a page by its card.
              embeds={isLong}
              cards={medium.linkPreviews || []}
            >
              {content}
            </EntityBody>}
            {isLong && medium.content &&
            <Citations text={medium.content} cards={medium.linkPreviews || []} />}
            {linkPreviews.isShown(medium.linkPreview) &&
            <Blurred state={warned} off={!media}>
              <LinkPreviewCard preview={medium.linkPreview} />
            </Blurred>}
            {quote}
            <SignInPrompt show={Boolean(medium.truncated)} />
          </CardContent>
        </WarningCover>
      </>}
      {!editing && <PostActionsRow actions={actions} stats={stats} />}
    </Card>
  );

  // What is said about the post, and what it is tied to: its places, and the
  // posts that cite or quote it. Each a card, one under another.
  const about = (
    <>
      {locations}
      <CitedByTab medium={medium} titled />
    </>
  );

  if (!isWide) {
    return (
      <PageColumn width={800}>
        <Stack spacing={2}>
          {post}
          {replies}
          {!inDialog && about}
        </Stack>
      </PageColumn>
    );
  }

  // Two thirds for the post and its replies, read one after the other, and a
  // third for what it is tied to.
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        columnGap: 2,
        alignItems: 'start',
      }}
    >
      <Stack ref={postRef} spacing={2} sx={{ position: 'sticky', top: postTop, minWidth: 0 }}>
        {post}
        {replies}
      </Stack>
      <Stack ref={talkRef} spacing={2} sx={{ position: 'sticky', top: talkTop, minWidth: 0 }}>
        {about}
      </Stack>
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
