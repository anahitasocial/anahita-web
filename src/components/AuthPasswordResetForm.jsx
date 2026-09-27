import React from 'react';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import HelpIcon from '@mui/icons-material/Help';

import { Password as PASSWORD } from '../constants';
import i18n from '../languages';

const AuthPasswordResetForm = ({
  handleOnChange,
  handleOnSubmit,
  isFetching,
  fields: {
    email,
  },
}) => {
  const { EMAIL } = PASSWORD.FIELDS;
  const enableSubmit = email.isValid;

  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <Card>
        <CardHeader
          avatar={
            <Avatar>
              <HelpIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6">
              {i18n.t('auth:forgotPassword')}
            </Typography>
          }
        />
        <CardContent>
          <TextField
            variant="standard"
            name="email"
            value={email.value}
            onChange={handleOnChange}
            label={i18n.t('auth:passwordResetEmail')}
            error={email.error !== ''}
            helperText={email.error}
            autoFocus
            fullWidth
            margin="normal"
            required
            slotProps={{
              htmlInput: {
                maxLength: EMAIL.MAX_LENGTH,
                minLength: EMAIL.MIN_LENGTH,
              },
            }}
          />
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            disabled={isFetching || !enableSubmit}
            fullWidth
          >
            {i18n.t('auth:actions.resetPassword')}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

AuthPasswordResetForm.propTypes = {
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default AuthPasswordResetForm;
