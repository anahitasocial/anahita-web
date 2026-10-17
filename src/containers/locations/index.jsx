import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import LocationsIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';

import BrowseHeader from '../../components/BrowseHeader';
import PagedList from '../../components/PagedList';
import Progress from '../../components/Progress';
import TrendingWindow from '../../components/TrendingWindow';
import ListItem from './Browse/ListItem';
import api from '../../api';
import i18n from '../../languages';

const TRENDING = 'trending';
const NEARBY = 'nearby';
const ALL = 'all';
const TABS = [TRENDING, NEARBY, ALL];

const useStyles = makeStyles()({
  root: {
    marginBottom: 8 * 2,
    position: 'sticky',
    top: 8 * 7,
    zIndex: 8,
  },
});

// Over what span of time what is trending is, above it.
const trendingHeader = (answer, isEmpty) => {
  return <TrendingWindow window={answer ? answer.window : ''} empty={isEmpty} />;
};

// A place in a list; in what is trending, with how many people lately.
const row = (location) => {
  return (
    <ListItem
      key={`location-${location.id}`}
      location={location}
      actions={location.people ?
        <Typography variant="body2" color="textSecondary">
          {i18n.t('commons:counts.people', { count: location.people })}
        </Typography> :
        null}
    />
  );
};

// Where the viewer is, as their browser says when they let it: asked for
// when the Nearby tab is opened, and again when they try again.
const useWhereIAm = (wanted) => {
  const [where, setWhere] = useState({ state: 'idle' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!wanted) {
      return undefined;
    }
    if (!navigator.geolocation) {
      setWhere({ state: 'denied' });
      return undefined;
    }
    let current = true;
    setWhere({ state: 'asking' });
    navigator.geolocation.getCurrentPosition((position) => {
      if (current) {
        setWhere({
          state: 'found',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }
    }, () => {
      if (current) {
        setWhere({ state: 'denied' });
      }
    }, { maximumAge: 10 * 60 * 1000, timeout: 15000 });
    return () => {
      current = false;
    };
  }, [wanted, attempt]);

  return [where, () => { setAttempt(attempt + 1); }];
};

// The Locations page (the user, 2026-10-17): what is trending, with how
// many people tied a post to each and over what span of time; the places
// nearest the viewer; and all of them, A to Z, to search. Popular and
// Recent were dropped, as on the Hashtags page.
const Locations = () => {
  const { classes } = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get('sort') || TRENDING;
  const tab = TABS.includes(requested) ? requested : TRENDING;
  const [where, tryAgain] = useWhereIAm(tab === NEARBY);

  // What is searched, asked for a moment after typing stops.
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(search.trim());
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const changeTab = (event, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === TRENDING) {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    setSearchParams(params);
  };

  return (
    <>
      {/* No action. A location is attached to a post rather than created on
          its own, so there is nothing here for a + to open. */}
      <Box sx={{ mb: 2 }}>
        <BrowseHeader
          icon={<LocationsIcon />}
          title={i18n.t('locations:cTitle')}
        />
      </Box>
      <AppBar
        position="sticky"
        color="inherit"
        className={classes.root}
        elevation={1}
      >
        <Tabs
          value={tab}
          onChange={changeTab}
          centered
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {TABS.map((each) => {
            return (
              <Tab
                key={each}
                label={i18n.t(`commons:sortByOptions.${each}`)}
                value={each}
              />
            );
          })}
        </Tabs>
      </AppBar>
      {tab === TRENDING &&
        <PagedList
          reloadKey={TRENDING}
          load={({ limit }) => {
            return api.locations.trending({ limit });
          }}
          renderItem={row}
          header={trendingHeader}
        />}
      {tab === NEARBY && where.state === 'asking' &&
        <>
          <Typography variant="body2" color="textSecondary" sx={{ px: 2, py: 1 }}>
            {i18n.t('locations:lists.asking')}
          </Typography>
          <Progress />
        </>}
      {tab === NEARBY && where.state === 'denied' &&
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {i18n.t('locations:lists.denied')}
          </Typography>
          <Button variant="outlined" onClick={tryAgain}>
            {i18n.t('locations:lists.tryAgain')}
          </Button>
        </Box>}
      {tab === NEARBY && where.state === 'found' &&
        <PagedList
          reloadKey={`${NEARBY}|${where.latitude}|${where.longitude}`}
          load={({ start, limit }) => {
            return api.locations.nearby({
              latitude: where.latitude,
              longitude: where.longitude,
              start,
              limit,
            });
          }}
          renderItem={row}
          empty={i18n.t('locations:lists.noneNearby')}
        />}
      {tab === ALL &&
        <>
          <Box sx={{ px: 2, pb: 1 }}>
            <TextField
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder={i18n.t('locations:lists.search')}
              aria-label={i18n.t('locations:lists.search')}
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          <PagedList
            reloadKey={`${ALL}|${q}`}
            load={({ start, limit }) => {
              return api.locations.all({ q, start, limit });
            }}
            renderItem={row}
            empty={i18n.t('locations:lists.noneFound')}
          />
        </>}
    </>
  );
};

export default Locations;
