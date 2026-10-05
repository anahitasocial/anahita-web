import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ReplyAccessDialog from '../../../components/ReplyAccessDialog';
import actions from '../../../actions';
import api from '../../../api';
import MediumType from '../../../proptypes/Medium';
import i18n from '../../../languages';
import utils from '../../../utils';

// Who can reply to a post that exists, changed in a dialog and saved from
// it. Opened from the post's menu, which owns whether it is open.
const ControlsMediumReplyAccess = ({
  medium,
  open,
  onClose,
  read,
  alertSuccess,
  alertError,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (value) => {
    setIsSaving(true);

    api.replies.setAccess(medium, value).then(() => {
      // Read again, so every place showing the post has the new answer,
      // the thread under it included.
      return read(medium);
    }).then(() => {
      alertSuccess(i18n.t('replies:access.saved'));
      onClose();
    }).catch(() => {
      alertError(i18n.t('replies:access.notSaved'));
    })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <ReplyAccessDialog
      open={open}
      value={medium.replyAccess}
      onClose={onClose}
      onSave={handleSave}
      saving={isSaving}
    />
  );
};

ControlsMediumReplyAccess.propTypes = {
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

export default connect(null, mapDispatchToProps)(ControlsMediumReplyAccess);
