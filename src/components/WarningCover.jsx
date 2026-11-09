import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import i18n from '../languages';
import warnings from '../utils/warnings';

// What a post with a content warning shows until its reader chooses to see
// it (anahita-services row 122): the warning, with its kind's icon, and
// View, over its pictures, or over all of it when it has none
// (warnings.hasMedia). The post is drawn behind, blurred, so that the card is as tall as
// it will be and nothing jumps when it is opened. View opens it for this
// showing of the page.
//
// useWarning holds whether it is opened, for a card that blurs a part of
// itself elsewhere too (an article's cover above its name).
//
// What was opened is remembered by the post's id, so that a pane that
// steps from post to post (the photo theatre) puts each behind its own.
export const useWarning = (post) => {
  const warning = warnings.of(post);
  const id = post ? post.id : null;
  const [shownId, setShownId] = useState(null);
  return {
    warning,
    hidden: warnings.has(warning) && shownId !== id,
    show: () => {
      setShownId(id);
    },
  };
};

const blurred = {
  filter: 'blur(24px)',
  userSelect: 'none',
  pointerEvents: 'none',
};

// A part of a card that is only blurred, with no warning of its own. Off,
// it is shown as it is: a part that is blurred only for some posts.
export const Blurred = ({ state, off = false, children }) => {
  if (off || !state.hidden) {
    return children;
  }
  return (
    <Box aria-hidden inert sx={{ overflow: 'hidden' }}>
      <Box sx={blurred}>{children}</Box>
    </Box>
  );
};

Blurred.propTypes = {
  state: PropTypes.shape({ hidden: PropTypes.bool }).isRequired,
  off: PropTypes.bool,
  children: PropTypes.node,
};

// The warning and View, said in the middle of what it lies over.
const Notice = ({ warning, onView, dark = false }) => {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, maxWidth: '100%',
    }}
    >
      {warnings.iconOf(warning.kind, { fontSize: 'small', color: dark ? 'inherit' : 'action' })}
      <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        {warnings.say(warning, i18n.t.bind(i18n))}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        color={dark ? 'inherit' : 'primary'}
        onClick={onView}
        sx={{ flexShrink: 0 }}
      >
        {i18n.t('warnings:view')}
      </Button>
    </Box>
  );
};

Notice.propTypes = {
  warning: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
  dark: PropTypes.bool,
};

// A veil over a pane that cannot be wrapped (the photo theatre): what is
// behind it blurred where it is, and the warning over it. Each post starts
// behind its own.
export const WarningVeil = ({ post = null, state = null }) => {
  const own = useWarning(post);
  const { warning, hidden, show } = state || own;
  if (!hidden) {
    return null;
  }
  return (
    <Box
      role="group"
      aria-label={i18n.t('warnings:label')}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        color: '#fff',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        bgcolor: 'rgba(0, 0, 0, 0.4)',
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
      onTouchStart={(event) => {
        event.stopPropagation();
      }}
    >
      <Notice warning={warning} onView={show} dark />
    </Box>
  );
};

WarningVeil.propTypes = {
  // The post, when the veil keeps its own state; or the state useWarning
  // gives, shared with a Blurred part.
  post: PropTypes.object,
  state: PropTypes.shape({
    warning: PropTypes.object,
    hidden: PropTypes.bool,
    show: PropTypes.func,
  }),
};

const WarningCover = ({
  post = null,
  state = null,
  off = false,
  children,
}) => {
  const own = useWarning(post);
  const { warning, hidden, show } = state || own;

  if (off || !hidden) {
    return children;
  }

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: 64 }}>
      <Box aria-hidden inert sx={blurred}>
        {children}
      </Box>
      <Box
        role="group"
        aria-label={i18n.t('warnings:label')}
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          bgcolor: (theme) => {
            return theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.5)';
          },
        }}
        onClick={(event) => {
          // Nothing under it opens: the post is not seen yet.
          event.stopPropagation();
        }}
      >
        <Notice warning={warning} onView={show} />
      </Box>
    </Box>
  );
};

WarningCover.propTypes = {
  // The post whose warning it is, when the cover keeps its own state.
  post: PropTypes.object,
  // Or the state useWarning gives, shared with a Blurred part.
  state: PropTypes.shape({
    warning: PropTypes.object,
    hidden: PropTypes.bool,
    show: PropTypes.func,
  }),
  // Shown as it is: the part of a post that is behind the warning only
  // for some posts (its words, when it has no pictures).
  off: PropTypes.bool,
  children: PropTypes.node,
};

export default WarningCover;
