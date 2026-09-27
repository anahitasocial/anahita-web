/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { singularize } from 'inflection';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Icon from '@mui/icons-material/Notifications';

import actions from '../../../actions';
import apis from '../../../api';
import i18n from '../../../languages';
import ActorType from '../../../proptypes/Actor';
import utils from '../../../utils';

import ActorsFormsNotifications from './Form';

const initEmailSettings = {
  emailMutedGlobally: false,
  sendEmail: false,
};

const { node } = utils;

const ActorsNotificationsDialog = ({
  actor,
  alertSuccess,
  alertError,
}) => {
  const namespace = node.getNamespace(actor);

  const [open, setOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(actor.isSubscribed);
  const [emailSettings, setEmailSettings] = useState(initEmailSettings);

  const api = apis[namespace][singularize(namespace)].notifications;

  useEffect(() => {
    if (actor.id && open) {
      api.read(actor)
        .then((result) => {
          const { data } = result.data;
          setEmailSettings({
            emailMutedGlobally: data.email_muted_globally,
            sendEmail: data.send_email,
          });
        })
        .catch((err) => {
          return console.error(err);
        });
    }
  }, [actor.id, open]);

  const handleEditType = () => {
    api.editType(actor)
      .then(() => {
        alertSuccess(i18n.t('prompts:saved.success'));
        setIsSubscribed(!isSubscribed);
      }).catch(() => {
        alertError(i18n.t('prompts:saved.error'));
      });
  };

  const handleEdit = (event) => {
    const { target } = event;
    api.edit({
      actor,
      sendEmail: target.checked,
    })
      .then(() => {
        alertSuccess(i18n.t('prompts:saved.success'));
        setEmailSettings({
          ...emailSettings,
          sendEmail: !target.checked,
        });
      }).catch(() => {
        alertError(i18n.t('prompts:saved.error'));
      });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <DialogTitle>
          {i18n.t(`${namespace}:settings.notifications`)}
        </DialogTitle>
        <DialogContent>
          <ActorsFormsNotifications
            namespace={namespace}
            emailMutedGlobally={emailSettings.emailMutedGlobally}
            sendEmail={emailSettings.sendEmail}
            isSubscribed={isSubscribed}
            handleEditType={handleEditType}
            handleEdit={handleEdit}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
            }}
            fullWidth
            variant="contained"
          >
            {i18n.t('actions:done')}
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        <Icon />
      </Button>
    </>
  );
};

ActorsNotificationsDialog.propTypes = {
  actor: ActorType.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActorsNotificationsDialog);
