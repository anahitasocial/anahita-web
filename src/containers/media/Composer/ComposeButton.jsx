import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types';

import ShortComposer from './Short';
import { useSharedVideoUpload } from './Video/SharedVideoUpload';
import { progressOf, wordsOf } from './Video/useVideoUpload';
import LongComposer from './Long';
import kinds from '../../../utils/postKinds';
import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';

const { node } = utils;

// The + button (roadmap row 99, docs/plans/compose-button.md): a large round
// button at the bottom right of the home page, which posts to the viewer's
// own profile, and of a profile they may post to, which it posts to; nowhere
// else (the user, 2026-10-19). The page says which, while it is open
// (reducers/composeTarget.js). It opens the short composer, which expands to
// the long one; a profile that takes only long writing opens the long one at
// once. What either offers is what that profile takes from the viewer
// (`authorized.composers`).
//
// On a mobile it is the + in the middle of the bar at the foot of the
// screen instead (`inBar`, roadmap row 166), on every page: it posts to the
// profile on the screen when the viewer may post to it, and else to their
// own.
const ComposeButton = ({ inBar = false }) => {
  const viewer = useSelector((state) => { return state.session.viewer; });
  const onScreen = useSelector((state) => { return state.composeTarget; });

  // The viewer's own profile, with what they may post to it, read once.
  const [own, setOwn] = useState(null);
  useEffect(() => {
    if (!viewer.alias) {
      return undefined;
    }
    let current = true;
    api.people.read(viewer.alias).then(({ data }) => {
      if (current) {
        setOwn(data);
      }
    }).catch(() => {
      // No button until it can be read: nowhere to post to is known.
    });
    return () => {
      current = false;
    };
  }, [viewer.alias]);

  const [isShortOpen, setIsShortOpen] = useState(false);
  const [isLongOpen, setIsLongOpen] = useState(false);
  const [carried, setCarried] = useState('');
  // A video posted from it, on any page with the button: a ring that
  // fills as it is sent, then turns while it is prepared.
  const upload = useSharedVideoUpload();
  const isSending = upload && upload.phase === 'uploading';
  const isPreparing = upload && upload.phase === 'processing';

  let target = onScreen && onScreen.home ? own : onScreen;
  if (inBar && (!target || !target.id)) {
    target = own;
  }

  const composers = target && target.id ? node.getComposers(target) : [];
  // What the short composer posts, and what the long one writes (kinds.js).
  const short = kinds.forComposer('short', composers);
  const long = kinds.forComposer('long', composers);
  const nothing = short.length === 0 && long.length === 0;

  // The bar keeps its + while its profile is read, so that its five stay
  // where they are.
  if (nothing && !inBar) {
    return null;
  }

  const expand = (body = '') => {
    setCarried(body);
    setIsLongOpen(true);
  };

  const open = () => {
    if (short.length > 0) {
      setIsShortOpen(true);
    } else {
      expand();
    }
  };

  const composersOf = !nothing && (
    <>
      {short.length > 0 &&
        <ShortComposer
          key={`compose-short-${target.id}`}
          actor={target}
          kinds={short}
          open={isShortOpen}
          onClose={() => {
            setIsShortOpen(false);
          }}
          onExpand={long.length > 0 ? expand : null}
        />}
      {long.length > 0 &&
        <LongComposer
          key={`compose-long-${target.id}`}
          actor={target}
          kinds={long}
          open={isLongOpen}
          body={carried}
          onClose={() => {
            setIsLongOpen(false);
          }}
        />}
    </>
  );

  if (inBar) {
    return (
      <>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <IconButton
            color="inherit"
            disabled={nothing}
            aria-label={i18n.t('composer:newPost')}
            onClick={open}
          >
            <AddIcon />
          </IconButton>
          {(isSending || isPreparing) &&
            <CircularProgress
              size={40}
              variant={isSending ? 'determinate' : 'indeterminate'}
              value={isSending ? upload.percent : undefined}
              aria-label={isSending ? progressOf(upload) : i18n.t(wordsOf(upload.kind, 'upload.processing'))}
              sx={{
                position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
              }}
            />}
        </Box>
        {composersOf}
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          right: { xs: 16, sm: 24 },
          bottom: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 24 },
          zIndex: (theme) => { return theme.zIndex.speedDial; },
        }}
      >
        <Fab
          color="primary"
          size="large"
          aria-label={i18n.t('composer:newPost')}
          onClick={open}
        >
          <AddIcon fontSize="large" />
        </Fab>
        {(isSending || isPreparing) &&
          <CircularProgress
            size={68}
            variant={isSending ? 'determinate' : 'indeterminate'}
            value={isSending ? upload.percent : undefined}
            aria-label={isSending ? progressOf(upload) : i18n.t(wordsOf(upload.kind, 'upload.processing'))}
            sx={{
              position: 'absolute', top: -6, left: -6, pointerEvents: 'none',
            }}
          />}
      </Box>
      {composersOf}
    </>
  );
};

ComposeButton.propTypes = {
  // The + in the bar at the foot of a mobile's screen, not the round
  // button at the bottom right.
  inBar: PropTypes.bool,
};

export default ComposeButton;
