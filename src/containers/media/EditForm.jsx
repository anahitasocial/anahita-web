import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';

import MediumType from '../../proptypes/Medium';
import { Medium as MEDIUM } from '../../constants';

import i18n from '../../languages';

const {
  NAME,
  BODY,
} = MEDIUM.FIELDS;

const MediumFormEdit = (props) => {
  const {
    handleOnChange,
    handleOnSubmit,
    handleCancel,
    fields,
    medium,
    isFetching,
  } = props;

  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <CardContent>
        {fields.name &&
          <TextField
            variant="standard"
            name="name"
            value={medium.name || ''}
            onChange={handleOnChange}
            label={i18n.t('media:medium.title')}
            error={fields.name.error !== ''}
            helperText={fields.name.error}
            autoFocus
            fullWidth
            margin="normal"
            disabled={isFetching}
            required
            slotProps={{
              htmlInput: {
                maxLength: NAME.MAX_LENGTH,
                minLength: NAME.MIN_LENGTH,
              },
            }}
          />}
        {fields.body &&
          <TextField
            variant="standard"
            name="body"
            value={medium.body || ''}
            onChange={handleOnChange}
            label={i18n.t('media:medium.description')}
            error={fields.body.error !== ''}
            helperText={fields.body.error}
            multiline
            fullWidth
            margin="normal"
            disabled={isFetching}
            required
            slotProps={{
              htmlInput: {
                maxLength: BODY.MAX_LENGTH,
              },
            }}
          />}
      </CardContent>
      <CardActions>
        <Button
          disabled={isFetching}
          fullWidth
          onClick={handleCancel}
        >
          {i18n.t('actions:cancel')}
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isFetching}
          fullWidth
        >
          {i18n.t('actions:update')}
        </Button>
      </CardActions>
    </form>
  );
};

MediumFormEdit.propTypes = {
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  medium: MediumType.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default MediumFormEdit;
