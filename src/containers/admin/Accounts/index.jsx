import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

import AccountsIcon from '@mui/icons-material/ManageAccounts';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import PersonType from '../../../proptypes/Person';

import AccountItem from './AccountItem';
import Filters from './Filters';
import PurgeDialog from './PurgeDialog';
import useAccounts from './useAccounts';

// The accounts list: every person or group, least recently active first,
// with filters for finding the ones nobody uses, and a way to remove the
// ones selected for good.
//
// Super administrators only. The tab is not offered to anybody else, and
// the API refuses them.
//
// What is asked for, what came back and what is selected are
// useAccounts.js's; the filters are drawn by Filters.jsx and each account by
// AccountItem.jsx. This file lays them out in one card, with the row that
// acts on the selection above the list.
const Accounts = ({
  viewer,
  alertError,
}) => {
  const accounts = useAccounts({ viewer, alertError });
  const [showMore, setShowMore] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);

  const {
    kind,
    hasAdmins,
    oneAtATime,
    items,
    total,
    isFetching,
    hasProtected,
    selected,
    selectedAccounts,
    selectable,
    shownSelected,
  } = accounts;

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
        <Filters accounts={accounts} showMore={showMore} onShowMore={setShowMore} />

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
            {!oneAtATime &&
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
                      onChange={accounts.toggleShown}
                    />
                  }
                />
                {total > items.length &&
                  <Button size="small" disabled={isFetching} onClick={accounts.selectMatching}>
                    {total > api.accounts.BATCH_MAX ?
                      i18n.t('accounts:list.selectMatchingCapped', { count: api.accounts.BATCH_MAX }) :
                      i18n.t('accounts:list.selectMatching', { count: total })}
                  </Button>}
                {selectedAccounts.length > 0 &&
                  <Button
                    size="small"
                    onClick={accounts.clearSelection}
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
            </CardContent>}

            <List>
              {items.map((account) => {
                return (
                  <AccountItem
                    key={account.id}
                    account={account}
                    viewer={viewer}
                    hasAdmins={hasAdmins}
                    oneAtATime={oneAtATime}
                    canSelect={accounts.canSelect(account)}
                    isSelected={Boolean(selected[account.id])}
                    onToggle={accounts.toggle}
                  />
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
              onClick={accounts.more}
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
            accounts.restart();
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
