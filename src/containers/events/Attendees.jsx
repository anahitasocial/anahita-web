import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import ListDialogHeader from '../../components/ListDialogHeader';
import ProfileRow from '../../components/ProfileRow';
import Progress from '../../components/Progress';
import api from '../../api';
import i18n from '../../languages';
import events from '../../utils/events';
import socialgraph from '../../utils/socialgraph';
import { App as APP } from '../../constants';

const { LIMIT } = APP.BROWSE;

const KINDS = [events.GOING, events.MAYBE];

// Who is going to an event, and who said maybe: two lists, each read when
// its tab is first opened and more of it as its end is scrolled to.
const EventAttendees = ({
  actor,
  open,
  onClose,
}) => {
  const [kind, setKind] = useState(events.GOING);
  const [lists, setLists] = useState({});
  const [failed, setFailed] = useState({});
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });

  const load = (which, start) => {
    api.eventDetails.attendees({
      event: actor,
      rsvp: which,
      start,
      limit: LIMIT,
    }).then((result) => {
      setLists((before) => {
        return { ...before, [which]: socialgraph.merge(before[which], result.data, start) };
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
      setKind(events.GOING);
      setLists({});
      setFailed({});
    }
  }, [open, actor.id]);

  useEffect(() => {
    if (open && !lists[kind] && !failed[kind]) {
      load(kind, 0);
    }
  }, [open, kind, lists[kind], failed[kind]]);

  const list = lists[kind];
  const event = actor.event || {};
  const counts = {
    [events.GOING]: event.goingCount || 0,
    [events.MAYBE]: event.maybeCount || 0,
  };
  const scrollId = `attendees-scroll-${actor.id}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={phone}
      fullWidth
      maxWidth="sm"
      aria-labelledby={`attendees-title-${actor.id}`}
    >
      <ListDialogHeader
        id={`attendees-title-${actor.id}`}
        title={i18n.t('events:event.attendees.title')}
        onClose={onClose}
      />
      <Tabs
        value={kind}
        onChange={(change, value) => {
          setKind(value);
        }}
        variant="fullWidth"
        aria-label={i18n.t('events:event.attendees.title')}
      >
        {KINDS.map((each) => {
          return (
            <Tab
              key={each}
              value={each}
              label={`${i18n.t(`events:event.attendees.${each}`)} ${counts[each]}`}
            />
          );
        })}
      </Tabs>
      <DialogContent dividers id={scrollId} sx={{ p: 0, minHeight: 240 }}>
        {!list && !failed[kind] && <Progress />}
        {failed[kind] &&
          <Typography variant="body2" color="error" role="alert" sx={{ p: 2 }}>
            {i18n.t('events:event.failed')}
          </Typography>}
        {list && list.rows.length === 0 &&
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            {i18n.t(`events:event.attendees.none.${kind}`)}
          </Typography>}
        {list && list.rows.length > 0 &&
          <InfiniteScroll
            dataLength={list.rows.length}
            next={() => {
              load(kind, list.rows.length);
            }}
            hasMore={list.rows.length < list.total}
            loader={<Progress key="attendees-progress" />}
            scrollableTarget={scrollId}
          >
            <List disablePadding>
              {list.rows.map((person) => {
                return <ProfileRow key={`attendee-${kind}-${person.id}`} actor={person} />;
              })}
            </List>
          </InfiniteScroll>}
      </DialogContent>
    </Dialog>
  );
};

EventAttendees.propTypes = {
  // The event, as an actor.
  actor: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EventAttendees;
