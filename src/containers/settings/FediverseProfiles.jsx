import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Avatar from '@mui/material/Avatar';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import PeopleIcon from '@mui/icons-material/PublicOutlined';
import RefuseIcon from '@mui/icons-material/PersonOffOutlined';

import Progress from '../../components/Progress';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import federation from '../../utils/federation';
import useRefuseAccount from '../moderation/useRefuseAccount';

const LIMIT = 50;

// How long after the last key the list is asked for again.
const SEARCH_WAIT = 300;

// One profile, which can be refused from here as from its own page.
const Profile = ({ profile, viewer, onRefused }) => {
  const actor = { ...profile, alias: profile.handle };
  const refuse = useRefuseAccount(viewer, actor, onRefused);
  const name = profile.name || profile.handle;
  const label = i18n.t('settings:fediverse.profiles.refuse', { name });
  const details = [
    profile.handle,
    i18n.t(`settings:fediverse.accounts.networks.${profile.network}`, {
      defaultValue: profile.network,
    }),
    i18n.t('settings:fediverse.profiles.followers', { count: profile.followerCount || 0 }),
  ];

  return (
    <ListItem
      divider
      secondaryAction={refuse.canRefuse &&
        <IconButton
          edge="end"
          aria-label={label}
          title={label}
          onClick={refuse.open}
        >
          <RefuseIcon />
        </IconButton>}
    >
      <ListItemText
        primary={<Link href={`/@${profile.handle}/`} underline="hover">{name}</Link>}
        secondary={details.join(' · ')}
        slotProps={{
          primary: { sx: { overflowWrap: 'anywhere' } },
          secondary: { sx: { overflowWrap: 'anywhere' } },
        }}
      />
      {refuse.dialog}
    </ListItem>
  );
};

Profile.propTypes = {
  profile: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  onRefused: PropTypes.func.isRequired,
};

// Who from other networks is kept here, the Fediverse tab's Profiles: somebody
// here followed them, or they were met in a thread. For administrators, to see
// them and refuse any of them. Nobody else sees this list: these people did
// not ask to be listed on this site.
const FediverseProfiles = ({ viewer, alertError }) => {
  const [profiles, setProfiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  // An installation may not run the service at all.
  const [absent, setAbsent] = useState(false);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  // Only the latest answer is kept, whatever order they come back in.
  const asked = useRef(0);

  const load = useCallback((q, offset) => {
    asked.current += 1;
    const mine = asked.current;

    setIsFetching(true);

    return api.federation.knownProfiles({ q, limit: LIMIT, offset })
      .then(({ data }) => {
        if (mine !== asked.current) {
          return;
        }

        const page = data.data || [];

        setProfiles((kept) => {
          return offset === 0 ? page : kept.concat(page);
        });
        setTotal((data.pagination && data.pagination.total) || 0);
      })
      .catch((err) => {
        if (federation.isAbsent(err)) {
          setAbsent(true);
          return;
        }
        alertError(i18n.t('settings:fediverse.errors.load'));
      })
      .finally(() => {
        if (mine === asked.current) {
          setIsFetching(false);
        }
      });
  }, [alertError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
    }, SEARCH_WAIT);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    load(query, 0);
  }, [load, query]);

  const gone = (id) => {
    setProfiles((kept) => {
      return kept.filter((other) => {
        return other.id !== id;
      });
    });
    setTotal((count) => {
      return Math.max(count - 1, 0);
    });
  };

  const searching = query !== '';

  // In the card of the Fediverse tab, under its tabs.
  return (
    <>
      <CardHeader
        avatar={
          <Avatar>
            <PeopleIcon />
          </Avatar>
        }
        title={
          <Typography variant="h6">
            {i18n.t('settings:fediverse.profiles.cTitle')}
          </Typography>
        }
        subheader={i18n.t('settings:fediverse.profiles.cDescription')}
      />
      <Divider />
      {isFetching && <LinearProgress />}

      {absent &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('settings:fediverse.absent')}
          </Typography>
        </CardContent>}

      {!absent &&
        <>
          {(searching || total > 0) &&
            <CardContent sx={{ pb: 0 }}>
              <TextField
                name="search"
                type="search"
                label={i18n.t('settings:fediverse.profiles.search')}
                helperText={i18n.t('settings:fediverse.profiles.count', { count: total })}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                autoComplete="off"
                size="small"
                fullWidth
              />
            </CardContent>}

          {!isFetching && profiles.length === 0 &&
            <CardContent>
              <Typography variant="body2">
                {searching ?
                  i18n.t('settings:fediverse.profiles.noneFound') :
                  i18n.t('settings:fediverse.profiles.none')}
              </Typography>
            </CardContent>}

          {profiles.length > 0 &&
            <InfiniteScroll
              dataLength={profiles.length}
              next={() => {
                load(query, profiles.length);
              }}
              hasMore={profiles.length < total}
              loader={<Progress key="known-profiles-progress" />}
            >
              <List>
                {profiles.map((profile) => {
                  return (
                    <Profile
                      key={profile.id}
                      profile={profile}
                      viewer={viewer}
                      onRefused={() => {
                        gone(profile.id);
                      }}
                    />
                  );
                })}
              </List>
            </InfiniteScroll>}
        </>}
    </>
  );
};

FediverseProfiles.propTypes = {
  viewer: PropTypes.object.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return { viewer: state.session.viewer };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FediverseProfiles);
