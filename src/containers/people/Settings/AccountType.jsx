import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import AccountTypeIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

import AccountTypeDialog from './AccountTypeDialog';
import actions from '../../../actions';
import permissions from '../../../permissions';
import PersonType from '../../../proptypes/Person';
import i18n from '../../../languages';

// The strings for each account type.
const LABELS = {
  registered: 'registered',
  administrator: 'administrator',
  'super-administrator': 'superAdministrator',
};

// A person's account type, in Administration (the user, 2026-10-18):
// registered, administrator or super administrator, and Change, for what
// the viewer may make it (permissions.account.personTypesFor). An
// administrator makes administrators of registered people; the rest is a
// super administrator's. The section is never shown on the viewer's own
// settings, and nobody changes their own type.
const AccountType = ({
  person,
  viewer,
  alertSuccess,
}) => {
  const [personType, setPersonType] = useState(person.personType || 'registered');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPersonType(person.personType || 'registered');
  }, [person]);

  const current = { ...person, personType };
  const choices = permissions.account.personTypesFor(viewer, current);
  const label = LABELS[personType] || LABELS.registered;

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <AccountTypeIcon />
          </Avatar>
        }
        title={
          <Typography variant="h5">
            {i18n.t('people:accountType.cTitle')}
          </Typography>
        }
      />
      <Divider />
      <CardContent>
        <Typography variant="body1">
          {i18n.t(`people:accountType.${label}`)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {i18n.t(`people:accountType.${label}Help`)}
        </Typography>
        {choices.length === 0 &&
          <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
            {i18n.t('people:accountType.notYours')}
          </Typography>}
      </CardContent>
      {choices.length > 0 &&
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={() => {
              setOpen(true);
            }}
            color="primary"
            variant="outlined"
          >
            {i18n.t('people:accountType.action')}
          </Button>
        </CardActions>}
      <AccountTypeDialog
        account={open ? current : null}
        choices={choices}
        onClose={() => {
          setOpen(false);
        }}
        onChanged={(changed, newType) => {
          setOpen(false);
          setPersonType(newType);
          alertSuccess(i18n.t('people:accountType.done', {
            name: person.name || person.alias,
          }));
        }}
      />
    </Card>
  );
};

AccountType.propTypes = {
  person: PersonType.isRequired,
  viewer: PersonType.isRequired,
  alertSuccess: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountType);
