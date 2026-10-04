import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AccountsIcon from '@mui/icons-material/ManageAccounts';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import permissions from '../../../permissions';
import PersonType from '../../../proptypes/Person';

import PurgeDialog from './PurgeDialog';

const PAGE_SIZE = 50;
const KINDS = ['person', 'group'];
const TIERS = ['empty', 'dormant', 'active'];
const STATES = ['active', 'disabled', 'archived', 'deleted'];

// A select shows '' as nothing chosen, so "no filter" has a value of its
// own.
const ANY = 'any';

// How long to wait after the last keystroke before searching.
const SEARCH_DELAY_MS = 400;

const PROTECTED_TYPES = ['administrator', 'super-administrator'];

const NO_FILTERS = {
  tier: ANY,
  state: ANY,
  lastActiveBefore: '',
  createdBefore: '',
  onlyUnverified: false,
  onlyNotOnboarded: false,
  onlyWithoutContent: false,
  onlyWithoutAdmin: false,
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

// Where an account's own page is.
const profilePath = (account) => {
  return account.kind === 'group' ?
    `/groups/${account.id}/` :
    `/people/${account.alias}/`;
};

// The accounts list: every person or group, least recently active first,
// with filters for finding the ones nobody uses, and a way to remove the
// ones selected for good.
//
// Super administrators only. The tab is not offered to anybody else, and
// the API refuses them.
//
// The filters are select lists and tick boxes, like the reports list:
// they have to fit a phone. The rarer ones sit behind "More filters".
//
// More accounts are fetched by a "Show more" button that adds to the
// list. Pages would shift under the selection: remove forty accounts and
// everything after them moves up a page.
//
// SELECTION. Kept as the accounts themselves, by id, not as ids alone:
// the confirmation shows how much the selected accounts have written,
// and "select all that match" selects accounts that are not on screen.
// Changing a filter clears it, so nothing is ever selected that the
// filters on screen do not describe. Administrators, super
// administrators and the viewer cannot be selected; the server would
// refuse the whole request for one of them.
const Accounts = ({
  viewer,
  alertError,
}) => {
  const [kind, setKind] = useState('person');
  const [filters, setFilters] = useState(NO_FILTERS);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [showMore, setShowMore] = useState(false);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(true);

  const [selected, setSelected] = useState({});
  const [purgeOpen, setPurgeOpen] = useState(false);

  const isGroup = kind === 'group';

  // The search box filters as it is typed in, once the typing pauses.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(search.trim());
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const query = useCallback((limit, offset) => {
    return api.accounts.browse({
      ...filters,
      kind,
      q,
      tier: filters.tier === ANY ? '' : filters.tier,
      state: filters.state === ANY ? '' : filters.state,
      limit,
      offset,
    });
  }, [kind, q, filters]);

  const fetchPage = useCallback((offset) => {
    setIsFetching(true);

    return query(PAGE_SIZE, offset)
      .then(({ data }) => {
        const page = data.data || [];

        setItems((previous) => {
          return offset === 0 ? page : [...previous, ...page];
        });
        setTotal((data.pagination && data.pagination.total) || 0);
      })
      .catch(() => {
        alertError(i18n.t('accounts:list.loadError'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [query, alertError]);

  // A new question: start the list again, and drop a selection made
  // under the old one.
  useEffect(() => {
    setItems([]);
    setSelected({});
    fetchPage(0);
  }, [fetchPage]);

  const canSelect = (account) => {
    return account.id !== viewer.id &&
      !PROTECTED_TYPES.includes(account.personType) &&
      permissions.account.canBrowse(viewer);
  };

  const selectedAccounts = Object.values(selected);
  const selectable = items.filter(canSelect);
  const shownSelected = selectable.filter((account) => {
    return Boolean(selected[account.id]);
  });
  const hasProtected = items.some((account) => {
    return PROTECTED_TYPES.includes(account.personType);
  });

  const toggle = (account) => {
    setSelected((previous) => {
      const next = { ...previous };
      if (next[account.id]) {
        delete next[account.id];
      } else {
        next[account.id] = account;
      }
      return next;
    });
  };

  const toggleShown = () => {
    setSelected((previous) => {
      const next = { ...previous };
      const all = shownSelected.length === selectable.length;

      selectable.forEach((account) => {
        if (all) {
          delete next[account.id];
        } else {
          next[account.id] = account;
        }
      });

      return next;
    });
  };

  // Everything the filters match, on screen or not, up to as many as one
  // request may remove.
  const selectMatching = () => {
    setIsFetching(true);

    return query(api.accounts.BATCH_MAX, 0)
      .then(({ data }) => {
        const next = {};
        (data.data || []).filter(canSelect).forEach((account) => {
          next[account.id] = account;
        });
        setSelected(next);
      })
      .catch(() => {
        alertError(i18n.t('accounts:list.loadError'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  const setFilter = (name, value) => {
    setFilters((previous) => {
      return { ...previous, [name]: value };
    });
  };

  const changeKind = (value) => {
    setKind(value);
    // The filters that mean nothing for the other kind are let go.
    setFilters((previous) => {
      return {
        ...previous,
        onlyUnverified: false,
        onlyNotOnboarded: false,
        onlyWithoutAdmin: false,
      };
    });
  };

  const filtered = q !== '' || Object.keys(NO_FILTERS).some((name) => {
    return filters[name] !== NO_FILTERS[name];
  });

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

  const roleLabel = (account) => {
    if (account.id === viewer.id) {
      return i18n.t('accounts:list.you');
    }
    if (account.personType === 'super-administrator') {
      return i18n.t('accounts:list.superAdministrator');
    }
    if (account.personType === 'administrator') {
      return i18n.t('accounts:list.administrator');
    }
    return '';
  };

  return (
    <>
      <Card>
        <CardHeader
          avatar={
            <Avatar>
              <AccountsIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6">
              {i18n.t('accounts:cTitle')}
            </Typography>
          }
          subheader={i18n.t('accounts:cDescription')}
        />
        <Divider />
        <CardContent>
          {/* Side by side where there is room, stacked on a phone. */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <TextField
              select
              size="small"
              name="kind"
              label={i18n.t('accounts:filters.kind')}
              value={kind}
              onChange={(event) => {
                changeKind(event.target.value);
              }}
              fullWidth
            >
              {KINDS.map((value) => {
                return (
                  <MenuItem key={value} value={value}>
                    {i18n.t(`accounts:kinds.${value}`)}
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              select
              size="small"
              name="tier"
              label={i18n.t('accounts:filters.tier')}
              value={filters.tier}
              onChange={(event) => {
                setFilter('tier', event.target.value);
              }}
              fullWidth
            >
              <MenuItem value={ANY}>
                {i18n.t('accounts:filters.anyTier')}
              </MenuItem>
              {TIERS.map((value) => {
                return (
                  <MenuItem key={value} value={value}>
                    {i18n.t(`accounts:tiers.${value}`)}
                  </MenuItem>
                );
              })}
            </TextField>
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
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  mt: 2,
                }}
              >
                <TextField
                  select
                  size="small"
                  name="state"
                  label={i18n.t('accounts:filters.state')}
                  value={filters.state}
                  onChange={(event) => {
                    setFilter('state', event.target.value);
                  }}
                  fullWidth
                >
                  <MenuItem value={ANY}>
                    {i18n.t('accounts:filters.anyState')}
                  </MenuItem>
                  {STATES.map((value) => {
                    return (
                      <MenuItem key={value} value={value}>
                        {i18n.t(`accounts:states.${value}`)}
                      </MenuItem>
                    );
                  })}
                </TextField>
                {/* A date field's label has to stay raised: the browser
                    shows its own placeholder where the label would rest. */}
                <TextField
                  size="small"
                  type="date"
                  name="lastActiveBefore"
                  label={i18n.t('accounts:filters.lastActiveBefore')}
                  value={filters.lastActiveBefore}
                  onChange={(event) => {
                    setFilter('lastActiveBefore', event.target.value);
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="date"
                  name="createdBefore"
                  label={i18n.t('accounts:filters.createdBefore')}
                  value={filters.createdBefore}
                  onChange={(event) => {
                    setFilter('createdBefore', event.target.value);
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                {tick('onlyWithoutContent', i18n.t(isGroup ?
                  'accounts:filters.onlyWithoutContentGroup' :
                  'accounts:filters.onlyWithoutContent'))}
                {!isGroup && tick('onlyUnverified', i18n.t('accounts:filters.onlyUnverified'))}
                {!isGroup && tick('onlyNotOnboarded', i18n.t('accounts:filters.onlyNotOnboarded'))}
                {isGroup && tick('onlyWithoutAdmin', i18n.t('accounts:filters.onlyWithoutAdmin'))}
              </Box>
            </>}
        </CardContent>
        <CardActions>
          <Button
            size="small"
            onClick={() => {
              setShowMore(!showMore);
            }}
          >
            {showMore ?
              i18n.t('accounts:filters.fewer') :
              i18n.t('accounts:filters.more')}
          </Button>
          {filtered &&
            <Button
              size="small"
              onClick={() => {
                setFilters(NO_FILTERS);
                setSearch('');
              }}
            >
              {i18n.t('accounts:filters.clear')}
            </Button>}
        </CardActions>

        {isFetching && <LinearProgress />}
        <Divider />

        {!isFetching && items.length === 0 &&
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('accounts:list.empty')}
            </Typography>
          </CardContent>}

        {items.length > 0 &&
          <>
            {/* What is selected, and the one thing to do with it. Above
                the list, so it is in reach without scrolling past
                hundreds of rows. */}
            <CardContent sx={{ pb: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <FormControlLabel
                  label={
                    <Typography variant="body2">
                      {selectedAccounts.length > 0 ?
                        i18n.t('accounts:list.selected', { count: selectedAccounts.length }) :
                        i18n.t('accounts:list.selectShown')}
                    </Typography>
                  }
                  control={
                    <Checkbox
                      size="small"
                      disabled={selectable.length === 0}
                      checked={selectable.length > 0 && shownSelected.length === selectable.length}
                      indeterminate={shownSelected.length > 0 &&
                        shownSelected.length < selectable.length}
                      onChange={toggleShown}
                    />
                  }
                />
                {total > items.length &&
                  <Button size="small" disabled={isFetching} onClick={selectMatching}>
                    {total > api.accounts.BATCH_MAX ?
                      i18n.t('accounts:list.selectMatchingCapped', { count: api.accounts.BATCH_MAX }) :
                      i18n.t('accounts:list.selectMatching', { count: total })}
                  </Button>}
                {selectedAccounts.length > 0 &&
                  <Button
                    size="small"
                    onClick={() => {
                      setSelected({});
                    }}
                  >
                    {i18n.t('accounts:list.clearSelection')}
                  </Button>}
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  size="small"
                  color="secondary"
                  variant="contained"
                  disabled={selectedAccounts.length === 0}
                  onClick={() => {
                    setPurgeOpen(true);
                  }}
                >
                  {i18n.t('accounts:list.purge')}
                </Button>
              </Box>
              {hasProtected &&
                <Typography variant="caption" color="textSecondary" component="p">
                  {i18n.t('accounts:list.protected')}
                </Typography>}
            </CardContent>

            <List>
              {items.map((account) => {
                const role = roleLabel(account);

                return (
                  <ListItem key={account.id} divider alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        edge="start"
                        size="small"
                        disabled={!canSelect(account)}
                        checked={Boolean(selected[account.id])}
                        onChange={() => {
                          toggle(account);
                        }}
                        slotProps={{
                          input: {
                            'aria-label': i18n.t('accounts:list.select', {
                              name: account.name || account.alias,
                            }),
                          },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography variant="subtitle1">
                          <MuiLink
                            component={Link}
                            to={profilePath(account)}
                            underline="hover"
                            color="inherit"
                          >
                            {account.name || account.alias}
                          </MuiLink>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textSecondary"
                          >
                            {` @${account.alias}`}
                          </Typography>
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary">
                            {i18n.t('accounts:list.lastActive', {
                              date: formatDate(account.lastActiveAt),
                            })}
                            {` · ${i18n.t('accounts:list.created', {
                              date: formatDate(account.createdAt),
                            })}`}
                            {` · ${i18n.t(isGroup ? 'accounts:list.contentGroup' : 'accounts:list.content', {
                              count: account.contentCount,
                            })}`}
                            {` · ${i18n.t(isGroup ? 'accounts:list.members' : 'accounts:list.followers', {
                              count: account.followerCount,
                            })}`}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                              label={i18n.t(`accounts:tiers.${account.tier}`)}
                            />
                            {account.state !== 'active' &&
                              <Chip
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                                label={i18n.t(`accounts:states.${account.state}`)}
                              />}
                            {role &&
                              <Chip
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                                label={role}
                              />}
                            {account.emailVerified === false &&
                              <Chip
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                                label={i18n.t('accounts:list.unverified')}
                              />}
                            {account.onboarded === false &&
                              <Chip
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                                label={i18n.t('accounts:list.notOnboarded')}
                              />}
                            {/* A group nobody runs. Its settings are where
                                an administrator is appointed. */}
                            {account.adminCount === 0 &&
                              <Chip
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                                label={`${i18n.t('accounts:list.noAdmin')} · ${i18n.t('accounts:list.appointAdmin')}`}
                                component={Link}
                                to={`/groups/${account.id}/settings`}
                                clickable
                              />}
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>

            {/* How much of the list is on screen, so its size is known
                without reaching its end. */}
            <CardContent>
              <Typography variant="caption" color="textSecondary">
                {i18n.t('accounts:list.showing', {
                  shown: items.length,
                  total: Math.max(total, items.length),
                })}
              </Typography>
            </CardContent>
          </>}

        {items.length < total &&
          <CardActions>
            <Button
              fullWidth
              disabled={isFetching}
              onClick={() => {
                fetchPage(items.length);
              }}
            >
              {i18n.t('accounts:list.more')}
            </Button>
          </CardActions>}
      </Card>

      <PurgeDialog
        open={purgeOpen}
        kind={kind}
        accounts={selectedAccounts}
        onClose={(asked) => {
          setPurgeOpen(false);

          // Something was removed, or already had been: the list on
          // screen is out of date either way.
          if (asked) {
            setItems([]);
            setSelected({});
            fetchPage(0);
          }
        }}
      />
    </>
  );
};

Accounts.propTypes = {
  viewer: PersonType.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { viewer } = state.session;
  return { viewer };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Accounts);
