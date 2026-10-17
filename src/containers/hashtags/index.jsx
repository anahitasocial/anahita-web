import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';

import HashtagsIcon from '@mui/icons-material/Label';
import SearchIcon from '@mui/icons-material/Search';

import BrowseHeader from '../../components/BrowseHeader';
import PagedList from '../../components/PagedList';
import TrendingWindow from '../../components/TrendingWindow';
import api from '../../api';
import i18n from '../../languages';

const TRENDING = 'trending';
const FOLLOWING = 'following';
const ALL = 'all';

const useStyles = makeStyles()({
  root: {
    marginBottom: 8 * 2,
    position: 'sticky',
    top: 8 * 7,
    zIndex: 8,
  },
});

// A hashtag in a list, and how many: people lately, in what is trending;
// posts anybody may see, in the others.
const HashtagRow = ({ hashtag }) => {
  const count = hashtag.people ?
    i18n.t('commons:counts.people', { count: hashtag.people }) :
    i18n.t('commons:counts.posts', { count: hashtag.uses || 0 });
  return (
    <ListItemButton component={RouterLink} to={`/hashtags/${hashtag.alias}/`} divider>
      <ListItemAvatar>
        <Avatar>#</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={hashtag.name}
        secondary={count}
        slotProps={{ primary: { dir: 'auto' } }}
      />
    </ListItemButton>
  );
};

HashtagRow.propTypes = {
  hashtag: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    alias: PropTypes.string,
    people: PropTypes.number,
    uses: PropTypes.number,
  }).isRequired,
};

// Over what span of time what is trending is, above it.
const trendingHeader = (answer, isEmpty) => {
  return <TrendingWindow window={answer ? answer.window : ''} empty={isEmpty} />;
};

const row = (hashtag) => {
  return <HashtagRow key={`hashtag-${hashtag.id}`} hashtag={hashtag} />;
};

// The Hashtags page (the user, 2026-10-17): what is trending, with how many
// people posted with each and over what span of time; the ones somebody
// follows; and all of them, A to Z, to search. Popular and Recent were
// dropped: an all-time count that never changes, and the newest hashtags,
// which are mostly one-offs.
const Hashtags = () => {
  const { classes } = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewer = useSelector((state) => { return state.session.viewer; });
  const signedIn = Boolean(viewer && viewer.id > 0);

  const tabs = signedIn ? [TRENDING, FOLLOWING, ALL] : [TRENDING, ALL];
  const requested = searchParams.get('sort') || TRENDING;
  const tab = tabs.includes(requested) ? requested : TRENDING;

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
      {/* No action. A hashtag is not created here — it comes into being when
          somebody uses it in a post — so there is nothing for a + to open. */}
      <Box sx={{ mb: 2 }}>
        <BrowseHeader
          icon={<HashtagsIcon />}
          title={i18n.t('hashtags:cTitle')}
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
          {tabs.map((each) => {
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
      {tab === ALL &&
        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder={i18n.t('hashtags:lists.search')}
            aria-label={i18n.t('hashtags:lists.search')}
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
        </Box>}
      {tab === TRENDING &&
        <PagedList
          reloadKey={TRENDING}
          load={({ limit }) => {
            return api.hashtags.trending({ limit });
          }}
          renderItem={row}
          header={trendingHeader}
        />}
      {tab === FOLLOWING &&
        <PagedList
          reloadKey={FOLLOWING}
          load={({ start, limit }) => {
            return api.hashtags.following({ start, limit });
          }}
          renderItem={row}
          empty={i18n.t('hashtags:lists.noneFollowing')}
        />}
      {tab === ALL &&
        <PagedList
          reloadKey={`${ALL}|${q}`}
          load={({ start, limit }) => {
            return api.hashtags.all({ q, start, limit });
          }}
          renderItem={row}
          empty={i18n.t('hashtags:lists.noneFound')}
        />}
    </>
  );
};

export default Hashtags;
