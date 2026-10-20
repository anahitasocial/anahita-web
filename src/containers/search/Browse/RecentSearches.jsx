import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';

import i18n from '../../../languages';
import recentSearches from '../../../utils/recentSearches';
import searchAddress from '../../../utils/searchAddress';

// What this person searched for lately, on the search page when nothing
// has been typed. Kept in this browser only; nothing is drawn when there
// are none, or for a visitor who is not signed in.
const RecentSearches = ({ viewerId }) => {
  const [searches, setSearches] = useState(() => {
    return recentSearches.list(viewerId);
  });

  if (searches.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader title={i18n.t('search:recent.title')} />
      <List disablePadding>
        {searches.map((each) => {
          return (
            <ListItem
              key={each.term.toLowerCase()}
              disablePadding
              divider
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label={i18n.t('search:recent.forget', { term: each.term })}
                  title={i18n.t('search:recent.forget', { term: each.term })}
                  onClick={() => {
                    setSearches(recentSearches.remove(viewerId, each.term));
                  }}
                >
                  <CloseIcon />
                </IconButton>
              }
            >
              <ListItemButton
                component={RouterLink}
                to={searchAddress.of({ q: each.term, scope: each.scope })}
              >
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary={each.term}
                  slotProps={{ primary: { sx: { overflowWrap: 'anywhere' } } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => {
            setSearches(recentSearches.clear(viewerId));
          }}
        >
          {i18n.t('search:recent.clear')}
        </Button>
      </CardActions>
    </Card>
  );
};

RecentSearches.propTypes = {
  viewerId: PropTypes.number.isRequired,
};

export default RecentSearches;
