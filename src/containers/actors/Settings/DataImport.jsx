import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import UploadIcon from '@mui/icons-material/FileUploadOutlined';

import Progress from '../../../components/Progress';
import actions from '../../../actions';
import api from '../../../api/imports';
import i18n from '../../../languages';
import dataExports from '../../../utils/exports';

// How often an import going on is asked after.
const ASK_EVERY = 5000;

// The kinds a file may list, in the order they are shown.
const KINDS = ['follow', 'block', 'mute', 'save'];

// Why a file could not be read, as the server says it (docs/imports.md in
// anahita-services); anything else is "That could not be done".
const READ_ERRORS = ['empty', 'unreadable', 'too_large', 'too_many_lines', 'not_supported', 'active'];

const isOn = (item) => {
  return Boolean(item) && (item.status === 'ready' || item.status === 'running');
};

const sum = (kinds, field) => {
  return kinds.reduce((total, k) => { return total + (k[field] || 0); }, 0);
};

// "Bring your lists in", under Your data (roadmap row 124): who the viewer
// follows, blocks and mutes, and what they saved, from another Anahita's
// download or a CSV of Mastodon's or Misskey's.
//
// The file is read at once and what is in it shown, a tick for each kind;
// nothing is done until Import. Then the server does each line as the
// viewer would by hand, about one a second, and this says how far it has
// got, and at the end what could not be done, with the list to keep.
const ActorsSettingsDataImport = ({ alertError }) => {
  const [items, setItems] = useState(null);
  const [isAbsent, setIsAbsent] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [chosen, setChosen] = useState({});
  // A CSV with no header: the file, and what the viewer says it lists.
  const [asking, setAsking] = useState(null);
  const [kind, setKind] = useState('follow');
  const [readError, setReadError] = useState('');
  const fileInput = useRef(null);

  const load = () => {
    return api.browse().then((result) => {
      setItems(result.data.data || []);
    }).catch((error) => {
      if (dataExports.isAbsent(error)) {
        setIsAbsent(true);
      }
      setItems((before) => { return before || []; });
    });
  };

  useEffect(() => {
    load();
  }, []);

  const shown = (items || [])[0] || null;
  const isRunning = Boolean(shown) && shown.status === 'running';

  // Every kind ticked to begin with, for a file just read.
  useEffect(() => {
    if (shown && shown.status === 'ready') {
      const all = {};
      shown.kinds.forEach((k) => { all[k.kind] = true; });
      setChosen(all);
    }
  }, [shown && shown.id, shown && shown.status]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }
    const timer = setInterval(load, ASK_EVERY);
    return () => { clearInterval(timer); };
  }, [isRunning]);

  const read = (file, saidKind = '') => {
    setIsWorking(true);
    setReadError('');
    api.add(file, saidKind).then(() => {
      setAsking(null);
      return load();
    }).catch((error) => {
      const code = error && error.response && error.response.data && error.response.data.error;
      if (code === 'kind_unknown') {
        setAsking(file);
      } else {
        setAsking(null);
        setReadError(READ_ERRORS.includes(code) ? code : 'failed');
        if (code === 'active') {
          load();
        }
      }
    }).finally(() => {
      setIsWorking(false);
      if (fileInput.current) {
        fileInput.current.value = '';
      }
    });
  };

  const start = () => {
    const kinds = KINDS.filter((k) => { return chosen[k]; });
    setIsWorking(true);
    api.start(shown.id, kinds).then(load).catch(() => {
      alertError(i18n.t('settings:dataImport.errors.failed'));
      load();
    }).finally(() => {
      setIsWorking(false);
    });
  };

  const cancel = () => {
    setIsWorking(true);
    api.deleteItem(shown.id).then(load).catch(() => {
      alertError(i18n.t('settings:dataImport.errors.failed'));
    }).finally(() => {
      setIsWorking(false);
    });
  };

  // What could not be done, saved as a file.
  const saveFailed = () => {
    api.failed(shown.id).then((result) => {
      const url = URL.createObjectURL(result.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'not-imported.csv';
      link.click();
      URL.revokeObjectURL(url);
    }).catch(() => {
      alertError(i18n.t('settings:dataImport.errors.failed'));
    });
  };

  const kinds = (shown && shown.kinds) || [];
  const chosenKinds = kinds.filter((k) => { return k.skipped < k.total; });
  const total = sum(chosenKinds, 'total') - sum(chosenKinds, 'skipped');
  const finished = sum(kinds, 'done') + sum(kinds, 'already') + sum(kinds, 'failed');
  const failed = sum(kinds, 'failed');
  const isReady = Boolean(shown) && shown.status === 'ready';
  const isDone = Boolean(shown) && shown.status === 'done';
  const canChoose = items && !isAbsent && !isOn(shown) && !asking;

  return (
    <Card>
      <CardHeader title={i18n.t('settings:dataImport.title')} />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('settings:dataImport.about')}
        </Typography>
        {!items && <Progress />}
        {isAbsent &&
          <Alert severity="info" sx={{ mt: 2 }}>
            {i18n.t('settings:dataImport.absent')}
          </Alert>}
        {readError &&
          <Alert severity="error" sx={{ mt: 2 }}>
            {i18n.t(`settings:dataImport.errors.${readError}`)}
          </Alert>}
        {asking &&
          <TextField
            select
            size="small"
            label={i18n.t('settings:dataImport.whatKind')}
            value={kind}
            onChange={(event) => { setKind(event.target.value); }}
            disabled={isWorking}
            fullWidth
            sx={{ mt: 2 }}
          >
            {KINDS.map((k) => {
              return (
                <MenuItem key={`import-kind-${k}`} value={k}>
                  {i18n.t(`settings:dataImport.kindOf.${k}`)}
                </MenuItem>
              );
            })}
          </TextField>}
        {isReady &&
          <FormGroup sx={{ mt: 2 }}>
            {kinds.map((k) => {
              return (
                <FormControlLabel
                  key={`import-${k.kind}`}
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(chosen[k.kind])}
                      onChange={(event) => {
                        setChosen((before) => {
                          return { ...before, [k.kind]: event.target.checked };
                        });
                      }}
                    />
                  }
                  label={i18n.t(`settings:dataImport.kinds.${k.kind}`, { count: k.total })}
                  disabled={isWorking}
                />
              );
            })}
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {i18n.t('settings:dataImport.howItIsDone')}
            </Typography>
          </FormGroup>}
        {isRunning &&
          <Stack spacing={1} sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={total > 0 ? Math.min(100, (100 * finished) / total) : 0}
            />
            <Typography variant="body2">
              {i18n.t('settings:dataImport.running', { done: finished, total })}
            </Typography>
          </Stack>}
        {isDone && !readError &&
          <Alert severity={failed > 0 ? 'warning' : 'success'} sx={{ mt: 2 }}>
            {failed > 0 ?
              i18n.t('settings:dataImport.doneSome', { count: failed }) :
              i18n.t('settings:dataImport.doneAll')}
          </Alert>}
      </CardContent>
      {items && !isAbsent &&
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          {/* Every button here full width, alone or in a pair, as in the
              card above it (the user, 2026-11-08). */}
          {(isOn(shown) || asking) &&
            <Button
              fullWidth
              disabled={isWorking}
              onClick={asking ? () => { setAsking(null); } : cancel}
            >
              {i18n.t('actions:cancel')}
            </Button>}
          {isReady &&
            <Button
              fullWidth
              variant="contained"
              disabled={isWorking || !KINDS.some((k) => { return chosen[k]; })}
              onClick={start}
            >
              {i18n.t('settings:dataImport.import')}
            </Button>}
          {asking &&
            <Button
              fullWidth
              variant="contained"
              disabled={isWorking}
              onClick={() => { read(asking, kind); }}
            >
              {i18n.t('actions:continue')}
            </Button>}
          {isDone && failed > 0 && canChoose &&
            <Button fullWidth onClick={saveFailed}>
              {i18n.t('settings:dataImport.failedList')}
            </Button>}
          {canChoose &&
            <Button
              fullWidth
              variant="contained"
              startIcon={<UploadIcon />}
              disabled={isWorking}
              onClick={() => {
                if (fileInput.current) {
                  fileInput.current.click();
                }
              }}
            >
              {i18n.t('actions:upload')}
            </Button>}
        </CardActions>}
      <input
        ref={fileInput}
        type="file"
        accept=".zip,.csv,application/zip,text/csv"
        hidden
        onChange={(event) => {
          const file = event.target.files && event.target.files[0];
          if (file) {
            read(file);
          }
        }}
      />
    </Card>
  );
};

ActorsSettingsDataImport.propTypes = {
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(ActorsSettingsDataImport);
