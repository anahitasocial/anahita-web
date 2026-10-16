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

// A GIF is played as a video: an animation, silent, on a loop. Each button
// opens the system's file window on its own kind of file.
const ANIMATIONS = videos.ANIMATION_TYPES.join(',');
const MOVIES = videos.TYPES.filter((type) => {
  return !videos.ANIMATION_TYPES.includes(type);
}).join(',');

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
  const gifPicker = useRef(null);
  const videoPicker = useRef(null);

  const button = (label, tip, icon, onClick) => {
    if (phone) {
      return (
        <Tooltip title={tip}>
          <IconButton aria-label={tip} onClick={onClick}>
            {icon}
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <Button
        startIcon={icon}
        sx={{ color: 'text.secondary', flexShrink: 0 }}
        onClick={onClick}
      >
        {label}
      </Button>
    );
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
          onPhotos,
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
      <input ref={gifPicker} type="file" accept={ANIMATIONS} hidden onChange={choose} />
      <input ref={videoPicker} type="file" accept={MOVIES} hidden onChange={choose} />
    </>
  );
};

AttachButtons.propTypes = {
  phone: PropTypes.bool.isRequired,
  photos: PropTypes.bool,
  video: PropTypes.bool,
  onPhotos: PropTypes.func.isRequired,
  // Called with the file picked, a GIF or a video.
  onVideo: PropTypes.func.isRequired,
};

export default AttachButtons;
