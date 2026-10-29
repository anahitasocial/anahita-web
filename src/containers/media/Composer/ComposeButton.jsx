import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

import ShortComposer from './Short';
import { useSharedVideoUpload } from './Video/SharedVideoUpload';
import { progressOf } from './Video/useVideoUpload';
import LongComposer from './Long';
import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';

const { node } = utils;

// What the short composer posts, and what the long one writes.
const SHORT = ['note', 'photo', 'video'];
const LONG = ['article', 'topic'];

// The + button (roadmap row 99, docs/plans/compose-button.md): a large round
// button at the bottom right of the home page, which posts to the viewer's
// own profile, and of a profile they may post to, which it posts to; nowhere
// else (the user, 2026-10-19). The page says which, while it is open
// (reducers/composeTarget.js). It opens the short composer, which expands to
// the long one; a profile that takes only long writing opens the long one at
// once. What either offers is what that profile takes from the viewer
// (`authorized.composers`).
const ComposeButton = () => {
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

  const target = onScreen && onScreen.home ? own : onScreen;

  if (!target || !target.id) {
    return null;
  }

  const composers = node.getComposers(target);
  const short = SHORT.filter((kind) => { return composers.includes(kind); });
  const long = LONG.filter((kind) => { return composers.includes(kind); });
  if (short.length === 0 && long.length === 0) {
    return null;
  }

  const expand = (body = '') => {
    setCarried(body);
    setIsLongOpen(true);
  };

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
          onClick={() => {
            if (short.length > 0) {
              setIsShortOpen(true);
            } else {
              expand();
            }
          }}
        >
          <AddIcon fontSize="large" />
        </Fab>
        {(isSending || isPreparing) &&
          <CircularProgress
            size={68}
            variant={isSending ? 'determinate' : 'indeterminate'}
            value={isSending ? upload.percent : undefined}
            aria-label={isSending ? progressOf(upload) : i18n.t('videos:upload.processing')}
            sx={{
              position: 'absolute', top: -6, left: -6, pointerEvents: 'none',
            }}
          />}
      </Box>
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
};

export default ComposeButton;
