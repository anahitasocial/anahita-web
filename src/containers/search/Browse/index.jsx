import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGeolocated } from 'react-geolocated';
import { makeStyles } from 'tss-react/mui';

import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Toolbar from '@mui/material/Toolbar';

import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

import SearchList from './SearchList';
import RecentSearches from './RecentSearches';
import RemoteLookup from '../RemoteLookup';
import Progress from '../../../components/Progress';
import { Search as SEARCH } from '../../../constants';
import i18n from '../../../languages';
import federation from '../../../utils/federation';
import recentSearches from '../../../utils/recentSearches';
import searchAddress from '../../../utils/searchAddress';

const { SCOPE, SORTING } = SEARCH;

const useStyles = makeStyles()((theme) => {
  return {
    root: {
      marginBottom: 8 * 2,
      position: 'sticky',
      top: 8 * 7,
      zIndex: 8,
      width: '100%',
    },
    formControl: {
      width: '100%',
      marginTop: theme.spacing(3),
      // marginLeft: theme.spacing(1),
    },
    formControlLabel: {
      marginTop: theme.spacing(3),
    },
  };
});

const marks = [
  {
    value: 25,
    label: i18n.t('search:filterRadius', { radius: 25 }),
  },
  {
    value: 50,
    label: i18n.t('search:filterRadius', { radius: 50 }),
  },
  {
    value: 75,
    label: i18n.t('search:filterRadius', { radius: 75 }),
  },
  {
    value: 100,
    label: i18n.t('search:filterRadius', { radius: 100 }),
  },
  {
    value: 125,
    label: <AllInclusiveIcon />,
  },
];

const Search = ({ viewerId }) => {
  const { classes } = useStyles();
  const {
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Everything the page is set to is in its address (utils/searchAddress),
  // so that reloading, going back and a link sent to somebody all open it
  // as it was. The page of custom feeds leads here with `?scope=feeds`.
  // `q` is undefined rather than null when absent, so the request leaves
  // it out.
  const {
    q,
    scope,
    sort,
    km: searchRange,
  } = searchAddress.read(location.search);
  let coordLong = 0.0;
  let coordLat = 0.0;

  // A change of tab, order or distance replaces the address rather than
  // adding to the history: Back leaves the search, as it did.
  const change = (what) => {
    navigate(searchAddress.of({
      q: q || '',
      scope,
      sort,
      km: searchRange,
      ...what,
    }), { replace: true });
  };

  // The slider moves as it is dragged and is written to the address when
  // let go, so that a drag is one search and not five.
  const [range, setRange] = useState(searchRange);
  useEffect(() => {
    setRange(searchRange);
  }, [searchRange]);

  const changeScope = (event, value) => {
    change({ scope: value });
  };

  // Remembered in this browser when it is run, however it was reached:
  // from the box, from a link, from the list of recent searches.
  useEffect(() => {
    if (q) {
      recentSearches.add(viewerId, q, scope);
    }
  }, [viewerId, q, scope]);

  // A handle typed into the search box is looked up on its own server at
  // once; one a link opened waits for the button (see RemoteLookup).
  const typed = Boolean(location.state && location.state.typed);
  const lookUpNow = typed && viewerId > 0 && federation.isClearHandle(q);

  // Somebody found on another server, drawn first among the results.
  const [found, setFound] = useState(null);
  useEffect(() => {
    setFound(null);
  }, [q]);

  if (
    isGeolocationAvailable &&
    isGeolocationEnabled &&
    coords
  ) {
    coordLong = coords.longitude;
    coordLat = coords.latitude;
  }

  // A distance means nothing without knowing where the searcher is, and
  // the server leaves it out when it is not told. Rather than search
  // everywhere and look as though it had not, the page says so; and while
  // the browser is still asking, it waits.
  const near = searchRange <= 100;
  const located = coordLat !== 0.0 || coordLong !== 0.0;
  let noPlace = '';
  if (near && !isGeolocationAvailable) {
    noPlace = 'unavailable';
  } else if (near && !isGeolocationEnabled) {
    noPlace = 'refused';
  }
  const waitingForPlace = near && !located && !noPlace;

  const list = useMemo(() => {
    return (
      <SearchList
        key={`${q}-${sort}-${scope}-${searchRange}`}
        lead={found}
        onScope={(value) => {
          change({ scope: value });
        }}
        queryParams={{
          q,
          sort,
          scope,
          searchRange,
          coordLong,
          coordLat,
          found,
        }}
      />
    );
  }, [
    q,
    sort,
    scope,
    searchRange,
    coordLong,
    coordLat,
    found,
  ]);

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        className={classes.root}
        elevation={1}
      >
        <Toolbar>
          <FormGroup
            style={{
              width: '100%',
            }}
          >
            <FormControl
              variant="outlined"
              className={classes.formControl}
            >
              <InputLabel id="search-sort-label">
                {i18n.t('search:sort')}
              </InputLabel>
              <Select
                variant="standard"
                labelId="search-sort-label"
                id="search-sort-select"
                value={sort}
                onChange={(event) => {
                  change({ sort: event.target.value });
                }}
                label={i18n.t('search:sort')}
              >
                <MenuItem value={SORTING.RELEVANT}>
                  {i18n.t('search:sortOptions.relevant')}
                </MenuItem>
                <MenuItem value={SORTING.RECENT}>
                  {i18n.t('search:sortOptions.recent')}
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="outlined"
              className={classes.formControl}
            >
              <Slider
                value={range}
                getAriaValueText={(value) => {
                  return `${value}km`;
                }}
                onChange={(event, value) => {
                  setRange(value);
                }}
                onChangeCommitted={(event, value) => {
                  change({ km: value });
                }}
                aria-labelledby="search-range-slider"
                min={25}
                max={125}
                step={25}
                marks={marks}
              />
            </FormControl>
          </FormGroup>
        </Toolbar>
        <Tabs
          value={scope}
          onChange={changeScope}
          variant="scrollable"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={i18n.t('search:filterNodeTypes.all')}
            value={SCOPE.ALL}
          />
          <Tab
            label={i18n.t('search:filterNodeTypes.media')}
            value={SCOPE.MEDIA}
          />
          <Tab
            label={i18n.t('search:filterNodeTypes.actors')}
            value={SCOPE.ACTORS}
          />
          <Tab
            label={i18n.t('search:filterNodeTypes.feeds')}
            value={SCOPE.FEEDS}
          />
        </Tabs>
      </AppBar>
      {noPlace &&
        <Alert severity="info" sx={{ mb: 2 }}>
          {i18n.t(`search:distance.${noPlace}`)}
        </Alert>}
      <RemoteLookup query={q} now={lookUpNow} onFound={setFound} />
      {/* Nothing typed: what this person searched for lately, and
          nothing else. */}
      {!q && <RecentSearches viewerId={viewerId} />}
      {waitingForPlace && q && <Progress />}
      {!waitingForPlace && list}
    </>
  );
};

Search.propTypes = {
  // 0 for a visitor who is not signed in, who has no recent searches.
  viewerId: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => {
  const { viewer, isAuthenticated } = state.session;

  return {
    viewerId: isAuthenticated && viewer ? viewer.id : 0,
  };
};

export default connect(
  mapStateToProps,
)(Search);
