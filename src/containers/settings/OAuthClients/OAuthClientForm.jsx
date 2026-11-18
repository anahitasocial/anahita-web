import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';

import i18n from '../../../languages';
import OAuthClientType from '../../../proptypes/OAuthClient';
import useOAuthClientForm from './useOAuthClientForm';

// The client_id slug, as the database CHECK constraint spells it. Kept
// on the input as a `pattern` so the browser refuses it before the
// round trip — a violation server-side is a bare 400 with nothing in
// the body to say which field was wrong.
const CLIENT_ID_PATTERN = '[a-z0-9][a-z0-9_-]{1,63}';

const useStyles = makeStyles()((theme) => {
  return {
    field: {
      marginBottom: theme.spacing(2),
    },
    section: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
      marginBottom: theme.spacing(1),
    },
    chip: {
      marginRight: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
      cursor: 'pointer',
    },
    mono: {
      fontFamily: 'monospace',
    },
  };
});

// A line under a field, in the caption's small type: what a switch means,
// or why the form will not be sent.
const Caption = ({ color = 'textSecondary', children }) => {
  return (
    <Typography
      variant="caption"
      color={color}
      gutterBottom
      sx={{ display: 'block' }}
    >
      {children}
    </Typography>
  );
};

Caption.propTypes = {
  color: PropTypes.string,
  children: PropTypes.node.isRequired,
};

// A heading, then a chip for each value that may be chosen, filled when it
// is: the grant types and the scopes. Under them, why none chosen will not
// do.
const ChipChoices = ({
  label,
  values,
  chosen,
  onToggle,
  missing,
  size = 'medium',
}) => {
  const { classes } = useStyles();

  return (
    <>
      <Typography variant="subtitle2" className={classes.section}>
        {label}
      </Typography>
      <Box className={classes.chips}>
        {values.map((value) => {
          const selected = chosen.includes(value);
          return (
            <Chip
              key={value}
              label={value}
              size={size}
              className={classes.chip}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'default' : 'outlined'}
              onClick={() => {
                return onToggle(value);
              }}
            />
          );
        })}
      </Box>
      {missing &&
        <Caption color="error">
          {missing}
        </Caption>}
    </>
  );
};

ChipChoices.propTypes = {
  label: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
  chosen: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
  // Why the form will not be sent with none chosen, or '' while some are.
  missing: PropTypes.string.isRequired,
  size: PropTypes.string,
};

// A switch with its label, and what it means under it.
const SwitchField = ({
  label,
  hint = '',
  checked,
  onChange,
}) => {
  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            color="primary"
            onChange={(event) => {
              onChange(event.target.checked);
            }}
          />
        }
        label={label}
      />
      {hint &&
        <Caption>
          {hint}
        </Caption>}
    </>
  );
};

