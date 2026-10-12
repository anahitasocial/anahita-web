import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import VideoIcon from '@mui/icons-material/Videocam';

import actions from '../../../../actions';
import api from '../../../../api/videos';
import audience from '../../../../utils/audience';
import postLanguage from '../../../../utils/postLanguage';
import replyAccess from '../../../../utils/replyAccess';
import videos from '../../../../utils/videos';
import LanguageButton from '../../../../components/LanguageButton';
import ReplyAccessButton from '../../../../components/ReplyAccessButton';
import ComposerAudience from '../Audience';
import useVideoUpload, { failureOf } from './useVideoUpload';

import ActorType from '../../../../proptypes/Actor';
import PersonType from '../../../../proptypes/Person';
import NodeInfoType from '../../../../proptypes/NodeInfo';
import { Medium as MEDIUM } from '../../../../constants';
import i18n from '../../../../languages';

const { NAME, BODY } = MEDIUM.FIELDS;

// The composer for a video post.
//
// Not like the others: a video is too big to be sent with the post. It is
// sent to storage in parts, with the page kept open, and then prepared by
// the server, which makes the post when it is ready. So posting has three
// stages, each shown: uploading, with how far along; preparing, when the
// page can be left; and posted.
//
// Videos handed over earlier and still being prepared, or that failed in
// the last day, are listed under it.
const ComposerVideo = ({
  actor,
  viewer,
  nodeInfo = null,
  alertError,
  alertSuccess,
}) => {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [nameError, setNameError] = useState('');
  const picker = useRef(null);
  const upload = useVideoUpload();

  const [access, setAccess] = useState(() => {
    return audience.defaultFor(actor, viewer);
  });
  useEffect(() => {
    setAccess(audience.defaultFor(actor, viewer));
  }, [actor.id, actor.access, viewer.id]);

  const [language, setLanguage] = useState(() => {
    return postLanguage.defaultFor(viewer);
  });
  const [whoReplies, setWhoReplies] = useState(replyAccess.ANYONE);
  const [whoQuotes, setWhoQuotes] = useState('');

  // What was handed over before this page was opened.
  const [earlier, setEarlier] = useState([]);
  const loadEarlier = () => {
    api.browse().then((result) => {
      setEarlier(result.data.data || []);
    }).catch(() => {
      // Not shown. Nothing here depends on it.
    });
  };
  useEffect(loadEarlier, [viewer.id]);

  // Asked after for as long as any of them is being prepared.
  const preparing = earlier.some((item) => {
    return item.status === 'processing';
  });
  useEffect(() => {
    if (!preparing) {
      return undefined;
    }
    const timer = setInterval(loadEarlier, 8000);
    return () => {
      clearInterval(timer);
    };
  }, [preparing]);

  const limits = {
    size: videos.megabytes(videos.maxBytes(nodeInfo)),
    minutes: Math.floor(videos.maxSeconds(nodeInfo) / 60),
  };
  const busy = upload.phase === 'uploading';

  useEffect(() => {
    if (upload.phase === 'ready') {
      alertSuccess(i18n.t('videos:upload.ready'));
    }
    if (upload.phase === 'failed') {
      alertError(i18n.t(`videos:problems.${upload.problem || 'failed'}`, limits));
    }
  }, [upload.phase]);

  const handleFile = (event) => {
    const chosen = event.target.files && event.target.files[0];
    // The same file can be chosen again after it is taken off.
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
    if (!chosen) {
      return;
    }
    const problem = videos.problem(chosen, nodeInfo);
    if (problem) {
      alertError(i18n.t(`videos:problems.${problem}`, limits));
      return;
    }
    setFile(chosen);
    if (upload.phase !== 'idle') {
      upload.reset();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = name.trim();
    if (title.length < NAME.MIN_LENGTH) {
      setNameError(i18n.t('prompts:form.required', { defaultValue: ' ' }));
      return;
    }
    if (!file) {
      alertError(i18n.t('videos:problems.none'));
      return;
    }

    upload.start(actor, {
      name: title,
      body,
      access,
      language,
      ...replyAccess.toRequest(whoReplies),
      ...(whoQuotes ? { quote_policy: whoQuotes } : {}),
    }, file).then((handedOver) => {
      if (!handedOver) {
        return;
      }
      postLanguage.remember(viewer, language);
      audience.remember(actor, viewer, access);
      setName('');
      setBody('');
      setFile(null);
      setWhoReplies(replyAccess.ANYONE);
      setWhoQuotes('');
    });
  };

  const dismiss = (item) => {
    api.cancel(item).catch(() => {}).then(loadEarlier);
  };

  // The one being sent now is shown above, not in the list as well.
  const listed = earlier.filter((item) => {
    return !upload.upload || item.id !== upload.upload.id;
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardContent>
          <input
            ref={picker}
            type="file"
            accept={videos.TYPES.join(',')}
            hidden
            onChange={handleFile}
          />
          <Button
            variant="outlined"
            startIcon={<VideoIcon />}
            disabled={busy}
            fullWidth
            onClick={() => {
              picker.current.click();
            }}
          >
            {i18n.t(file ? 'videos:composer.change' : 'videos:composer.choose')}
          </Button>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
            {file ?
              `${file.name} · ${videos.megabytes(file.size)}` :
              i18n.t('videos:composer.limits', limits)}
          </Typography>
          <TextField
            variant="outlined"
            name="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError('');
            }}
            label={i18n.t('videos:composer.name')}
            placeholder={i18n.t('videos:composer.namePlaceholder')}
            error={nameError !== ''}
            fullWidth
            margin="normal"
            disabled={busy}
            required
            slotProps={{
              htmlInput: { dir: 'auto', maxLength: NAME.MAX_LENGTH },
              inputLabel: { shrink: true },
            }}
          />
          <TextField
            variant="outlined"
            name="body"
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
            }}
            label={i18n.t('videos:composer.body')}
            placeholder={i18n.t('videos:composer.bodyPlaceholder')}
            multiline
            fullWidth
            margin="normal"
            disabled={busy}
            slotProps={{
              htmlInput: { dir: 'auto', maxLength: BODY.MAX_LENGTH },
              inputLabel: { shrink: true },
            }}
          />
          {upload.phase === 'uploading' &&
            <Stack spacing={1} sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={upload.percent}
                aria-label={i18n.t('videos:upload.uploading', { percent: upload.percent })}
              />
              <Typography variant="body2">
                {i18n.t('videos:upload.uploading', { percent: upload.percent })}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {i18n.t('videos:upload.keepOpen')}
              </Typography>
            </Stack>}
          {upload.phase === 'processing' &&
            <Stack spacing={1} sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2">
                {i18n.t('videos:upload.processing')}
              </Typography>
            </Stack>}
          {upload.phase === 'ready' && upload.upload &&
            <Alert
              severity="success"
              sx={{ mt: 2 }}
              action={
                <Button color="inherit" size="small" href={`/videos/${upload.upload.nodeId}`}>
                  {i18n.t('videos:upload.view')}
                </Button>
              }
            >
              {i18n.t('videos:upload.ready')}
            </Alert>}
          {upload.phase === 'failed' &&
            <Alert severity="error" sx={{ mt: 2 }}>
              {i18n.t(`videos:problems.${upload.problem || 'failed'}`, limits)}
            </Alert>}
        </CardContent>
        <CardActions>
          {!busy &&
            <>
              <ComposerAudience
                actor={actor}
                viewer={viewer}
                value={access}
                onChange={setAccess}
              />
              <LanguageButton value={language} onChange={setLanguage} />
              <ReplyAccessButton
                value={whoReplies}
                onChange={setWhoReplies}
                quotePolicy={whoQuotes}
                defaultQuotePolicy={viewer.quotePolicy}
                onQuotePolicyChange={setWhoQuotes}
              />
            </>}
          {busy &&
            <Button onClick={upload.cancel} fullWidth>
              {i18n.t('videos:upload.cancel')}
            </Button>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={busy || !file}
            fullWidth
          >
            {i18n.t('videos:composer.upload')}
          </Button>
        </CardActions>
        {listed.length > 0 &&
          <CardContent sx={{ pt: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {i18n.t('videos:upload.title')}
            </Typography>
            <Stack spacing={1}>
              {listed.map((item) => {
                return (
                  <Stack
                    key={`video-upload-${item.id}`}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap>
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={item.status === 'failed' ? 'error' : 'textSecondary'}
                      >
                        {item.status === 'processing' && i18n.t('videos:upload.processing')}
                        {item.status === 'uploading' && i18n.t('videos:upload.interrupted')}
                        {item.status === 'failed' &&
                          i18n.t(`videos:problems.${failureOf(item)}`, limits)}
                      </Typography>
                    </Stack>
                    {item.status === 'ready' &&
                      <Link href={`/videos/${item.nodeId}`}>
                        {i18n.t('videos:upload.view')}
                      </Link>}
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => {
                        dismiss(item);
                      }}
                    >
                      {i18n.t(item.status === 'failed' ?
                        'videos:upload.dismiss' :
                        'videos:upload.cancel')}
                    </Button>
                  </Stack>
                );
              })}
            </Stack>
          </CardContent>}
      </Card>
    </form>
  );
};

ComposerVideo.propTypes = {
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  nodeInfo: NodeInfoType,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
    nodeInfo: state.app.nodeInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ComposerVideo);
