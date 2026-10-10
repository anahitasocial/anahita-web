import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import ActorAvatar from '../../../components/ActorAvatar';
import Progress from '../../../components/Progress';
import SignInPrompt from '../../../components/SignInPrompt';
import ControlFollow from '../../controls/Follow';
import ControlRemoveFollower from '../../controls/RemoveFollower';
import api from '../../../api';
import i18n from '../../../languages';
import permissions from '../../../permissions/actor';
import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';
import utils from '../../../utils';
import socialgraph from '../../../utils/socialgraph';
import visitor from '../../../utils/visitor';
import { App as APP } from '../../../constants';

const { getActorName, getURL, isPerson } = utils.node;
const { LIMIT } = APP.BROWSE;

// Who follows a profile, who it follows, and who the viewer has in common
// with it: one dialog, opened from the number of followers on the profile.
//
// It took the place of a Social Graph tab, to leave the row of tabs to what
// the profile has posted. Each list is read when its tab is first opened,
// and more of it as the end of it is scrolled to.
const SocialgraphDialog = ({
  actor,
  open,
  onClose,
  startOn = socialgraph.FOLLOWERS,
  viewer,
  isAuthenticated,
  heldBack = false,
}) => {
  const kinds = socialgraph.kinds(actor, viewer);
  const [kind, setKind] = useState(socialgraph.known(kinds, startOn));
  // By kind: { rows, total } once read.
  const [lists, setLists] = useState({});
  const [failed, setFailed] = useState({});

  const load = (which, start) => {
    api.socialgraph.browse({
      filter: which,
      actor,
      start,
      limit: LIMIT,
    }).then((result) => {
      setLists((before) => {
        return {
          ...before,
          [which]: socialgraph.merge(before[which], result.data, start),
        };
      });
    }).catch(() => {
      setFailed((before) => {
        return { ...before, [which]: true };
      });
    });
  };

  // Each time it is opened it starts over.
  useEffect(() => {
    if (open) {
      setKind(socialgraph.known(kinds, startOn));
      setLists({});
      setFailed({});
    }
  }, [open, actor.id, startOn]);

  useEffect(() => {
    if (open && !heldBack && !lists[kind] && !failed[kind]) {
      load(kind, 0);
    }
  }, [open, kind, lists[kind], failed[kind], heldBack]);

  const list = lists[kind];
  // What is in common is counted by the server when it is read, so its
  // number is on its tab once it has been opened.
  const counts = socialgraph.counts(actor, lists);
  // A group's administrators can remove a follower from it.
  const canRemove = kind === socialgraph.FOLLOWERS &&
    !isPerson(actor) &&
    permissions.canAdminister(actor);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby={`socialgraph-title-${actor.id}`}
    >
      <DialogTitle id={`socialgraph-title-${actor.id}`}>
        {getActorName(actor)}
      </DialogTitle>
      <Tabs
        value={kind}
        onChange={(event, value) => {
          setKind(value);
        }}
        variant="fullWidth"
        aria-label={i18n.t('socialgraph:mTitle')}
      >
        {kinds.map((each) => {
          const count = counts[each];
          return (
            <Tab
              key={each}
              value={each}
              label={typeof count === 'number' ?
                `${i18n.t(`socialgraph:${each}`)} ${count}` :
                i18n.t(`socialgraph:${each}`)}
            />
          );
        })}
      </Tabs>
      {/* The list scrolls inside the dialog, so that is what is watched
          for its end. */}
      <DialogContent
        dividers
        id={`socialgraph-scroll-${actor.id}`}
        sx={{ p: 0, minHeight: 240 }}
      >
        {heldBack &&
          <Box sx={{ p: 2 }}>
            <SignInPrompt what="followers" />
          </Box>}
        {!heldBack && !list && !failed[kind] && <Progress />}
        {failed[kind] &&
          <Typography variant="body2" color="error" role="alert" sx={{ p: 2 }}>
            {i18n.t('socialgraph:failed')}
          </Typography>}
        {list && list.rows.length === 0 &&
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            {i18n.t(`socialgraph:none.${kind}`)}
          </Typography>}
        {list && list.rows.length > 0 &&
          <InfiniteScroll
            dataLength={list.rows.length}
            next={() => {
              load(kind, list.rows.length);
            }}
            hasMore={list.rows.length < list.total}
            loader={<Progress key="socialgraph-progress" />}
            scrollableTarget={`socialgraph-scroll-${actor.id}`}
          >
            <List disablePadding>
              {list.rows.map((row) => {
                const showFollow = isAuthenticated && permissions.canFollow(row, viewer);
                const showRemove = canRemove && row.id !== viewer.id;
                return (
                  <ListItem
                    key={`socialgraph-${kind}-${row.id}`}
                    divider
                    secondaryAction={
                      <>
                        {showRemove && <ControlRemoveFollower actor={actor} follower={row} />}
                        {showFollow && <ControlFollow actor={row} />}
                      </>
                    }
                  >
                    <ListItemAvatar>
                      <ActorAvatar actor={row} linked />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Link href={getURL(row)} color="inherit" underline="hover">
                          {getActorName(row)}
                        </Link>
                      }
                      secondary={socialgraph.rowNote(row, i18n.t('socialgraph:followsYou'))}
                    />
                  </ListItem>
                );
              })}
            </List>
          </InfiniteScroll>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} fullWidth>
          {i18n.t('commons:close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SocialgraphDialog.propTypes = {
  actor: ActorType.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  // Which list to open on: followers, leaders or mutuals.
  startOn: PropTypes.string,
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  // The lists are not shown to this viewer: a visitor on a site that shows
  // visitors only the start of things.
  heldBack: PropTypes.bool,
};

const mapStateToProps = (state) => {
  const { viewer, isAuthenticated } = state.session;
  return {
    viewer,
    isAuthenticated,
    heldBack: visitor.isPreviewVisitor(state),
  };
};

export default connect(mapStateToProps)(SocialgraphDialog);
