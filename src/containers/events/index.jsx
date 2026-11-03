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
import DiscoverEvents from './Discover';
import EventsList from './List';
import api from '../../api';
import i18n from '../../languages';
import permissions from '../../permissions';
import PersonType from '../../proptypes/Person';
import events from '../../utils/events';

const DISCOVER = 'discover';

// Events. First what is on, for everybody (Discover), so an art show, a
// block party or a meeting can be found by anybody it is open to; then,
// for somebody signed in, their own four lists: what they said they are
// going to, were invited to, host, and what is over. A visitor has
// Discover alone, without a row of tabs.
//
// The tab is in the address (?list=), so it can be linked to and survives
// a reload; Discover's own choices are beside it (?when=, ?where=, ?who=).
const EventsPage = ({ viewer, isAuthenticated, actorSettings = {} }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabs = isAuthenticated ? [DISCOVER, ...events.LISTS] : [DISCOVER];
  const asked = searchParams.get('list');
  const list = tabs.includes(asked) ? asked : DISCOVER;

  const read = useCallback(({ start, limit }) => {
    return api.eventDetails.mine({ filter: list, start, limit });
  }, [list]);

  const canAdd = isAuthenticated && permissions.actor.canAddEvent(viewer, actorSettings);

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
      {tabs.length > 1 &&
        <AppBar
          position="sticky"
          color="inherit"
          elevation={1}
          sx={{ mb: 2, top: 8 * 7, zIndex: 8 }}
        >
          <Tabs
            value={list}
            onChange={(event, value) => {
              // Each list starts over; Discover's choices go with it.
              setSearchParams(value === DISCOVER ? {} : { list: value });
            }}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
          >
            {tabs.map((each) => {
              return (
                <Tab
                  key={each}
                  value={each}
                  label={each === DISCOVER ?
                    i18n.t('events:discover.title') :
                    i18n.t(`events:event.mine.${each}`)}
                  sx={{ flexGrow: 1 }}
                />
              );
            })}
          </Tabs>
        </AppBar>}
      {list === DISCOVER ?
        <DiscoverEvents isAuthenticated={isAuthenticated} /> :
        <EventsList
          key={`events-${list}`}
          read={read}
          empty={i18n.t(`events:event.none.${list}`)}
        />}
    </>
  );
};

EventsPage.propTypes = {
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  // What the installation says about who may make one. Empty until NodeInfo
  // answers, which ranks as "nobody", so the + arrives with the answer.
  actorSettings: PropTypes.object,
};

const mapStateToProps = (state) => {
  const { nodeInfo } = state.app;

  return {
    viewer: state.session.viewer,
    isAuthenticated: state.session.isAuthenticated,
    actorSettings: (nodeInfo && nodeInfo.metadata) || {},
  };
};

export default connect(mapStateToProps)(EventsPage);
