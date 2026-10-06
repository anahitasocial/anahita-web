import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useGeolocated } from 'react-geolocated';
import { makeStyles } from 'tss-react/mui';

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
import { Search as SEARCH } from '../../../constants';
import i18n from '../../../languages';

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

const Search = () => {
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
  // undefined rather than null when absent, so the request leaves it out.
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.has('q') ? searchParams.get('q') : undefined;
  let coordLong = 0.0;
  let coordLat = 0.0;

  const [scope, setScope] = useState(SCOPE.ALL);
  const [sort, setSort] = useState(SORTING.RELEVANT);
  const [searchRange, setSearchRange] = useState(125);

  const changeScope = (event, value) => {
    setScope(value);
  };

  if (
    isGeolocationAvailable &&
    isGeolocationEnabled &&
    coords
  ) {
    coordLong = coords.longitude;
    coordLat = coords.latitude;
  }

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
                  setSort(event.target.value);
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
                value={searchRange}
                getAriaValueText={(value) => {
                  return `${value}km`;
                }}
                onChange={(event, value) => {
                  setSearchRange(value);
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
        </Tabs>
      </AppBar>
      {useMemo(() => {
        return (
          <SearchList
            key={`${sort}-${scope}-${searchRange}`}
            queryParams={{
              q,
              sort,
              scope,
              searchRange: searchRange * 1000,
              coordLong,
              coordLat,
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
      ])}
    </>
  );
};

const mapStateToProps = () => {
  return {};
};

export default connect(
  mapStateToProps,
)(Search);
