import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

import { Medium as MEDIUM } from '../../../../constants';
import MediumType from '../../../../proptypes/Medium';
import i18n from '../../../../languages';

const {
  NAME,
  BODY,
} = MEDIUM.FIELDS;

const ComposersTopic = ({
  handleOnChange,
  handleOnSubmit,
  fields,
  medium,
  isFetching,
  audiencePicker = null,
}) => {
  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <Card>
        <CardContent>
          {fields.name &&
            <TextField
              variant="outlined"
              name="name"
              value={medium.name}
              onChange={handleOnChange}
              label={i18n.t('topics:composer.title')}
              placeholder={i18n.t('topics:composer.titlePlaceholder')}
              error={fields.name.error !== ''}
              helperText={fields.name.error}
              fullWidth
              margin="normal"
              disabled={isFetching}
              required
              slotProps={{
                htmlInput: {
                  maxLength: NAME.MAX_LENGTH,
                  minLength: NAME.MIN_LENGTH,
                },

                inputLabel: {
                  shrink: true,
                },
              }}
            />}
          {fields.body &&
            <TextField
              variant="outlined"
              name="body"
              value={medium.body}
              onChange={handleOnChange}
              label={i18n.t('topics:composer.body')}
              placeholder={i18n.t('topics:composer.bodyPlaceholder')}
              error={fields.body.error !== ''}
              helperText={fields.body.error}
              fullWidth
              multiline
              margin="normal"
              disabled={isFetching}
              minRows={5}
              maxRows={10}
              required
              slotProps={{
                htmlInput: {
                  maxLength: BODY.MAX_LENGTH,
                },

                inputLabel: {
                  shrink: true,
                },
              }}
            />}
        </CardContent>
        <CardActions>
          {audiencePicker}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isFetching}
            fullWidth
          >
            {!isFetching && i18n.t('actions:post')}
            {isFetching && <CircularProgress size={24} />}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

ComposersTopic.propTypes = {
  // The audience button, built by the composer. See ../Audience.
  audiencePicker: PropTypes.node,
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  medium: MediumType.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default ComposersTopic;
