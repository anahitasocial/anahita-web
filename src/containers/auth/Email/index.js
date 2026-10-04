import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import form from '../../../utils/form';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';

import EmailEdit from './EmailEdit';
import StepUp from '../StepUp';
import { Email as EMAIL_LIMITS } from '../../../constants';

const { EMAIL_MIN_LENGTH, EMAIL_MAX_LENGTH } = EMAIL_LIMITS;

const formFields = form.createFormFields([
  'email',
]);

// Change-email card for Settings → Account.
//
// This is the ONLY way an account's email address changes. The person
// edit form no longer accepts one — from admins or from the person
// themselves — because email is what password reset delivers to, so
// whoever can set it can take the account.
//
// Submitting does not change anything yet. It mails a 6-digit code to
// the person's CURRENT address, and the change applies only once they
// type that code into this card.
//
// Two independent proofs in total: a recent step-up (a passkey, or a
// password plus a passcode, or a password) and control of the existing
// inbox. The step-up is collected by the dialog on a 403, not by this
// form — see containers/auth/StepUp.
const CODE_LENGTH = 6;

const Email = ({
  viewer,
  alertError,
  alertSuccess,
  readSession,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState(formFields);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  // The address a code has been sent for, while it is waiting to be
  // entered. Empty when nothing is pending.
  const [pendingEmail, setPendingEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [stepUpOpen, setStepUpOpen] = useState(false);

  const resetForm = () => {
    setFields(formFields);
    setErrors({});
  };

  const resetCode = () => {
    setPendingEmail('');
    setCode('');
    setCodeError('');
  };

  const handleOpen = () => {
    resetCode();
    resetForm();
    setIsEditing(true);
  };

  // Cancelling while a code is pending only forgets it here. The code
  // itself expires on the server, and asking again replaces it.
  const handleCancel = () => {
    resetCode();
    resetForm();
    setIsEditing(false);
  };

  const handleCodeChange = (event) => {
    // Digits only, so a pasted "123 456" still works.
    setCode(event.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH));
    if (codeError) {
      setCodeError('');
    }
  };

  const handleOnChange = (event) => {
    const { target } = event;
    const { name } = target;

    setFields(form.validateField(target, fields));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateClientSide = (newEmail) => {
    const next = {};

    if (!newEmail) {
      next.email = i18n.t('email:errors.required');
    } else if (newEmail.length < EMAIL_MIN_LENGTH || newEmail.length > EMAIL_MAX_LENGTH) {
      next.email = i18n.t('email:errors.invalid');
    } else if (!newEmail.includes('@')) {
      next.email = i18n.t('email:errors.invalid');
    } else if (newEmail.toLowerCase() === (viewer.email || '').toLowerCase()) {
      next.email = i18n.t('email:errors.sameAsCurrent');
    }

    return Object.keys(next).length > 0 ? next : null;
  };

  // submit is separate from handleOnSubmit so the step-up dialog can
  // replay it after a successful re-authentication, without the person
  // having to press the button again.
  const submit = () => {
    const newEmail = fields.email.value.trim();

    setSubmitting(true);

    api.email.edit({ email: newEmail })
      .then(() => {
        setSubmitting(false);
        setCode('');
        setCodeError('');
        setPendingEmail(newEmail);
      })
      .catch((err) => {
        setSubmitting(false);

        const status = err && err.response && err.response.status;

        // No recent step-up. Collect one, then retry.
        if (status === 403) {
          setStepUpOpen(true);
          return;
        }

        // No 429 branch. /email/change carries no rate-limit scope, and
        // does not need one: clearStepUp runs on every successful
        // request, so each retry costs a fresh re-authentication. That
        // is the throttle. A branch for a status the server never sends
        // is a message nobody can trigger and nobody maintains.

        // Safe to be specific: this endpoint already required a session
        // and a step-up, so it is not an enumeration oracle for whether
        // an address is registered.
        if (status === 409) {
          setErrors({ email: i18n.t('email:errors.taken') });
          return;
        }

        if (status === 400) {
          setErrors({ email: i18n.t('email:errors.invalid') });
          return;
        }

        alertError(i18n.t('email:errors.generic'));
      });
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const validationErrors = validateClientSide(fields.email.value.trim());
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    submit();
  };

  const handleOnConfirm = (event) => {
    event.preventDefault();

    if (confirming) {
      return;
    }

    if (code.length !== CODE_LENGTH) {
      setCodeError(i18n.t('email:errors.codeRequired'));
      return;
    }

    setConfirming(true);

    api.email.confirm({ code })
      .then(() => {
        setConfirming(false);
        resetCode();
        resetForm();
        setIsEditing(false);
        alertSuccess(i18n.t('email:changed'));

        // The server has just signed every session out, this one
        // included. Reading the session again is what tells the rest of
        // the app, which then shows the signed-out state.
        readSession();
      })
      .catch((err) => {
        setConfirming(false);

        const status = err && err.response && err.response.status;

        if (status === 422) {
          const remaining = err.response.data && err.response.data.remaining;
          setCodeError(
            typeof remaining === 'number'
              ? i18n.t('email:errors.codeWrong', { count: remaining })
              : i18n.t('email:errors.codeWrong'),
          );
          setCode('');
          return;
        }

        if (status === 400) {
          setCodeError(i18n.t('email:errors.codeRequired'));
          return;
        }

        // Nothing pending any more: expired, replaced or out of tries.
        // Back to the address form, which is where a new code comes from.
        if (status === 410) {
          resetCode();
          setErrors({ email: i18n.t('email:errors.codeExpired') });
          return;
        }

        // Somebody else took the address while the code was in transit.
        if (status === 409) {
          resetCode();
          setErrors({ email: i18n.t('email:errors.taken') });
          return;
        }

        alertError(i18n.t('email:errors.confirmFailed'));
      });
  };

  return (
    <>
      <EmailEdit
        currentEmail={viewer.email || ''}
        isEditing={isEditing}
        fields={fields}
        errors={errors}
        submitting={submitting}
        pendingEmail={pendingEmail}
        code={code}
        codeError={codeError}
        confirming={confirming}
        onOpen={handleOpen}
        onCancel={handleCancel}
        onChange={handleOnChange}
        onSubmit={handleOnSubmit}
        onCodeChange={handleCodeChange}
        onConfirm={handleOnConfirm}
      />
      <StepUp
        open={stepUpOpen}
        onVerified={() => {
          setStepUpOpen(false);
          submit();
        }}
        onCancel={() => {
          return setStepUpOpen(false);
        }}
      />
    </>
  );
};

Email.propTypes = {
  viewer: PropTypes.objectOf(PropTypes.any).isRequired,
  alertError: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  readSession: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { viewer } = state.session;
  return { viewer };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    readSession: () => {
      return dispatch(actions.session.read());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Email);
