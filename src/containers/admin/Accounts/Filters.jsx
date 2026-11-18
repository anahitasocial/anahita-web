import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import i18n from '../../../languages';
import { ANY } from './useAccounts';

// Events too (the user, 2026-10-18), so a super administrator can find a
// deleted one, which no other list shows them.
const KINDS = ['person', 'group', 'event', 'channel'];
const TIERS = ['empty', 'dormant', 'active'];
const STATES = ['active', 'disabled', 'archived', 'deleted'];

// Side by side where there is room, stacked on a mobile.
const ROW = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
};

// One select list of the filters: its values, each named in `accounts:`
// under `group`, after an "any" of its own when the filter may be left off.
const Choice = ({
  name,
  label,
  value,
  values,
  group,
  any = '',
  onChange,
}) => {
  return (
    <TextField
      select
      size="small"
      name={name}
      label={label}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      fullWidth
    >
      {any ?
        <MenuItem value={ANY}>
          {any}
        </MenuItem> : null}
      {values.map((each) => {
        return (
          <MenuItem key={each} value={each}>
            {i18n.t(`accounts:${group}.${each}`)}
          </MenuItem>
        );
      })}
    </TextField>
  );
};

Choice.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
  group: PropTypes.string.isRequired,
  any: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

// The filters of the accounts list, at the head of its card: select lists
// and tick boxes, like the reports list, since they have to fit a mobile.
// The rarer ones sit behind "More filters". What they hold, and what
// changing one does, is useAccounts.js's.
const Filters = ({
  accounts,
  showMore,
  onShowMore,
}) => {
  const {
    kind,
    changeKind,
    filters,
    setFilter,
    search,
    setSearch,
    filtered,
    clearFilters,
    hasAdmins,
  } = accounts;

  const tick = (name, label) => {
    return (
      <FormControlLabel
        key={name}
        label={<Typography variant="body2">{label}</Typography>}
        control={
          <Checkbox
            size="small"
            name={name}
            checked={filters[name]}
            onChange={(event) => {
              setFilter(name, event.target.checked);
            }}
          />
        }
      />
    );
  };

  // A date field's label has to stay raised: the browser shows its own
  // placeholder where the label would rest.
  const date = (name) => {
    return (
      <TextField
        size="small"
        type="date"
        name={name}
        label={i18n.t(`accounts:filters.${name}`)}
        value={filters[name]}
        onChange={(event) => {
          setFilter(name, event.target.value);
        }}
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth
      />
    );
  };

  return (
    <>
      <CardContent>
        <Box sx={ROW}>
          <Choice
            name="kind"
            label={i18n.t('accounts:filters.kind')}
            value={kind}
            values={KINDS}
            group="kinds"
            onChange={changeKind}
          />
          <Choice
            name="tier"
            label={i18n.t('accounts:filters.tier')}
            value={filters.tier}
            values={TIERS}
            group="tiers"
            any={i18n.t('accounts:filters.anyTier')}
            onChange={(value) => {
              setFilter('tier', value);
            }}
          />
          <TextField
            size="small"
            name="search"
            type="search"
            label={i18n.t('accounts:filters.search')}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            fullWidth
          />
        </Box>
        <Typography
          variant="caption"
          color="textSecondary"
          component="p"
          sx={{ mt: 1 }}
        >
          {i18n.t(`accounts:tierHelp.${kind}`)}
        </Typography>

        {showMore &&
          <>
            <Box sx={{ ...ROW, mt: 2 }}>
              <Choice
                name="state"
                label={i18n.t('accounts:filters.state')}
                value={filters.state}
                values={STATES}
                group="states"
                any={i18n.t('accounts:filters.anyState')}
                onChange={(value) => {
                  setFilter('state', value);
                }}
              />
              {date('lastActiveBefore')}
              {date('createdBefore')}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
              {tick('onlyWithoutContent', i18n.t(hasAdmins ?
                'accounts:filters.onlyWithoutContentGroup' :
                'accounts:filters.onlyWithoutContent'))}
              {!hasAdmins && tick('onlyUnverified', i18n.t('accounts:filters.onlyUnverified'))}
              {!hasAdmins && tick('onlyNotOnboarded', i18n.t('accounts:filters.onlyNotOnboarded'))}
              {hasAdmins && tick('onlyWithoutAdmin', i18n.t('accounts:filters.onlyWithoutAdmin'))}
            </Box>
          </>}
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          size="small"
          onClick={() => {
            onShowMore(!showMore);
          }}
        >
          {showMore ?
            i18n.t('accounts:filters.fewer') :
            i18n.t('accounts:filters.more')}
        </Button>
        {filtered &&
          <Button
            fullWidth
            size="small"
            onClick={clearFilters}
          >
            {i18n.t('accounts:filters.clear')}
          </Button>}
      </CardActions>
    </>
  );
};

Filters.propTypes = {
  // What useAccounts gives.
  accounts: PropTypes.object.isRequired,
  // Whether the rarer filters are shown.
  showMore: PropTypes.bool.isRequired,
  onShowMore: PropTypes.func.isRequired,
};

export default Filters;
