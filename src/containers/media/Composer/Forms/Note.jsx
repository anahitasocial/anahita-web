import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

import ActorType from '../../../../proptypes/Actor';
import PersonType from '../../../../proptypes/Person';
import { Medium as MEDIUM } from '../../../../constants';
import MediumType from '../../../../proptypes/Medium';

import utils from '../../../../utils';
import i18n from '../../../../languages';

const { BODY } = MEDIUM.FIELDS;
const { isPerson } = utils.node;

const ComposersNote = ({
  handleOnChange,
  handleOnSubmit,
  fields: {
    body,
  },
  medium,
  viewer,
  actor,
  isFetching,
  postOptions = null,
}) => {
  const placeholder = isPerson(actor) && actor.id !== viewer.id ? i18n.t('notes:composer.bodyPlaceholderPerson', {
    name: actor.name,
  }) : i18n.t('notes:composer.bodyPlaceholder');

  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <Card>
        <CardContent>
          <TextField
            autoFocus
            name="body"
            value={medium.body}
            onChange={handleOnChange}
            error={body.error !== ''}
            helperText={body.error}
            multiline
            fullWidth
            margin="normal"
            variant="outlined"
            disabled={isFetching}
            placeholder={placeholder}
            required
            slotProps={{
              htmlInput: {
                dir: 'auto',
                maxLength: BODY.MAX_LENGTH,
              },
            }}
          />
        </CardContent>
        <CardActions>
          {postOptions}
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

ComposersNote.propTypes = {
  // The audience and language buttons, built by the composer.
  postOptions: PropTypes.node,
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  viewer: PersonType.isRequired,
  actor: ActorType.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  medium: MediumType.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default ComposersNote;
