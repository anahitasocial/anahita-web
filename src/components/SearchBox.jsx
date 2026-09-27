import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import i18n from '../languages';

const useStyles = makeStyles()((theme) => {
  return {
    root: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
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

const SearchBox = () => {
  const { classes } = useStyles();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [keyword, setKeyword] = useState(query);

  const handleOnChange = (event) => {
    const { value } = event.target;
    setKeyword(value);
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();

    if (keyword) {
      event.target.submit();
    }
  };

  return (
    <div className={classes.root}>
      <form
        onSubmit={handleOnSubmit}
        autoComplete="off"
        action="/search/"
        noValidate
      >
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder={i18n.t('search:boxPlaceholder')}
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{ 'aria-label': i18n.t('search:cTitle') }}
          onChange={handleOnChange}
          name="q"
          value={keyword}
          required
        />
      </form>
    </div>
  );
};

export default SearchBox;
