import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import useFeed from './useFeed';
import CustomFeedIcon from '../../components/CustomFeedIcon';
import Progress from '../../components/Progress';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import postLanguage from '../../utils/postLanguage';
import utils from '../../utils';

const { getActorName } = utils.node;

// A custom feed read in full, in a dialog over the list of feeds: what it is
// for, who can see it, and everything it is set to, one line a setting.
//
// The list shows each feed in a line or two so that its rows are the same
// height. This is where the rest is. Only what is set is listed: a feed of
// every kind of post has no "Kinds of post" line.
const CustomFeedDetailsDialog = ({ feedId, onClose }) => {
  // Read again, for the names of the profiles and places it lists.
  const { feed, isMissing } = useFeed(feedId);

  const rows = [];

  if (feed) {
    const names = customFeeds.namesOf(feed.references);
    const {
      sources,
      filters,
      exclude,
      includeReplies,
    } = customFeeds.complete(feed.definition);

    const named = (ids) => {
      return ids.map((id) => {
        return names[id] || `#${id}`;
      }).join(', ');
    };
    const tags = (list) => {
      return list.map((tag) => {
        return `#${tag}`;
      }).join(', ');
    };
    const kinds = (list) => {
      return list.map((kind) => {
        return i18n.t(`customFeeds:kinds.${kind}`);
      }).join(', ');
    };
    const add = (label, value) => {
      if (value) {
        rows.push({ label: i18n.t(label), value });
      }
    };

    add('customFeeds:access.label', i18n.t(`customFeeds:access.${feed.access}`));
    add('customFeeds:details.created', customFeeds.madeOn(feed, i18n.language));
    add('customFeeds:form.sources', [
      sources.following && i18n.t('customFeeds:form.following'),
      sources.actors.length > 0 && named(sources.actors),
      !sources.following && sources.actors.length === 0 && i18n.t('customFeeds:details.everyone'),
    ].filter(Boolean).join(', '));
    add('customFeeds:form.mediaTypes', kinds(filters.mediaTypes));
    add('customFeeds:form.actorTypes', kinds(filters.actorTypes));
    add('customFeeds:form.hashtags', tags(filters.hashtagsAny));
    add('customFeeds:form.keywords', filters.keywordsAny.join(', '));
    add('customFeeds:form.locations', named(filters.locationsAny));
    add('customFeeds:form.language', filters.language && postLanguage.nameOf(filters.language, i18n.language));
    add('customFeeds:details.replies', i18n.t(includeReplies ?
      'customFeeds:details.repliesIncluded' :
      'customFeeds:details.repliesLeftOut'));
    add('customFeeds:form.exclude', [
      tags(exclude.hashtags),
      exclude.keywords.join(', '),
      named(exclude.actors),
    ].filter(Boolean).join(', '));
    add('customFeeds:details.order', i18n.t('customFeeds:details.newest'));
  }

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      aria-labelledby="custom-feed-details-title"
    >
      {!feed && !isMissing &&
        <DialogContent>
          <Progress />
        </DialogContent>}
      {isMissing &&
        <DialogContent>
          <Typography variant="body1">
            {i18n.t('customFeeds:read.notFound')}
          </Typography>
        </DialogContent>}
      {feed &&
        <>
          <DialogTitle id="custom-feed-details-title">
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Avatar>
                <CustomFeedIcon name={feed.icon} />
              </Avatar>
              <div>
                {feed.name}
                <Typography variant="body2" color="textSecondary">
                  {i18n.t('customFeeds:list.by', { name: getActorName(feed.owner || {}) })}
                </Typography>
              </div>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            {feed.body &&
              <Typography variant="body1" sx={{ pb: 1, whiteSpace: 'pre-line' }}>
                {feed.body}
              </Typography>}
            <List dense disablePadding>
              {rows.map((row) => {
                return (
                  <ListItem key={row.label} disableGutters>
                    <ListItemText primary={row.label} secondary={row.value} />
                  </ListItem>
                );
              })}
            </List>
          </DialogContent>
        </>}
      {/* Side by side, each half the width: Close, then on to the feed. */}
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          {i18n.t('customFeeds:details.close')}
        </Button>
        {feed &&
          <Button
            variant="contained"
            component={RouterLink}
            to={customFeeds.whereToRead(feed)}
          >
            {i18n.t('customFeeds:details.open')}
          </Button>}
      </DialogActions>
    </Dialog>
  );
};

CustomFeedDetailsDialog.propTypes = {
  feedId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomFeedDetailsDialog;
