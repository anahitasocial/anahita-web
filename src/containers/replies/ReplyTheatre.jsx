import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import striptags from 'striptags';

import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';

import Lightbox from '../media/Stepper/Lightbox';
import ReplyActions from './ReplyActions';
import i18n from '../../languages';
import photoFiles from '../../utils/photoFiles';
import utils from '../../utils';
import warnings from '../../utils/warnings';

const { getURL } = utils.node;

// Arrow keys belong to whatever the viewer is typing in before the theatre.
const isTypingTarget = (target) => {
  if (!target) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

// A reply's pictures in the theatre, as a photo post's are: full screen, to
// be seen larger, zoomed into, and stepped or swiped through, its writer and
// words beside them, with its heart (the user, 2026-11-22). It steps through
// this reply's pictures only, and has no tabs: the thread it is in is the
// post's, behind it.
const ReplyTheatre = ({
  reply,
  at = 0,
  authorized,
  onLike,
  onClose,
}) => {
  const [fileIndex, setFileIndex] = useState(at);
  const count = photoFiles.countOf(reply);
  const hasNext = fileIndex < count - 1;
  const hasPrev = fileIndex > 0;

  const handleNext = useCallback(() => {
    if (hasNext) setFileIndex(fileIndex + 1);
  }, [fileIndex, hasNext]);
  const handlePrev = useCallback(() => {
    if (hasPrev) setFileIndex(fileIndex - 1);
  }, [fileIndex, hasPrev]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.code === 'ArrowRight') handleNext();
      if (event.code === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [handleNext, handlePrev]);

  // Called by its warning where it has one, as the post's theatre is.
  const warning = warnings.of(reply);
  const title = warnings.has(warning) ?
    warnings.say(warning, i18n.t.bind(i18n)) :
    striptags(reply.content || '').substring(0, 60);

  // On a mobile the lightbox has the whole screen and its own bars.
  const isStacked = useMediaQuery(useTheme().breakpoints.down('md'));

  return (
    <Dialog open fullScreen onClose={onClose} aria-labelledby="reply-theatre-title">
      {!isStacked &&
      <Toolbar variant="dense" sx={{ flexShrink: 0, px: 1 }}>
        <Tooltip title={i18n.t('commons:close')}>
          <IconButton aria-label={i18n.t('commons:close')} onClick={onClose} edge="start" size="large">
            <CloseIcon />
          </IconButton>
        </Tooltip>
        <Typography
          id="reply-theatre-title"
          variant="subtitle1"
          sx={{
            flexGrow: 1, minWidth: 0, mx: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
        <Tooltip title={i18n.t('media:stepper.permalink')}>
          <IconButton
            aria-label={i18n.t('media:stepper.permalink')}
            component="a"
            href={getURL(reply)}
            edge="end"
            size="large"
          >
            <LinkIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>}
      {!isStacked && <Divider />}
      <Lightbox
        medium={reply}
        handleClose={onClose}
        fileIndex={fileIndex}
        handleFileIndex={setFileIndex}
        hasNext={hasNext}
        hasPrev={hasPrev}
        handleNext={handleNext}
        handlePrev={handlePrev}
        actions={
          <ReplyActions
            reply={reply}
            authorized={authorized}
            isReplying={false}
            onLike={onLike}
          />
        }
      />
    </Dialog>
  );
};

ReplyTheatre.propTypes = {
  reply: PropTypes.object.isRequired,
  // Which of its pictures it opens on.
  at: PropTypes.number,
  // What the viewer may do with it, from the server.
  authorized: PropTypes.object.isRequired,
  onLike: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ReplyTheatre;
