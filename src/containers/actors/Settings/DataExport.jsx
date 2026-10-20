import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';

import StepUp from '../../auth/StepUp';
import Progress from '../../../components/Progress';
import actions from '../../../actions';
import api from '../../../api/exports';
import i18n from '../../../languages';
import dataExports from '../../../utils/exports';

// How often an export being made is asked after.
const ASK_EVERY = 5000;

// "Download your data", in the viewer's own settings: a copy of everything
// they wrote and posted, and who they follow, as one file.
//
// Asking needs them to have just proved who they are, since the file holds
// what only they may see. It is then made by the server, which can take a
// while; this page says how it is getting on, and offers the file for as
// long as it is kept.
const ActorsSettingsDataExport = ({ alertSuccess, alertError }) => {
  const [items, setItems] = useState(null);
  const [nextAt, setNextAt] = useState('');
  const [days, setDays] = useState({ every: 7, keep: 7 });
  const [isAbsent, setIsAbsent] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [stepUpOpen, setStepUpOpen] = useState(false);

  const load = () => {
    return api.browse().then((result) => {
      setItems(result.data.data || []);
      setNextAt(result.data.nextAt || '');
      setDays({
        every: Number(result.data.everyDays) || 0,
        keep: Number(result.data.keepDays) || 7,
      });
    }).catch((error) => {
      if (dataExports.isAbsent(error)) {
        setIsAbsent(true);
      }
      setItems((before) => {
        return before || [];
      });
    });
  };

  useEffect(() => {
    load();
  }, []);

  const shown = dataExports.current(items || []);
  const isActive = dataExports.isActive(shown);

  // Asked after for as long as one is being made.
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    const timer = setInterval(load, ASK_EVERY);
    return () => {
      clearInterval(timer);
    };
  }, [isActive]);

  const ask = () => {
    setIsWorking(true);
    api.add().then(() => {
      alertSuccess(i18n.t('settings:dataExport.asked'));
      return load();
    }).catch((error) => {
      const status = error && error.response && error.response.status;
      const code = error && error.response && error.response.data && error.response.data.error;

      if (status === 403 && code === 'step_up_required') {
        setStepUpOpen(true);
      } else if (status === 409 || status === 429) {
        // Something changed since the page was read: read it again.
        load();
      } else {
        alertError(i18n.t('settings:dataExport.failed'));
      }
    }).finally(() => {
      setIsWorking(false);
    });
  };

  // The address of the file is good for a few minutes, so a fresh one is
  // asked for at the press and not taken from when the page was read.
  const download = (item) => {
    setIsWorking(true);
    api.read(item.id).then((result) => {
      if (result.data.downloadUrl) {
        window.location.assign(result.data.downloadUrl);
      } else {
        load();
      }
    }).catch(() => {
      alertError(i18n.t('settings:dataExport.failed'));
    }).finally(() => {
      setIsWorking(false);
    });
  };

  const remove = (item) => {
    setIsWorking(true);
    api.remove(item.id).then(load).catch(() => {
      alertError(i18n.t('settings:dataExport.failed'));
    }).finally(() => {
      setIsWorking(false);
    });
  };

  const canAsk = !isAbsent && dataExports.canAsk(items || [], nextAt);

  return (
    <Card>
      <CardHeader title={i18n.t('settings:dataExport.title')} />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('settings:dataExport.about', { count: days.keep })}
        </Typography>
        {!items && <Progress />}
        {isAbsent &&
          <Alert severity="info" sx={{ mt: 2 }}>
            {i18n.t('settings:dataExport.absent')}
          </Alert>}
        {isActive &&
          <Stack spacing={1} sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2">
              {i18n.t('settings:dataExport.making')}
            </Typography>
          </Stack>}
        {dataExports.isReady(shown) &&
          <Alert severity="success" sx={{ mt: 2 }}>
            {i18n.t('settings:dataExport.ready', {
              size: dataExports.size(shown.sizeBytes),
              day: dataExports.day(shown.expiresAt, i18n.language),
            })}
          </Alert>}
        {shown && shown.status === 'failed' &&
          <Alert severity="error" sx={{ mt: 2 }}>
            {i18n.t('settings:dataExport.couldNot')}
          </Alert>}
        {items && !isAbsent && !canAsk && !isActive && nextAt &&
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {i18n.t('settings:dataExport.nextAt', { day: dataExports.day(nextAt, i18n.language) })}
          </Typography>}
      </CardContent>
      {items && !isAbsent &&
        <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
          {(isActive || dataExports.isReady(shown)) &&
            <Button
              fullWidth
              disabled={isWorking}
              onClick={() => {
                remove(shown);
              }}
            >
              {i18n.t(isActive ? 'actions:cancel' : 'actions:delete')}
            </Button>}
          {dataExports.isReady(shown) &&
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              disabled={isWorking}
              onClick={() => {
                download(shown);
              }}
            >
              {i18n.t('actions:download')}
            </Button>}
          {!isActive && !dataExports.isReady(shown) &&
            <Button
              fullWidth
              variant="contained"
              disabled={isWorking || !canAsk}
              onClick={ask}
            >
              {i18n.t('settings:dataExport.ask')}
            </Button>}
        </CardActions>}
      <StepUp
        open={stepUpOpen}
        onVerified={() => {
          setStepUpOpen(false);
          ask();
        }}
        onCancel={() => {
          return setStepUpOpen(false);
        }}
      />
    </Card>
  );
};

ActorsSettingsDataExport.propTypes = {
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
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

export default connect(null, mapDispatchToProps)(ActorsSettingsDataExport);
