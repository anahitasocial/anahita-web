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
  EXCERPT,
} = MEDIUM.FIELDS;

const ComposersArticle = ({
  handleOnChange,
  handleOnSubmit,
  fields,
  medium,
  isFetching,
}) => {
  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <Card square>
        <CardContent>
          {fields.name &&
            <TextField
              variant="outlined"
              name="name"
              value={medium.name}
              onChange={handleOnChange}
              label={i18n.t('articles:composer.title')}
              placeholder={i18n.t('articles:composer.titlePlaceholder')}
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
              label={i18n.t('articles:composer.body')}
              placeholder={i18n.t('articles:composer.bodyPlaceholder')}
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
          {fields.excerpt &&
            <TextField
              variant="outlined"
              name="excerpt"
              value={medium.excerpt}
              onChange={handleOnChange}
              label={i18n.t('articles:composer.excerpt')}
              placeholder={i18n.t('articles:composer.excerptPlaceholder')}
              error={fields.excerpt.error !== ''}
              helperText={fields.excerpt.error}
              fullWidth
              multiline
              margin="normal"
              disabled={isFetching}
              slotProps={{
                htmlInput: {
                  maxLength: EXCERPT.MAX_LENGTH,
                },

                inputLabel: {
                  shrink: true,
                },
              }}
            />}
        </CardContent>
        <CardActions>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isFetching}
            fullWidth
          >
            {!isFetching && i18n.t('actions:publish')}
            {isFetching && <CircularProgress size={24} />}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

ComposersArticle.propTypes = {
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  medium: MediumType.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default ComposersArticle;
