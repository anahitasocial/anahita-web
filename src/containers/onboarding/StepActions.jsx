import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';

import i18n from '../../languages';

// The footer every step shares, so every step skips the same way.
//
// One prominent control: the primary action. Skipping is possible but not
// encouraged — a small text link in the secondary colour, below and away from
// the button, never a second button of equal weight.
const StepActions = ({
  label,
  onClick = undefined,
  type = 'button',
  disabled = false,
  pending = false,
  onSkip,
}) => {
  return (
    <Box px={2} pb={2}>
      <Button
        type={type}
        variant="contained"
        color="primary"
        fullWidth
        disabled={disabled || pending}
        onClick={onClick}
        startIcon={pending && <CircularProgress size={16} color="inherit" />}
      >
        {label}
      </Button>
      <Box mt={3} textAlign="center">
        {/* A button that looks like a link, which is what the rule cannot tell
            from an anchor used as a button. type="button" matters: inside the
            profile step's form, a bare button would submit it. */}
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link
          component="button"
          type="button"
          variant="body2"
          color="textSecondary"
          onClick={pending ? undefined : onSkip}
        >
          {i18n.t('onboarding:actions.skip')}
        </Link>
      </Box>
    </Box>
  );
};

StepActions.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit']),
  disabled: PropTypes.bool,
  pending: PropTypes.bool,
  onSkip: PropTypes.func.isRequired,
};

export default StepActions;