SwitchField.propTypes = {
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

// Registering an OAuth client, or changing one, in a dialog. What the form
// holds and sends is useOAuthClientForm.js's.
const OAuthClientForm = ({
  open,
  client = null,
  onClose,
  onSave,
}) => {
  const { classes } = useStyles();
  const {
    isEdit,
    fields,
    handleChange,
    handleSubmit,
    submitting,
    grantTypes,
    availableGrantTypes,
    grantTypesMissing,
    toggleGrantType,
    scopes,
    availableScopes,
    scopesMissing,
    toggleScope,
    confidential,
    setConfidential,
    skipConsent,
    setSkipConsent,
    active,
    setActive,
  } = useOAuthClientForm({ open, client, onSave });

  const {
    clientId,
    name,
    redirectUris,
    tokenExpiry,
  } = fields;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>
          {isEdit ?
            i18n.t('settings:oauthClients.form.editTitle') :
            i18n.t('settings:oauthClients.form.addTitle')}
        </DialogTitle>
        <DialogContent>
          {/* Immutable once set: rotating a client's identifier would
              orphan every authorization and token issued under it, so
              the server has no route for it. Shown, not offered. */}
          {isEdit ?
            <Box className={classes.field}>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block' }}
              >
                {i18n.t('settings:oauthClients.fields.clientId')}
              </Typography>
              <Typography className={classes.mono}>
                {client.clientId}
              </Typography>
            </Box> :
            <TextField
              variant="standard"
              className={classes.field}
              name="clientId"
              label={i18n.t('settings:oauthClients.fields.clientId')}
              value={clientId.value}
              onChange={handleChange}
              error={Boolean(clientId.error)}
              helperText={clientId.error || i18n.t('settings:oauthClients.form.clientIdHint')}
              fullWidth
              required
              slotProps={{
                htmlInput: {
                  minLength: 2,
                  maxLength: 64,
                  pattern: CLIENT_ID_PATTERN,
                  autoCapitalize: 'none',
                  autoCorrect: 'off',
                  spellCheck: 'false',
                },
              }}
            />}

          <TextField
            variant="standard"
            className={classes.field}
            name="name"
            label={i18n.t('settings:oauthClients.fields.name')}
            value={name.value}
            onChange={handleChange}
            error={Boolean(name.error)}
            helperText={name.error || i18n.t('settings:oauthClients.form.nameHint')}
            fullWidth
            required
            slotProps={{
              htmlInput: { minLength: 3, maxLength: 128 },
            }}
          />

          <TextField
            variant="standard"
            className={classes.field}
            name="redirectUris"
            label={i18n.t('settings:oauthClients.fields.redirectUris')}
            value={redirectUris.value}
            onChange={handleChange}
            error={Boolean(redirectUris.error)}
            helperText={redirectUris.error || i18n.t('settings:oauthClients.form.redirectUrisHint')}
            fullWidth
            required
            multiline
            minRows={2}
          />

          <ChipChoices
            label={i18n.t('settings:oauthClients.fields.grantTypes')}
            values={availableGrantTypes}
            chosen={grantTypes}
            onToggle={toggleGrantType}
            missing={grantTypesMissing ? i18n.t('settings:oauthClients.form.grantTypesRequired') : ''}
          />

          <ChipChoices
            label={i18n.t('settings:oauthClients.fields.scopes')}
            values={availableScopes}
            chosen={scopes}
            onToggle={toggleScope}
            missing={scopesMissing ? i18n.t('settings:oauthClients.form.scopesRequired') : ''}
            size="small"
          />
          {availableScopes.length === 0 &&
            <Caption>
              {i18n.t('settings:oauthClients.form.scopesUnavailable')}
            </Caption>}

          <TextField
            variant="standard"
            className={classes.field}
            name="tokenExpiry"
            label={i18n.t('settings:oauthClients.fields.tokenExpiry')}
            type="number"
            value={tokenExpiry.value}
            onChange={handleChange}
            error={Boolean(tokenExpiry.error)}
            helperText={tokenExpiry.error || i18n.t('settings:oauthClients.form.tokenExpiryHint')}
            fullWidth
            slotProps={{
              htmlInput: { min: 300, max: 86400 },
            }}
          />

          <SwitchField
            label={i18n.t('settings:oauthClients.fields.confidential')}
            hint={i18n.t('settings:oauthClients.form.confidentialHint')}
            checked={confidential}
            onChange={setConfidential}
          />
          <SwitchField
            label={i18n.t('settings:oauthClients.fields.skipConsent')}
            hint={i18n.t('settings:oauthClients.form.skipConsentHint')}
            checked={skipConsent}
            onChange={setSkipConsent}
          />
          <SwitchField
            label={i18n.t('settings:oauthClients.fields.active')}
            checked={active}
            onChange={setActive}
          />
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={onClose} disabled={submitting}>
            {i18n.t('actions:cancel')}
          </Button>
          <Button
            fullWidth
            type="submit"
            color="primary"
            variant="contained"
            disabled={submitting}
          >
            {isEdit ?
              i18n.t('settings:oauthClients.actions.save') :
              i18n.t('settings:oauthClients.actions.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

OAuthClientForm.propTypes = {
  open: PropTypes.bool.isRequired,
  client: OAuthClientType,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default OAuthClientForm;
