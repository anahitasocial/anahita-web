import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import StepUp from '../../auth/StepUp';
import useStepUp from '../../settings/useStepUp';
import api from '../../../api';
import i18n from '../../../languages';

// The strings for each type a person may be given, with what each may do.
const LABELS = {
  registered: 'registered',
  administrator: 'administrator',
  'super-administrator': 'superAdministrator',
};

// Changes a person's account type (the user, 2026-10-18), offering only the
// choices the viewer may make (permissions.account.personTypesFor): an
// administrator makes administrators of registered people, a super
// administrator anything. Never offered for the viewer's own: the server
// refuses it, which is what keeps the last super administrator. Opened from
// the Account type card in Administration (AccountType.jsx), its one place.
//
// The proof of who is asking is asked for when the server wants it, as on
// the Privacy page, and the change is tried again once it is given.
const AccountTypeDialog = ({
  account = null,
  choices = [],
  onClose,
  onChanged,
}) => {
  const [personType, setPersonType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    stepUpOpen,
    runGuarded,
    onVerified,
    onCancel,
  } = useStepUp();

  // A fresh choice each time it opens, starting from the type they have.
  useEffect(() => {
    if (account) {
      setPersonType(account.personType || 'registered');
      setSubmitting(false);
      setError('');
    }
  }, [account]);

  if (!account) {
    return null;
  }

  const name = account.name || account.alias;
  const unchanged = personType === account.personType;

  const save = () => {
    setSubmitting(true);
    setError('');

    return runGuarded(
      () => {
        return api.accounts.editPersonType(account.id, personType).then(() => {
          onChanged(account, personType);
        });
      },
      (err) => {
        const body = (err && err.response && err.response.data) || {};
        const messages = {
          own_person_type: 'own',
          person_type_not_allowed: 'notAllowed',
        };
        setError(i18n.t(`people:accountType.errors.${messages[body.error] || 'generic'}`));
      },
    ).finally(() => {
      setSubmitting(false);
    });
  };

  return (
    <>
      <Dialog
        open={Boolean(account) && !stepUpOpen}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        aria-labelledby="person-type-title"
      >
        <DialogTitle id="person-type-title">
          {i18n.t('people:accountType.title', { name })}
        </DialogTitle>
        <DialogContent>
          <RadioGroup
            aria-labelledby="person-type-title"
            name="person_type"
            value={personType}
            onChange={(event) => {
              setPersonType(event.target.value);
              setError('');
            }}
          >
            {choices.map((value) => {
              const label = LABELS[value];
              return (
                <FormControlLabel
                  key={value}
                  value={value}
                  disabled={submitting}
                  sx={{ alignItems: 'flex-start', mb: 1 }}
                  control={<Radio sx={{ pt: 0 }} />}
                  label={
                    <>
                      <Typography variant="body1">
                        {i18n.t(`people:accountType.${label}`)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t(`people:accountType.${label}Help`)}
                      </Typography>
                    </>
                  }
                />
              );
            })}
          </RadioGroup>
          <DialogContentText variant="body2" sx={{ mt: 1 }}>
            {i18n.t('people:accountType.when')}
          </DialogContentText>
          <FormHelperText error>
            {error || ' '}
          </FormHelperText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button fullWidth onClick={onClose} disabled={submitting}>
              {i18n.t('people:accountType.cancel')}
            </Button>
            <Button
              fullWidth
              onClick={save}
              color="primary"
              variant="contained"
              disabled={submitting || unchanged}
            >
              {i18n.t('people:accountType.save')}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <StepUp
        open={stepUpOpen}
        onVerified={onVerified}
        onCancel={onCancel}
      />
    </>
  );
};

AccountTypeDialog.propTypes = {
  // The person whose type is being changed, or null when closed.
  account: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    alias: PropTypes.string,
    personType: PropTypes.string,
  }),
  // The types offered, the one they have among them.
  choices: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
  // Called with the account and its new type once the server has it.
  onChanged: PropTypes.func.isRequired,
};

export default AccountTypeDialog;
