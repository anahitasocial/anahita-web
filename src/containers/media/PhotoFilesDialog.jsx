import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import PhotoFilesEditor from '../../components/PhotoFilesEditor';
import MediumType from '../../proptypes/Medium';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import photoFiles from '../../utils/photoFiles';

// Why the server refused a list of images, in words.
const refusalText = (error) => {
  const code = error && error.response && error.response.data && error.response.data.error;
  const known = {
    files_required: 'photos:editor.needOne',
    too_many_files: 'photos:editor.tooMany',
    file_not_found: 'photos:editor.gone',
    upload_not_yours: 'photos:editor.gone',
    alt_text_too_long: 'photos:editor.altTooLong',
  };
  return i18n.t(known[code] || 'photos:editor.notSaved');
};

// Changes the images of a photo post that exists: their order, their
// descriptions, and which there are.
//
// Nothing changes on the post until Save. Images added here are uploaded as
// they are picked, like in the composer, but belong to no post until then;
// closing without saving leaves them for the server to clear away.
const PhotoFilesDialog = ({
  medium,
  open,
  onClose,
  maxFiles = photoFiles.DEFAULT_MAX,
  saved,
  alertSuccess,
  alertError,
}) => {
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Each time it is opened it starts from what the post has now.
  useEffect(() => {
    if (open) {
      setItems(photoFiles.fromMedium(medium));
    }
  }, [open, medium.id]);

  const handleSave = () => {
    setIsSaving(true);
    api.photos.editFiles(medium, photoFiles.toRequest(items)).then((result) => {
      saved(result);
      alertSuccess(i18n.t('photos:editor.saved'));
      onClose();
    }).catch((error) => {
      alertError(refusalText(error));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby={`photo-files-title-${medium.id}`}
    >
      <DialogTitle id={`photo-files-title-${medium.id}`}>
        {i18n.t('photos:editor.title')}
      </DialogTitle>
      <DialogContent>
        <PhotoFilesEditor
          owner={medium.owner}
          items={items}
          onChange={setItems}
          max={maxFiles}
          disabled={isSaving}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          {i18n.t('actions:cancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          // Nothing to save until something is different, and nothing
          // sent while an image is still on its way.
          disabled={
            isSaving ||
            !photoFiles.canSubmit(items) ||
            !photoFiles.isChanged(items, medium)
          }
        >
          {!isSaving && i18n.t('actions:save')}
          {isSaving && <CircularProgress size={24} />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PhotoFilesDialog.propTypes = {
  medium: MediumType.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maxFiles: PropTypes.number,
  saved: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    maxFiles: photoFiles.maxFiles(state.app.nodeInfo),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // The post as the server now has it, put back in the store so every
    // list and page showing it draws the new images. Through the action
    // that replaces a post and no more: the one for an edited post also
    // raises the page's own "updated" message, and this says its own.
    saved: (result) => {
      return dispatch({
        type: 'PHOTOS_ACCESS_EDIT_SUCCESS',
        node: result.data,
      });
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PhotoFilesDialog);
