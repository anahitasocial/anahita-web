import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import GifIcon from '@mui/icons-material/GifBoxOutlined';
import PhotoIcon from '@mui/icons-material/Photo';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import videos from '../../../utils/videos';
import i18n from '../../../languages';
import { PHOTO_TYPES } from '../../../utils/preparePhoto';

// A GIF is played as a video: an animation, silent, on a loop. Each button
// opens the system's file window on its own kind of file.
const ANIMATIONS = videos.ANIMATION_TYPES.join(',');
const { MOVIES } = videos;

// Photo, GIF and Video, the same in the short box and the extended
// composer: with their words beside them where there is room, the icons
// alone on a phone. A post holds photos or a GIF or a video, so the
// composer says which are offered (`photos`, `video`).
const AttachButtons = ({
  phone,
  photos = false,
  video = false,
  onPhotos,
  onVideo,
}) => {
  const photoPicker = useRef(null);
  const gifPicker = useRef(null);
  const videoPicker = useRef(null);

  const button = (label, tip, icon, onClick, pressed) => {
    // Coloured while what it opened is open, so it is clear that pressing
    // it again closes it.
    const color = pressed ? 'primary.main' : 'text.secondary';
    const ariaPressed = pressed === undefined ? undefined : pressed;
    if (phone) {
      return (
        <Tooltip title={tip}>
          <IconButton
            aria-label={tip}
            aria-pressed={ariaPressed}
            onClick={onClick}
            sx={{ color }}
          >
            {icon}
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <Button
        startIcon={icon}
        aria-pressed={ariaPressed}
        sx={{ color, flexShrink: 0 }}
        onClick={onClick}
      >
        {label}
      </Button>
    );
  };

  // Photos open the system's picker at once, for several: one tap, not a
  // place to drop them first (roadmap row 112).
  const choosePhotos = (event) => {
    const chosen = Array.from((event.target.files) || []);
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
    if (chosen.length > 0) {
      onPhotos(chosen);
    }
  };

  const choose = (event) => {
    const chosen = event.target.files && event.target.files[0];
    // The same file can be chosen again after it is taken off.
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
    if (chosen) {
      onVideo(chosen);
    }
  };

  return (
    <>
      {photos &&
        button(
          i18n.t('composer:photo'),
          i18n.t('replies:attachments.addPhotos'),
          <PhotoIcon />,
          () => {
            photoPicker.current.click();
          },
        )}
      {video &&
        button(
          i18n.t('composer:gif'),
          i18n.t('composer:addGif'),
          <GifIcon />,
          () => {
            gifPicker.current.click();
          },
        )}
      {video &&
        button(
          i18n.t('composer:video'),
          i18n.t('composer:addVideo'),
          <VideoIcon />,
          () => {
            videoPicker.current.click();
          },
        )}
      <input
        ref={photoPicker}
        type="file"
        accept={PHOTO_TYPES.join(',')}
        multiple
        hidden
        onChange={choosePhotos}
      />
      <input ref={gifPicker} type="file" accept={ANIMATIONS} hidden onChange={choose} />
      <input ref={videoPicker} type="file" accept={MOVIES} hidden onChange={choose} />
    </>
  );
};

AttachButtons.propTypes = {
  phone: PropTypes.bool.isRequired,
  photos: PropTypes.bool,
  video: PropTypes.bool,
  // Called with the photos picked.
  onPhotos: PropTypes.func.isRequired,
  // Called with the file picked, a GIF or a video.
  onVideo: PropTypes.func.isRequired,
};

export default AttachButtons;
