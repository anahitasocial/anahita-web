import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import PlayIcon from '@mui/icons-material/PlayCircleOutlined';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import api from '../../../api';
import PhotoFilesEditor from '../../../components/PhotoFilesEditor';
import useVideoUpload from './Video/useVideoUpload';
import photoFiles from '../../../utils/photoFiles';
import uploads from '../../../utils/upload';
import utils from '../../../utils';
import videos from '../../../utils/videos';
import i18n from '../../../languages';

const { getPortraitURL } = utils.node;

// How many are asked for at a time.
const LIMIT = 24;

// The picture a post is shown by in the grid: a photo's square, a video's
// poster.
const thumbOf = (post, kind) => {
  if (kind === 'videos') {
    return post.video && post.video.poster ? videos.urlOf(post.video.poster) : '';
  }
  return getPortraitURL(post, 'square') || getPortraitURL(post, 'medium');
};

// One kind of post of somebody's own, newest first, more as it is
// scrolled to the end.
const Grid = ({ kind, ownerId, onPick }) => {
  const [items, setItems] = useState([]);
  const [start, setStart] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const end = useRef(null);

  useEffect(() => {
    let current = true;
    setLoading(true);
    // All of one's own, with what is in the library only (library=1).
    api[kind].browse({
      oid: ownerId, start, limit: LIMIT, library: 1,
    }).then((result) => {
      if (!current) {
        return;
      }
      const page = (result.data && result.data.data) || [];
      setItems((before) => {
        return start === 0 ? page : [...before, ...page];
      });
      setHasMore(page.length >= LIMIT);
    }).catch(() => {
      if (current) {
        setHasMore(false);
      }
    }).finally(() => {
      if (current) {
        setLoading(false);
      }
    });
    return () => {
      current = false;
    };
  }, [kind, ownerId, start]);

  // The end of the grid coming into sight asks for the next page.
  useEffect(() => {
    const target = end.current;
    if (!target || !hasMore || loading || !window.IntersectionObserver) {
      return undefined;
    }
    const watcher = new window.IntersectionObserver((entries) => {
      if (entries.some((entry) => { return entry.isIntersecting; })) {
        setStart(items.length);
      }
    });
    watcher.observe(target);
    return () => {
      watcher.disconnect();
    };
  }, [hasMore, loading, items.length]);

  if (!loading && items.length === 0) {
    return (
      <Typography color="textSecondary" sx={{ p: 3, textAlign: 'center' }}>
        {i18n.t(`composer:library.none.${kind}`)}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 1,
        }}
      >
        {items.map((post) => {
          const thumb = thumbOf(post, kind);
          const name = post.name || i18n.t(`composer:library.untitled.${kind}`);
          return (
            <ButtonBase
              key={`library-${kind}-${post.id}`}
              aria-label={name}
              title={name}
              onClick={() => {
                onPick(post, kind);
              }}
              sx={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'action.hover',
                '&:focus-visible': { outline: 2, outlineColor: 'primary.main' },
              }}
            >
              {thumb &&
                <Box
                  component="img"
                  src={thumb}
                  alt=""
                  loading="lazy"
                  sx={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  }}
                />}
              {kind === 'videos' &&
                <PlayIcon
                  sx={{
                    position: 'absolute',
                    color: 'common.white',
                    fontSize: 40,
                    filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.6))',
                  }}
                />}
            </ButtonBase>
          );
        })}
      </Box>
      <Box
        ref={end}
        sx={{
          display: 'flex', justifyContent: 'center', minHeight: 48, pt: 2,
        }}
      >
        {loading && <CircularProgress size={24} />}
      </Box>
    </Box>
  );
};

Grid.propTypes = {
  kind: PropTypes.oneOf(['photos', 'videos']).isRequired,
  ownerId: PropTypes.number.isRequired,
  onPick: PropTypes.func.isRequired,
};

