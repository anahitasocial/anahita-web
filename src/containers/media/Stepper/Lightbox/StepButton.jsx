import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';

import NextIcon from '@mui/icons-material/NavigateNext';
import PrevIcon from '@mui/icons-material/NavigateBefore';

import i18n from '../../../../languages';

// The two ways through the lightbox's posts, each with its icon and the
// words a screen reader is given for it.
const WAYS = {
  prev: { Icon: PrevIcon, label: 'media:stepper.previous' },
  next: { Icon: NextIcon, label: 'media:stepper.next' },
};

const labelOf = (way) => {
  return i18n.t(WAYS[way].label);
};

// The button to the post before or after: over the picture beside it, or
// under the post where there is no picture.
const StepButton = ({
  way,
  onClick,
  disabled,
  className = undefined,
}) => {
  const { Icon } = WAYS[way];
  return (
    <IconButton
      className={className}
      aria-label={labelOf(way)}
      onClick={onClick}
      disabled={disabled}
      size="large"
    >
      <Icon />
    </IconButton>
  );
};

StepButton.propTypes = {
  way: PropTypes.oneOf(Object.keys(WAYS)).isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

export { labelOf };
export default StepButton;
