import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';

import PostActionsRow from '../../../../components/PostActionsRow';
import MediumType from '../../../../proptypes/Medium';
import ActorTitle from '../../../../components/ActorTitle';
import ActorAvatar from '../../../../components/ActorAvatar';
import CardHeaderOwner from '../../../../components/MediumOwnerCardHeader';
import CitedByTab from '../../Read/CitedByTab';
import AudioPlayer from '../../../../components/AudioPlayer';
import EntityBody from '../../../../components/NodeBody';
import i18n from '../../../../languages';
import utils from '../../../../utils';
import PeopleInPost from '../../PeopleInPost';
import timeAgo from '../../../../utils/timeAgo';
import { Blurred } from '../../../../components/WarningCover';
import warnings from '../../../../utils/warnings';
import WrittenBy from '../../../../components/WrittenBy';
import StepButton from './StepButton';

const {
  getAuthor,
  getNamespace,
  getURL,
} = utils.node;

const TABS = {
  REPLIES: 'replies',
  LOCATIONS: 'locations',
  CITED_BY: 'cited-by',
};

// The lightbox's side panel, or what is under the picture where the two
// are stacked: the post, who wrote it and what it says, its buttons, the
// arrows to step where there is no picture to put them over, and its
// replies, places and what cites it, a tab each.
const Details = ({
  classes,
  medium,
  warned,
  hasPicture,
  hasPortrait,
  actions,
  menu,
  stats,
  locations,
  replies,
  editing,
  form,
  hasNext,
  hasPrev,
  handleNext,
  handlePrev,
  scrollableTarget,
}) => {
  const [tab, setTab] = useState(TABS.REPLIES);
  const url = getURL(medium);
  const author = getAuthor(medium);
  const createdAt = moment.utc(medium.createdAt).local().format('LLL').toString();

  return (
    <div className={hasPicture ? undefined : classes.detailsInner}>
      <Card>
        {medium.owner && medium.owner.type &&
          getNamespace(medium.owner) !== 'people' &&
          <CardHeaderOwner owner={medium.owner} author={author} />}
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
                {timeAgo(medium.createdAt)}
              </Link>
              <WrittenBy node={medium} />
            </>
          }
          action={menu}
        />
        {editing && form}
        {!editing &&
          <>
            {/* Who is in it (roadmap row 103), above the words, as under
                the picture on its page. */}
            <PeopleInPost medium={medium} />
            {/* A sound has no pane of its own: it plays here. */}
            {medium.audio &&
              <AudioPlayer audio={medium.audio} title={medium.title || ''} />}
            {/* Its words are shown when the veil is over its picture
                (row 122). */}
            <Blurred state={warned} off={warnings.hasMedia(medium)}>
              <CardContent component="article">
                {medium.title &&
                <Typography
                  variant="h2"
                  className={classes.title}
                >
                  {medium.title}
                </Typography>}
                {medium.content &&
                <EntityBody>
                  {utils.contentfilter({
                    text: medium.content,
                    filters: [
                      'hashtag',
                      'mention',
                      'url',
                    ],
                  })}
                </EntityBody>}
              </CardContent>
            </Blurred>
            <PostActionsRow actions={actions} stats={stats} />
          </>}
      </Card>
      {!hasPortrait && (hasPrev || hasNext) &&
        <Box className={classes.footerNav}>
          <StepButton way="prev" onClick={handlePrev} disabled={!hasPrev} />
          <StepButton way="next" onClick={handleNext} disabled={!hasNext} />
        </Box>}
      {/* A reply's pictures (replies/ReplyTheatre) come with no tabs: its
          thread is the post's. */}
      {(replies || locations) &&
      <Tabs
        className={classes.tabs}
        value={tab}
        onChange={(event, value) => {
          setTab(value);
        }}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab label={i18n.t('replies:cTitle')} value={TABS.REPLIES} />
        <Tab label={i18n.t('locations:cTitle')} value={TABS.LOCATIONS} />
        <Tab label={i18n.t('media:citations.citedBy')} value={TABS.CITED_BY} />
      </Tabs>}
      {tab === TABS.REPLIES && replies}
      {tab === TABS.LOCATIONS && locations}
      {tab === TABS.CITED_BY && (replies || locations) &&
        <CitedByTab
          medium={medium}
          scrollableTarget={scrollableTarget}
        />}
    </div>
  );
};

Details.propTypes = {
  classes: PropTypes.object.isRequired,
  medium: MediumType.isRequired,
  // Its content warning, from useWarning.
  warned: PropTypes.object.isRequired,
  // Whether there is a pane beside it, a photo or a video; and whether that
  // is a photo, with the arrows over it.
  hasPicture: PropTypes.bool.isRequired,
  hasPortrait: PropTypes.bool.isRequired,
  actions: PropTypes.node,
  menu: PropTypes.node,
  stats: PropTypes.node,
  locations: PropTypes.node,
  replies: PropTypes.node,
  editing: PropTypes.bool,
  form: PropTypes.node,
  hasNext: PropTypes.bool.isRequired,
  hasPrev: PropTypes.bool.isRequired,
  handleNext: PropTypes.func.isRequired,
  handlePrev: PropTypes.func.isRequired,
  // The id of what scrolls, for Cited by's infinite scroll.
  scrollableTarget: PropTypes.string.isRequired,
};

export default Details;