// Pictures, or a GIF or a video, put up from here: a post in one's media
// library only, listed nowhere and announced to nobody, to be shown in what
// is being written (the user's choice). It is seen by whoever may see the
// writing it is put up for (`access`).
const Upload = ({ viewer, access, onPick }) => {
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  const [items, setItems] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [problem, setProblem] = useState('');
  const upload = useVideoUpload();
  const picker = useRef(null);

  const canVideo = videos.isOn(nodeInfo);
  const ready = items.length > 0 && photoFiles.canSubmit(items);
  const limits = {
    size: videos.megabytes(videos.maxBytes(nodeInfo)),
    minutes: Math.floor(videos.maxSeconds(nodeInfo) / 60),
    animationSize: videos.megabytes(videos.animationMaxBytes(nodeInfo)),
    seconds: videos.animationMaxSeconds(nodeInfo),
  };

  // A video goes in once it is prepared, and is a post then.
  useEffect(() => {
    if (upload.phase === 'ready' && upload.upload && upload.upload.nodeId) {
      onPick(`${window.location.origin}/videos/${upload.upload.nodeId}`);
    }
    if (upload.phase === 'failed') {
      setProblem(i18n.t(`videos:problems.${upload.problem || 'failed'}`, limits));
    }
  }, [upload.phase]);

  const insertPictures = () => {
    setIsSending(true);
    setProblem('');
    api.photos.add({
      name: '',
      body: '',
      access,
      library_only: true,
      uploads: photoFiles.toRequest(items),
    }, viewer).then((result) => {
      onPick(`${window.location.origin}/photos/${result.data.id}`);
    }).catch((failure) => {
      setProblem(i18n.t(uploads.refusalKey(failure)));
    }).finally(() => {
      setIsSending(false);
    });
  };

  const chooseVideo = (event) => {
    const chosen = event.target.files && event.target.files[0];
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
    if (!chosen) {
      return;
    }
    const why = videos.problem(chosen, nodeInfo);
    if (why) {
      setProblem(i18n.t(`videos:problems.${why}`, limits));
      return;
    }
    setProblem('');
    upload.start(viewer, {
      name: '',
      body: '',
      access,
      libraryOnly: true,
    }, chosen);
  };

  const videoBusy = upload.phase === 'uploading' || upload.phase === 'processing';

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="body2" color="textSecondary">
        {i18n.t('composer:library.uploadNote')}
      </Typography>
      {!videoBusy &&
        <>
          <PhotoFilesEditor
            owner={viewer}
            items={items}
            onChange={setItems}
            max={photoFiles.maxFiles(nodeInfo)}
            disabled={isSending}
          />
          {items.length > 0 &&
            <Button
              variant="contained"
              disabled={!ready || isSending}
              onClick={insertPictures}
            >
              {i18n.t('composer:library.insert')}
            </Button>}
        </>}
      {canVideo && items.length === 0 && !videoBusy &&
        <Button
          variant="outlined"
          startIcon={<VideoIcon />}
          onClick={() => {
            picker.current.click();
          }}
        >
          {i18n.t('composer:library.chooseVideo')}
        </Button>}
      {videoBusy &&
        <Stack spacing={1}>
          <LinearProgress
            variant={upload.phase === 'uploading' ? 'determinate' : 'indeterminate'}
            value={upload.percent}
          />
          <Typography variant="body2" color="textSecondary">
            {upload.phase === 'uploading' ?
              i18n.t('videos:upload.keepOpen') :
              i18n.t('composer:library.preparing')}
          </Typography>
          {upload.phase === 'uploading' &&
            <Button onClick={upload.cancel} size="small" sx={{ alignSelf: 'flex-start' }}>
              {i18n.t('videos:upload.cancel')}
            </Button>}
        </Stack>}
      {problem &&
        <Typography variant="caption" color="error" role="alert">
          {problem}
        </Typography>}
      <input
        ref={picker}
        type="file"
        accept={videos.TYPES.join(',')}
        hidden
        onChange={chooseVideo}
      />
    </Stack>
  );
};

Upload.propTypes = {
  viewer: PropTypes.object.isRequired,
  access: PropTypes.string.isRequired,
  onPick: PropTypes.func.isRequired,
};

// One's own photos and videos, to put into what is being written, as
// WordPress's media library is (the user, 2026-10-16). A dialog, full
// screen on a phone. What is picked goes in as its address, an embed.
const MediaLibrary = ({
  open,
  onClose,
  onPick,
  access = 'public',
}) => {
  const viewer = useSelector((state) => { return state.session.viewer; });
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const [tab, setTab] = useState('photos');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={phone}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: phone ? {} : { height: 'calc(100% - 64px)' } } }}
    >
      <Toolbar sx={{ gap: 1, px: 1 }}>
        <IconButton edge="start" aria-label={i18n.t('composer:close')} onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {i18n.t('composer:library.title')}
        </Typography>
      </Toolbar>
      <Tabs
        value={tab}
        onChange={(event, value) => {
          setTab(value);
        }}
        variant="fullWidth"
      >
        <Tab value="photos" label={i18n.t('composer:library.photos')} />
        <Tab value="videos" label={i18n.t('composer:library.videos')} />
        <Tab value="upload" label={i18n.t('composer:library.upload')} />
      </Tabs>
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {open && viewer && viewer.id && tab === 'upload' &&
          <Upload viewer={viewer} access={access} onPick={onPick} />}
        {open && viewer && viewer.id && tab !== 'upload' &&
          <Grid
            key={tab}
            kind={tab}
            ownerId={viewer.id}
            onPick={(post, kind) => {
              onPick(`${window.location.origin}/${kind}/${post.id}`);
            }}
          />}
      </Box>
    </Dialog>
  );
};

MediaLibrary.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  // Called with the address of what was picked.
  onPick: PropTypes.func.isRequired,
  // Who may see what is put up from here: the writing's own audience.
  access: PropTypes.string,
};

export default MediaLibrary;
