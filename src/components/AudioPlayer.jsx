import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import videos from '../utils/videos';

// An audio post's sound (roadmap row 137): the browser's own player, the
// width of what it is in, and the cover the file carried, small, beside it.
// Nothing moves as it loads: the cover's square is kept before the picture
// arrives, and the player is drawn at once, reading only how long the sound
// is until play is pressed.
//
// It goes on playing when scrolled out of view, as a sound is listened to
// while reading on. The file is at an address of the API's that asks, every
// time, whether this viewer may hear the post.
const COVER = 64;

const AudioPlayer = ({ audio = null, title = '', padded = true }) => {
  if (!audio || !audio.url) {
    return null;
  }

  const cover = videos.urlOf(audio.cover);

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', px: padded ? 2 : 0, py: padded ? 1 : 0 }}>
      {cover &&
        <Box
          component="img"
          src={cover}
          alt=""
          loading="lazy"
          sx={{
            width: COVER,
            height: COVER,
            flexShrink: 0,
            objectFit: 'cover',
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        />}
      <Box
        component="audio"
        src={videos.urlOf(audio.url)}
        title={title || undefined}
        aria-label={title || undefined}
        controls
        preload="metadata"
        sx={{ display: 'block', width: '100%', minWidth: 0 }}
      />
    </Stack>
  );
};

AudioPlayer.propTypes = {
  // What an audio post carries as `audio`: its file, how long it plays,
  // and its cover when it has one, paths under the API.
  audio: PropTypes.shape({
    duration: PropTypes.number,
    url: PropTypes.string,
    type: PropTypes.string,
    cover: PropTypes.string,
  }),
  title: PropTypes.string,
  // A card's own padding round it; none where what holds it has its own,
  // as a reply.
  padded: PropTypes.bool,
};

export default AudioPlayer;
