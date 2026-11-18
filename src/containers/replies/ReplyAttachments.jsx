import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import GifIcon from '@mui/icons-material/GifBoxOutlined';
import PhotoIcon from '@mui/icons-material/Photo';
import RemoveIcon from '@mui/icons-material/Close';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import ContentWarningButton from '../../components/ContentWarningButton';
import PhotoFilesEditor from '../../components/PhotoFilesEditor';
import i18n from '../../languages';
import { PHOTO_TYPES } from '../../utils/preparePhoto';
import videos from '../../utils/videos';

// What a new reply carries besides its words, under the box it is written
// in: its pictures, being uploaded and described; or its GIF or video; and
// the buttons that add them, with the content warning's. `form` is what
// useReplyForm gives.
//
// Pictures or a video, one or the other: the button for the other goes
// while one is there.
const ReplyAttachments = ({ form, attachments, compact }) => {
  const picker = useRef(null);
  const photoPicker = useRef(null);
  const {
    viewer, isSending, video,
  } = form;

  return (
    <>
      {attachments && form.isAddingPhotos && viewer && viewer.id &&
        <Box sx={{ mt: 1 }}>
          <PhotoFilesEditor
            owner={viewer}
            items={form.photoItems}
            incoming={form.incoming}
            onIncomingTaken={form.takeIncoming}
            onChange={form.setPhotoItems}
            max={form.photosMax}
            disabled={isSending}
          />
        </Box>}
      {video &&
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1, mt: 1,
        }}
        >
          <VideoIcon fontSize="small" color="action" />
          <Typography variant="body2" sx={{ flexGrow: 1, overflowWrap: 'anywhere' }}>
            {`${video.name} · ${videos.megabytes(video.size)}`}
          </Typography>
          <IconButton
            size="small"
            disabled={isSending}
            aria-label={i18n.t('replies:attachments.removeVideo')}
            title={i18n.t('replies:attachments.removeVideo')}
            onClick={form.removeVideo}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Box>}
      {form.videoProblem &&
        <Typography variant="caption" color="error" component="p" role="alert" sx={{ mt: 1 }}>
          {form.videoProblem}
        </Typography>}
      {(form.canAddPhotos || form.canAddVideo) && !compact && !isSending &&
        <Box sx={{
          display: 'flex', gap: 0.5, mt: 0.5, ml: -1,
        }}
        >
          {form.canAddPhotos && !video && !form.isAddingPhotos &&
            <Tooltip title={i18n.t('replies:attachments.addPhotos')}>
              <IconButton
                size="small"
                aria-label={i18n.t('replies:attachments.addPhotos')}
                onClick={() => {
                  // One tap to the mobile's own picker, for several.
                  photoPicker.current.click();
                }}
              >
                <PhotoIcon fontSize="small" />
              </IconButton>
            </Tooltip>}
          {form.canAddVideo && !form.hasPhotos && !form.isAddingPhotos && !video &&
            <Tooltip title={i18n.t('replies:attachments.addVideo')}>
              <IconButton
                size="small"
                aria-label={i18n.t('replies:attachments.addVideo')}
                onClick={() => {
                  form.startPickingVideo();
                  picker.current.click();
                }}
              >
                <GifIcon fontSize="small" />
              </IconButton>
            </Tooltip>}
          <ContentWarningButton
            value={form.warning}
            onChange={form.setWarning}
            disabled={isSending}
          />
          {/* The same file can be chosen again after it is taken off: each
              picker is emptied as soon as it has handed its files over. */}
          <input
            ref={photoPicker}
            type="file"
            accept={PHOTO_TYPES.join(',')}
            multiple
            hidden
            onChange={(event) => {
              const chosen = Array.from(event.target.files || []);
              // eslint-disable-next-line no-param-reassign
              event.target.value = '';
              form.pickPhotos(chosen);
            }}
          />
          <input
            ref={picker}
            type="file"
            accept={videos.PICKER}
            hidden
            onChange={(event) => {
              const chosen = event.target.files && event.target.files[0];
              // eslint-disable-next-line no-param-reassign
              event.target.value = '';
              form.pickVideo(chosen);
            }}
          />
        </Box>}
    </>
  );
};

ReplyAttachments.propTypes = {
  // What useReplyForm gives.
  form: PropTypes.object.isRequired,
  // Whether pictures or a video can be added: for a new reply.
  attachments: PropTypes.bool.isRequired,
  // The one line of ReplyBox, which offers none of the buttons.
  compact: PropTypes.bool.isRequired,
};

export default ReplyAttachments;
