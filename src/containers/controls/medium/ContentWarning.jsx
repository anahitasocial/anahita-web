import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ContentWarningDialog from '../../../components/ContentWarningDialog';
import actions from '../../../actions';
import api from '../../../api';
import MediumType from '../../../proptypes/Medium';
import i18n from '../../../languages';
import utils from '../../../utils';
import warnings from '../../../utils/warnings';

// The content warning of a post that exists (anahita-services row 122),
// changed in a dialog and saved from it. Opened from the post's menu, which
// owns whether it is open.
const ControlsMediumContentWarning = ({
  medium,
  open,
  onClose,
  read,
  alertSuccess,
  alertError,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (warning) => {
    setIsSaving(true);
    api.warnings.edit(medium, warning).then(() => {
      // Read again, so every place showing the post has it.
      return read(medium);
    }).then(() => {
      alertSuccess(i18n.t('warnings:saved'));
      onClose();
    }).catch(() => {
      alertError(i18n.t('warnings:notSaved'));
    })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <ContentWarningDialog
      open={open}
      value={warnings.of(medium)}
      onClose={onClose}
      onSave={handleSave}
      saving={isSaving}
    />
  );
};

ControlsMediumContentWarning.propTypes = {
  medium: MediumType.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  read: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    read: (medium) => {
      const namespace = utils.node.getNamespace(medium);
      return dispatch(actions[namespace].read(medium.id, namespace));
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(ControlsMediumContentWarning);
