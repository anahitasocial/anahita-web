import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import i18n from '../../../languages';
import { Search as SEARCH } from '../../../constants';

const { SCOPE } = SEARCH;

// The tabs below All, each of which may find what the open one did not.
const NARROW = [SCOPE.MEDIA, SCOPE.ACTORS, SCOPE.FEEDS];

// A search that found nothing under its tab says so, and offers the other
// tabs that would have something, with how much: the counts the tabs show
// (useScopeCounts). Under All there is nothing to offer: All is the others
// together.
const NothingFound = ({
  term,
  scope,
  counts = {},
  onScope,
}) => {
  const offers = scope === SCOPE.ALL ? [] : NARROW.filter((other) => {
    return other !== scope && counts[other] > 0;
  });

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="body1" sx={{ overflowWrap: 'anywhere' }}>
          {i18n.t('search:nothingFound', { term })}
        </Typography>
      </CardContent>
      {offers.length > 0 &&
        <CardActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          {offers.map((other) => {
            return (
              <Button
                key={other}
                variant="outlined"
                onClick={() => {
                  onScope(other);
                }}
                sx={{ flex: '1 1 0' }}
              >
                {i18n.t('search:foundUnder', {
                  count: counts[other],
                  tab: i18n.t(`search:filterNodeTypes.${other}`),
                })}
              </Button>
            );
          })}
        </CardActions>}
    </Card>
  );
};

NothingFound.propTypes = {
  term: PropTypes.string.isRequired,
  scope: PropTypes.string.isRequired,
  // How many each tab finds.
  counts: PropTypes.objectOf(PropTypes.number),
  onScope: PropTypes.func.isRequired,
};

export default NothingFound;
