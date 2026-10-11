import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';

import EditIcon from '@mui/icons-material/EditOutlined';
import ManageIcon from '@mui/icons-material/TuneOutlined';

import CompleteProfileCard from './CompleteProfileCard';
import Composers from '../media/Composer';
import FeedBrowse from '../feed/Leaders';
import FeedCustomBrowse from '../feed/Custom';
import usePinnedFeeds from './usePinnedFeeds';
import CustomFeedEditDialog from './EditDialog';
import CustomFeedIcon from '../../components/CustomFeedIcon';
import actions from '../../actions';
import i18n from '../../languages';

import PersonType from '../../proptypes/Person';

// Which tab is the feed of the people and groups the viewer follows.
const FOLLOWING = 0;

// Home, for somebody signed in: a place to post, and their feeds.
//
// The first tab is always the feed of the people and groups they follow,
// newest first. After it come the custom feeds they keep here, their own and
// other people's, in the order they put them in. The tab that is open is in
// the address (`?feed=`), so it survives a reload and can be linked to.
//
// At the end of the tabs, where a phone has them too: a pencil, when the
// open feed is the viewer's own, which opens it to be changed in a dialog
// over the page, and the way to the list of feeds. A feed that was changed
// is read again at once, under the dialog as it closes.
const FeedsPage = ({
  readPerson,
  viewer,
  person,
}) => {
  const pinned = usePinnedFeeds(true);
  const [isEditing, setIsEditing] = useState(false);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    readPerson(viewer.alias);
  }, [readPerson, viewer.alias]);

  const asked = Number(params.get('feed')) || FOLLOWING;
  const open = pinned.find((feed) => {
    return feed.id === asked;
  });

  return (
    <>
      <Helmet>
        <title>{i18n.t('home:cTitle')}</title>
      </Helmet>
      <Grid
        container
        sx={{ justifyContent: 'center' }}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          <CompleteProfileCard viewer={viewer} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          {person.id &&
            <Composers actor={person} />}
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <Tabs
              value={open ? open.id : FOLLOWING}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              onChange={(event, feedId) => {
                setParams(feedId === FOLLOWING ? {} : { feed: String(feedId) });
              }}
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              <Tab value={FOLLOWING} label={i18n.t('customFeeds:home.following')} />
              {pinned.map((feed) => {
                return (
                  <Tab
                    key={`home-feed-${feed.id}`}
                    value={feed.id}
                    label={feed.name}
                    icon={<CustomFeedIcon name={feed.icon} fontSize="small" />}
                    iconPosition="start"
                    sx={{ minHeight: 48 }}
                  />
                );
              })}
            </Tabs>
            {open && open.authorized && open.authorized.edit &&
              <Tooltip title={i18n.t('customFeeds:actions.edit')}>
                <IconButton
                  aria-label={i18n.t('customFeeds:actions.edit')}
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>}
            <Tooltip title={i18n.t('customFeeds:home.manage')}>
              <IconButton
                component={RouterLink}
                to="/feeds"
                aria-label={i18n.t('customFeeds:home.manage')}
              >
                <ManageIcon />
              </IconButton>
            </Tooltip>
          </Box>
          {/* Keyed by when it was last changed, so a feed that was just
              edited is read again from the top. */}
          {open ?
            <FeedCustomBrowse key={`home-feed-${open.id}-${open.updatedAt}`} feed={open} /> :
            <FeedBrowse />}
          {open && isEditing &&
            <CustomFeedEditDialog
              feedId={open.id}
              onClose={() => {
                setIsEditing(false);
              }}
              onDeleted={() => {
                setIsEditing(false);
                setParams({});
              }}
            />}
        </Grid>
      </Grid>
    </>
  );
};

FeedsPage.propTypes = {
  readPerson: PropTypes.func.isRequired,
  viewer: PersonType.isRequired,
  person: PersonType.isRequired,
};

const mapStateToProps = (state) => {
  const {
    viewer,
  } = state.session;

  const {
    people: {
      current: person,
    },
  } = state.people;

  return {
    viewer,
    person,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    readPerson: (alias) => {
      return dispatch(actions.people.read(alias, 'people'));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FeedsPage);
