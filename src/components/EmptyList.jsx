import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import i18n from '../languages';

// What stands in a list with nothing in it: a card with the list's own icon,
// so that an empty tab reads as empty and not as one that failed to load. The
// whole width of the list, however many columns it would have. `inCard` draws
// the same inside a card that is there already, without a second one.
const EmptyList = ({
  icon = null, inCard = false, compact = false, children = null,
}) => {
  const Frame = inCard ? Box : Card;
  return (
    <Frame sx={inCard ? null : { mb: 2 }}>
      <Stack spacing={1} sx={{ alignItems: 'center', px: 2, py: compact ? 3 : 6 }}>
        {icon && React.cloneElement(icon, { fontSize: 'large', color: 'disabled' })}
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
          {children || i18n.t('commons:nothingToShow')}
        </Typography>
      </Stack>
    </Frame>
  );
};

EmptyList.propTypes = {
  icon: PropTypes.element,
  inCard: PropTypes.bool,
  // Shorter, in a narrow column beside what matters more.
  compact: PropTypes.bool,
  // Said in place of the usual line.
  children: PropTypes.node,
};

export default EmptyList;
