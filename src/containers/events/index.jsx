import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import EventsIcon from '@mui/icons-material/Event';

import BrowseHeader from '../../components/BrowseHeader';
import EventsList from './List';
import api from '../../api';
import i18n from '../../languages';
import permissions from '../../permissions';
import PersonType from '../../proptypes/Person';
import events from '../../utils/events';

// Events, for somebody signed in: their own.
//
// Four lists: what they said they are going to, what they were invited to,
// what they host, and what is over. There is no list of every event on the
// site. An event is found from an invitation, from the group or person
// hosting it, or by its address.
const EventsPage = ({ viewer, actorSettings = {} }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // The tab is in the address, so it can be linked to and survives a
  // reload.
  const asked = searchParams.get('list');
  const list = events.LISTS.includes(asked) ? asked : events.UPCOMING;

  const read = useCallback(({ start, limit }) => {
    return api.eventDetails.mine({ filter: list, start, limit });
  }, [list]);

  const canAdd = permissions.actor.canAddEvent(viewer, actorSettings);

  return (
    <>
      <Helmet>
        <title>{i18n.t('events:cTitle')}</title>
      </Helmet>
      <Box sx={{ mb: 2 }}>
        <BrowseHeader
          icon={<EventsIcon />}
          title={i18n.t('events:cTitle')}
          actionTo={canAdd ? '/events/add' : ''}
          actionLabel={i18n.t('events:add.cTitle')}
        />
      </Box>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={1}
        sx={{ mb: 2, top: 8 * 7, zIndex: 8 }}
      >
        <Tabs
          value={list}
          onChange={(event, value) => {
            const params = new URLSearchParams(searchParams);
            if (value === events.UPCOMING) {
              params.delete('list');
            } else {
              params.set('list', value);
            }
            setSearchParams(params);
          }}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {events.LISTS.map((each) => {
            return (
              <Tab
                key={each}
                value={each}
                label={i18n.t(`events:event.mine.${each}`)}
              />
            );
          })}
        </Tabs>
      </AppBar>
      <EventsList
        key={`events-${list}`}
        read={read}
        empty={i18n.t(`events:event.none.${list}`)}
      />
    </>
  );
};

EventsPage.propTypes = {
  viewer: PersonType.isRequired,
  // What the installation says about who may make one. Empty until NodeInfo
  // answers, which ranks as "nobody", so the + arrives with the answer.
  actorSettings: PropTypes.object,
};

const mapStateToProps = (state) => {
  const { nodeInfo } = state.app;

  return {
    viewer: state.session.viewer,
    actorSettings: (nodeInfo && nodeInfo.metadata) || {},
  };
};

export default connect(mapStateToProps)(EventsPage);
