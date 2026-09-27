import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import LoginIcon from '@mui/icons-material/Person';

import i18n from '../../../languages';
import { Totp as TOTP } from '../../../constants';

const TotpForm = (props) => {
  const {
    handleOnChange,
    handleOnSubmit,
    fields: {
      passcode,
    },
    isFetching,
  } = props;

  const enableSubmit = passcode.isValid;

  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <Card variant="outlined">
        <CardHeader
          avatar={
            <Avatar>
              <LoginIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6">
              {i18n.t('auth:totp.verify.cTitle')}
            </Typography>
          }
        />
        <CardContent>
          <Typography variant="body1">
            {i18n.t('auth:totp.verify.cDesc')}
          </Typography>
          <TextField
            variant="standard"
            autoFocus
            name="passcode"
            value={passcode.value}
            onChange={handleOnChange}
            label={i18n.t('auth:totp.verify.passcode')}
            fullWidth
            margin="normal"
            error={passcode.error !== ''}
            helperText={passcode.error}
            required
            slotProps={{
              htmlInput: {
                maxLength: TOTP.FIELDS.PASSCODE.MAX_LENGTH,
                minLength: TOTP.FIELDS.PASSCODE.MIN_LENGTH,
              },
            }}
          />
        </CardContent>
        <CardActions>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isFetching || !enableSubmit}
            fullWidth
          >
            {i18n.t('actions:login')}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

TotpForm.propTypes = {
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default TotpForm;
