import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';

import recentSearches from '../utils/recentSearches';
import searchAddress from '../utils/searchAddress';
import i18n from '../languages';

const useStyles = makeStyles()((theme) => {
  return {
    root: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      // A soft white field on the coloured top bar.
      backgroundColor: theme.alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: theme.alpha(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(2),
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing(7),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
      width: '100%',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: 200,
      },
    },
  };
});

// The last option of the list, which forgets them all.
const CLEAR = { clear: true, term: '' };

const filterRecent = createFilterOptions({
  stringify: (option) => {
    return option.term;
  },
  trim: true,
});

// The search box in the top bar.
//
// Focused while empty, it offers what this person searched for lately,
// newest first; typing narrows the list. They are kept in this browser
// only (utils/recentSearches.js). Searching opens the search page through
// the router, without reloading the app, and says that the search was
// typed here: the search page looks a handle up on its own server only
// for a search somebody typed, not for one a link opened.
const SearchBox = ({ viewer, isAuthenticated }) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const viewerId = isAuthenticated ? viewer.id : 0;
  const query = location.pathname.startsWith('/search') ?
    (new URLSearchParams(location.search).get('q') || '') : '';

  const [keyword, setKeyword] = useState(query);
  const [recent, setRecent] = useState([]);

  // The box shows what the search page searched for, and follows it when
  // the page changes the term or is left.
  useEffect(() => {
    setKeyword(query);
  }, [query]);

  const search = (term, scope = '') => {
    const trimmed = `${term || ''}`.trim();
    if (!trimmed) {
      return;
    }
    navigate(searchAddress.of({ q: trimmed, scope }), { state: { typed: true } });
  };

  const options = recent.length > 0 ? [...recent, CLEAR] : [];

  return (
    <div className={classes.root}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <Autocomplete
        freeSolo
        disableClearable
        openOnFocus
        options={options}
        inputValue={keyword}
        value={null}
        onOpen={() => {
          // Read again each time: another tab may have searched.
          setRecent(recentSearches.list(viewerId));
        }}
        onInputChange={(event, value, reason) => {
          // Choosing an option is followed by navigating; the box takes
          // its term from the page then.
          if (reason !== 'selectOption' && reason !== 'blur') {
            setKeyword(value);
          }
        }}
        onChange={(event, chosen) => {
          if (chosen && chosen.clear) {
            setRecent(recentSearches.clear(viewerId));
            return;
          }
          if (chosen && typeof chosen === 'object') {
            search(chosen.term, chosen.scope);
            return;
          }
          search(chosen);
        }}
        getOptionLabel={(option) => {
          return typeof option === 'string' ? option : option.term;
        }}
        getOptionKey={(option) => {
          return option.clear ? 'clear' : option.term.toLowerCase();
        }}
        filterOptions={(all, state) => {
          const matching = filterRecent(all.filter((option) => {
            return !option.clear;
          }), state);
          return matching.length > 0 ? [...matching, CLEAR] : [];
        }}
        renderOption={(optionProps, option) => {
          const { key, ...rest } = optionProps;

          if (option.clear) {
            return (
              <li key={key} {...rest}>
                <Typography variant="body2" color="primary" sx={{ py: 0.5 }}>
                  {i18n.t('search:recent.clear')}
                </Typography>
              </li>
            );
          }

          return (
            <li key={key} {...rest}>
              <HistoryIcon fontSize="small" color="action" sx={{ mr: 1.5 }} />
              <Box component="span" sx={{ flexGrow: 1, overflowWrap: 'anywhere' }}>
                {option.term}
              </Box>
              <IconButton
                size="small"
                edge="end"
                aria-label={i18n.t('search:recent.forget', { term: option.term })}
                title={i18n.t('search:recent.forget', { term: option.term })}
                onMouseDown={(event) => {
                  // Keeps the list open, and the option not chosen.
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setRecent(recentSearches.remove(viewerId, option.term));
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </li>
          );
        }}
        slotProps={{
          popper: {
            placement: 'bottom-start',
            sx: { minWidth: 280 },
          },
        }}
        renderInput={(params) => {
          return (
            <InputBase
              ref={params.slotProps.input.ref}
              placeholder={i18n.t('search:boxPlaceholder')}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{
                ...params.slotProps.htmlInput,
                'aria-label': i18n.t('search:cTitle'),
                type: 'search',
                name: 'q',
              }}
            />
          );
        }}
      />
    </div>
  );
};

SearchBox.propTypes = {
  viewer: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  const { viewer, isAuthenticated } = state.session;

  return {
    viewer,
    isAuthenticated,
  };
};

export default connect(mapStateToProps)(SearchBox);
