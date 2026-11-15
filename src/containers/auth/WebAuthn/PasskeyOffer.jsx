import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import onboardingUtil from '../../../utils/onboarding';
import passkeyOffer from '../../../utils/passkeyOffer';
import PersonType from '../../../proptypes/Person';
import { ceremonyErrorKey } from './index';

// Offering a passkey once, right after signing in (roadmap row 153): on a
// device that can hold one, to somebody past onboarding who has none and has
// not skipped it here. utils/passkeyOffer.js decides; this asks. The
// ceremony is the one Settings › Security runs.
const PasskeyOffer = ({ viewer, isAuthenticated, alertSuccess }) => {
  const location = useLocation();
  const viewerId = isAuthenticated && viewer ? viewer.id : 0;
  const onboarding = Boolean(viewer) && (
    onboardingUtil.needsOnboarding(viewer) || location.pathname.startsWith('/onboarding')
  );

  // What is found out about the device and the account, once a sign-in
  // has just finished: undefined until known.
  const [hasPlatform, setHasPlatform] = useState(undefined);
  const [passkeyCount, setPasskeyCount] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const due = passkeyOffer.isDue();

  // Found out once, for whoever has just signed in: the device, then their
  // passkeys. Not started again when what it found is set, which would
  // drop the answer still on its way.
  const asked = useRef(0);
  useEffect(() => {
    if (!due || !viewerId || onboarding || asked.current === viewerId) {
      return;
    }
    asked.current = viewerId;
    const supported = api.webauthn.isSupported();
    (supported ? api.webauthn.hasPlatformAuthenticator() : Promise.resolve(false))
      .then((has) => {
        setHasPlatform(Boolean(has));
        return has ? api.webauthn.browse() : null;
      })
      .then((response) => {
        if (response) {
          const list = (response.data && response.data.data) || [];
          setPasskeyCount(list.length);
        }
      })
      .catch(() => {
        // Not known: not asked.
        passkeyOffer.clearDue();
      });
  }, [due, viewerId, onboarding]);

  const decision = passkeyOffer.decide({
    due,
    viewerId,
    onboarding,
    skipped: viewerId ? passkeyOffer.isSkipped(viewerId) : false,
    hasPlatform,
    passkeyCount,
  });

  useEffect(() => {
    if (decision === 'ask' && !open) {
      // Asked once for this sign-in, whatever the answer.
      passkeyOffer.clearDue();
      setOpen(true);
    } else if (decision === 'never' && due) {
      passkeyOffer.clearDue();
    }
  }, [decision]);

  const handleSkip = () => {
    passkeyOffer.skip(viewerId);
    setOpen(false);
  };

  const handleAdd = () => {
    setIsBusy(true);
    setError('');
    api.webauthn.register()
      .then(() => {
        setOpen(false);
        alertSuccess(i18n.t('auth:webauthn.offer.added'));
      })
      .catch((err) => {
        console.error(err);
        setError(i18n.t(ceremonyErrorKey(err)));
      })
      .finally(() => {
        setIsBusy(false);
      });
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isBusy) {
          handleSkip();
        }
      }}
      aria-labelledby="passkey-offer-title"
      aria-describedby="passkey-offer-text"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="passkey-offer-title">
        {i18n.t('auth:webauthn.offer.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="passkey-offer-text">
          {i18n.t('auth:webauthn.offer.text')}
        </DialogContentText>
        {/* The line is kept, so that nothing moves when a ceremony fails. */}
        <Typography variant="body2" color="error" role="alert" sx={{ mt: 1, minHeight: 20 }}>
          {error || ' '}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button fullWidth onClick={handleSkip} disabled={isBusy}>
          {i18n.t('auth:webauthn.offer.skip')}
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          onClick={handleAdd}
          disabled={isBusy}
        >
          {i18n.t('auth:webauthn.offer.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PasskeyOffer.propTypes = {
  viewer: PersonType,
  isAuthenticated: PropTypes.bool.isRequired,
  alertSuccess: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { viewer, isAuthenticated } = state.session;
  return { viewer, isAuthenticated };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PasskeyOffer);
