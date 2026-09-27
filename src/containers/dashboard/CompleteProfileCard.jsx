import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import ViewerType from '../../proptypes/Viewer';
import i18n from '../../languages';
import onboardingUtil from '../../utils/onboarding';
import { Onboarding as ONBOARDING } from '../../constants';

const { NUDGE_DISMISSED_STORAGE_KEY } = ONBOARDING;

// Storage can throw — a private window, blocked site data — and a card that
// cannot remember being dismissed is still a card, so either way it renders.
const readDismissed = () => {
  try {
    return window.localStorage.getItem(NUDGE_DISMISSED_STORAGE_KEY) === '1';
  } catch (error) {
    return false;
  }
};

const writeDismissed = () => {
  try {
    window.localStorage.setItem(NUDGE_DISMISSED_STORAGE_KEY, '1');
  } catch (error) {
    // Dismissed for this visit only.
  }
};

// Somebody who skipped onboarding still has an empty profile, and the gate
// sends nobody through twice. This is what reminds them, for as long as the
// avatar or the bio is missing.
//
// It links back to /onboarding rather than to settings: the flow covers the
// avatar and the bio together, and finishing it a second time changes nothing.
const CompleteProfileCard = ({ viewer }) => {
  const [dismissed, setDismissed] = useState(readDismissed);

  if (dismissed || !onboardingUtil.hasIncompleteProfile(viewer)) {
    return null;
  }

  const dismiss = () => {
    writeDismissed();
    setDismissed(true);
  };

  return (
    <Box mb={2}>
      <Card variant="outlined">
        <CardHeader
          title={i18n.t('onboarding:nudge.title')}
          subheader={i18n.t('onboarding:nudge.description')}
          action={
            <IconButton
              aria-label={i18n.t('onboarding:nudge.dismiss')}
              onClick={dismiss}
            >
              <CloseIcon />
            </IconButton>
          }
        />
        <CardActions>
          <Button
            component={RouterLink}
            to="/onboarding"
            color="primary"
          >
            {i18n.t('onboarding:nudge.action')}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

CompleteProfileCard.propTypes = {
  viewer: ViewerType.isRequired,
};

export default CompleteProfileCard;
