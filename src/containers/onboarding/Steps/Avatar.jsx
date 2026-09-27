import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import ActorsAvatar from '../../actors/Read/Avatar';
import StepActions from '../StepActions';
import ViewerType from '../../../proptypes/Viewer';
import i18n from '../../../languages';
import onboardingUtil from '../../../utils/onboarding';

// The avatar, through the same upload the profile page uses. No cropping: the
// server's square size is centre-cropped already.
//
// Continue waits for an avatar. Skipping is still there for anybody who wants
// to do it later.
const OnboardingAvatar = ({
  viewer,
  primaryLabel,
  onNext,
  onSkip,
  refreshSession,
  alertError,
}) => {
  return (
    <>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {i18n.t('onboarding:avatar.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('onboarding:avatar.description')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
          }}
        >
          <ActorsAvatar
            node={viewer}
            canEdit
            onChange={refreshSession}
            onError={() => { alertError(i18n.t('onboarding:avatar.error')); }}
          />
        </Box>
      </CardContent>
      <StepActions
        label={primaryLabel}
        onClick={onNext}
        disabled={!onboardingUtil.hasAvatar(viewer)}
        onSkip={onSkip}
      />
    </>
  );
};

OnboardingAvatar.propTypes = {
  viewer: ViewerType.isRequired,
  primaryLabel: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  refreshSession: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

export default OnboardingAvatar;
