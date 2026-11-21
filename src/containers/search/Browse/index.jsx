import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGeolocated } from 'react-geolocated';
import { makeStyles } from 'tss-react/mui';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import TuneIcon from '@mui/icons-material/Tune';

import SearchList from './SearchList';
import RecentSearches from './RecentSearches';
import useScopeCounts from './useScopeCounts';
import SearchOptionsDialog from './OptionsDialog';
import shortCount from '../../../utils/shortCount';
import RemoteLookup from '../RemoteLookup';
import Progress from '../../../components/Progress';
import { Search as SEARCH } from '../../../constants';
import i18n from '../../../languages';
import federation from '../../../utils/federation';
import recentSearches from '../../../utils/recentSearches';
import searchChoices from '../../../utils/searchChoices';
import searchAddress from '../../../utils/searchAddress';

const { SCOPE, SORTING } = SEARCH;

const useStyles = makeStyles()(() => {
  return {
    root: {
      marginBottom: 8 * 2,
      position: 'sticky',
      top: 8 * 7,
      zIndex: 8,
      width: '100%',
    },
  };
});

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
  // as it was. `q` is undefined rather than null when absent, so the request leaves
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

  // How this person likes "Most relevant" ordered, kept in their browser.
  const [choices, setChoices] = useState(() => {
    return searchChoices.read(viewerId);
  });
  useEffect(() => {
    setChoices(searchChoices.read(viewerId));
  }, [viewerId]);
  // The order, the distance and the choices, in one dialog (roadmap row
  // 164); and how many times the viewer's weights for "Most relevant",
  // kept on the server, were saved, so the results are read again after
  // each.
  const [isChoosing, setIsChoosing] = useState(false);
  const [weighed, setWeighed] = useState(0);
  const optionsSummary = [
    i18n.t(`search:sortOptions.${sort === SORTING.RECENT ? 'recent' : 'relevant'}`),
    searchRange === searchAddress.ANYWHERE ?
      i18n.t('search:anywhere') :
      i18n.t('search:km', { radius: searchRange }),
  ].join(' · ');

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

  // How many each tab finds, beside its name, short however large.
  const geo = near && located ?
    { search_range: searchRange * 1000, coord_lng: coordLong, coord_lat: coordLat } :
    {};
  const counts = useScopeCounts(waitingForPlace ? '' : q, geo);
  // A tab that finds nothing is not drawn, once its count says so. All is
  // always drawn, and so is the open tab even when it finds nothing (it
  // may have come from a link), so that the tabs never point at one that
  // is not there.
  const shown = (kind) => {
    return kind === SCOPE.ALL || kind === scope || counts[kind] !== 0;
  };
  const tabLabel = (kind) => {
    const name = i18n.t(`search:filterNodeTypes.${kind}`);
    if (counts[kind] === undefined) {
      return name;
    }
    return (
      <span>
        {name}
        <Box
          component="span"
          sx={{ ml: 1, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
          aria-label={i18n.t('search:countLabel', { count: counts[kind] })}
        >
          {shortCount(counts[kind], i18n.language)}
        </Box>
      </span>
    );
  };

  const list = useMemo(() => {
    return (
      <SearchList
        key={`${q}-${sort}-${scope}-${searchRange}-${choices.followedFirst}-${choices.recentFirst}-${weighed}`}
        lead={found}
        counts={counts}
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
          choices,
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
    counts,
    choices,
    weighed,
  ]);

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        className={classes.root}
        elevation={1}
      >
        {/* One button that says how the search is set, and opens the
            dialog to change it: the order, the choices for "Most
            relevant" and the distance (roadmap row 164). */}
        <Box sx={{ px: 1, pt: 1 }}>
          <Button
            color="inherit"
            size="small"
            startIcon={<TuneIcon />}
            aria-haspopup="dialog"
            aria-label={i18n.t('search:options.open', { summary: optionsSummary })}
            onClick={() => {
              setIsChoosing(true);
            }}
            sx={{
              maxWidth: '100%',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              color: 'text.secondary',
              '& .MuiButton-startIcon': { flexShrink: 0 },
            }}
          >
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {optionsSummary}
            </Box>
          </Button>
        </Box>
        <SearchOptionsDialog
          open={isChoosing}
          signedIn={viewerId > 0}
          sort={sort}
          km={searchRange}
          choices={choices}
          onCancel={() => {
            setIsChoosing(false);
          }}
          onDone={(chosen) => {
            setIsChoosing(false);
            if (viewerId > 0) {
              setChoices(searchChoices.write(viewerId, { ...choices, ...chosen.choices }));
            }
            if (chosen.sort !== sort || chosen.km !== searchRange) {
              change({ sort: chosen.sort, km: chosen.km });
            }
          }}
          onWeighed={() => {
            setWeighed(weighed + 1);
          }}
        />
        <Tabs
          value={scope}
          onChange={changeScope}
          variant="scrollable"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={tabLabel(SCOPE.ALL)}
            value={SCOPE.ALL}
          />
          {shown(SCOPE.POSTS) &&
            <Tab
              label={tabLabel(SCOPE.POSTS)}
              value={SCOPE.POSTS}
            />}
          {shown(SCOPE.MEDIA) &&
            <Tab
              label={tabLabel(SCOPE.MEDIA)}
              value={SCOPE.MEDIA}
            />}
          {shown(SCOPE.ACTORS) &&
            <Tab
              label={tabLabel(SCOPE.ACTORS)}
              value={SCOPE.ACTORS}
            />}
          {shown(SCOPE.FEEDS) &&
            <Tab
              label={tabLabel(SCOPE.FEEDS)}
              value={SCOPE.FEEDS}
            />}
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
