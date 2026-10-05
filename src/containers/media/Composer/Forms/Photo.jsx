import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

import PhotoFilesEditor from '../../../../components/PhotoFilesEditor';
import photoFiles from '../../../../utils/photoFiles';
import ActorType from '../../../../proptypes/Actor';
import { Medium as MEDIUM } from '../../../../constants';
import MediumType from '../../../../proptypes/Medium';
import i18n from '../../../../languages';

const {
  NAME,
  BODY,
} = MEDIUM.FIELDS;

// The composer for a photo post: up to a few images, put in order and each
// described, then a title and a caption.
const ComposersPhoto = ({
  actor,
  handleOnChange,
  handleOnSubmit,
  supportedMimetypes,
  fields,
  medium,
  photoItems,
  onPhotoItemsChange,
  maxFiles = photoFiles.DEFAULT_MAX,
  isFetching,
  namespace,
  postOptions = null,
}) => {
  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <Card>
        <CardContent>
          <PhotoFilesEditor
            owner={actor}
            items={photoItems}
            onChange={onPhotoItemsChange}
            max={maxFiles}
            supportedMimetypes={supportedMimetypes}
            disabled={isFetching}
          />
          {fields.name &&
            <TextField
              variant="outlined"
              name="name"
              value={medium.name}
              onChange={handleOnChange}
              label={i18n.t(`${namespace}:composer.name`)}
              placeholder={i18n.t(`${namespace}:composer.namePlaceholder`)}
              error={fields.name.error !== ''}
              helperText={fields.name.error}
              fullWidth
              margin="normal"
              disabled={isFetching}
              required
              slotProps={{
                htmlInput: {
                  dir: 'auto',
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
              label={i18n.t(`${namespace}:composer.body`)}
              placeholder={i18n.t(`${namespace}:composer.bodyPlaceholder`)}
              error={fields.body.error !== ''}
              helperText={fields.body.error}
              fullWidth
              margin="normal"
              disabled={isFetching}
              required
              slotProps={{
                htmlInput: {
                  dir: 'auto',
                  maxLength: BODY.MAX_LENGTH,
                },

                inputLabel: {
                  shrink: true,
                },
              }}
            />}
        </CardContent>
        <CardActions>
          {postOptions}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            // Held back until every image picked has been stored, so a
            // post is never made with fewer than it shows.
            disabled={isFetching || !photoFiles.canSubmit(photoItems)}
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

ComposersPhoto.propTypes = {
  // The audience and language buttons, built by the composer.
  postOptions: PropTypes.node,
  actor: ActorType.isRequired,
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  medium: MediumType.isRequired,
  // The images picked so far, and the setter for them.
  photoItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  onPhotoItemsChange: PropTypes.func.isRequired,
  maxFiles: PropTypes.number,
  isFetching: PropTypes.bool.isRequired,
  supportedMimetypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  namespace: PropTypes.string.isRequired,
};

export default ComposersPhoto;
