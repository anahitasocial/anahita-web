import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import BackIcon from '@mui/icons-material/ArrowBack';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';

import ResolveDialog from './ResolveDialog';
import target from './target';

const { getURL } = utils.node;

const formatDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

const resolveError = (err, fallbackKey) => {
  const code = err && err.response && err.response.data && err.response.data.error;

  switch (code) {
    case 'already_decided':
      return i18n.t('abuseReports:adminErrors.alreadyDecided');
    case 'newer_case_open':
      return i18n.t('abuseReports:adminErrors.newerCaseOpen');
    case 'already_open':
      return i18n.t('abuseReports:adminErrors.alreadyOpen');
    default:
      return i18n.t(fallbackKey);
  }
};

// One case: what was reported, who reported it and why, what was decided,
// and the earlier cases the same thing has had.
//
// Nothing here deletes or disables anything. "View" goes to the thing
// itself, where the controls that do that live, with their own
// confirmations and their own rules about who may use them. This page
// records the decision.
const ReportsCase = ({
  id,
  alertError,
  alertSuccess,
  readAdminCounts,
}) => {
  const [item, setItem] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [resolving, setResolving] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCase = useCallback(() => {
    setIsFetching(true);

    return api.abuseReports.readCase(id, i18n.language)
      .then(({ data }) => {
        setItem(data);
      })
      .catch((err) => {
        const status = err && err.response && err.response.status;
        if (status === 404 || status === 400) {
          setNotFound(true);
          return;
        }
        alertError(i18n.t('abuseReports:case.loadError'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [alertError, id]);

  useEffect(() => {
    setItem(null);
    setNotFound(false);
    fetchCase();
  }, [fetchCase]);

  // After any decision: the page, and the number on the menu and the tab.
  const refresh = () => {
    readAdminCounts();
    return fetchCase();
  };

  const handleResolve = (decision) => {
    setSubmitting(true);

    api.abuseReports.resolve(id, decision)
      .then(() => {
        setResolving('');
        alertSuccess(decision.status === 'dismissed' ?
          i18n.t('abuseReports:adminAlerts.dismissed') :
          i18n.t('abuseReports:adminAlerts.actioned'));
      })
      .catch((err) => {
        setResolving('');
        alertError(resolveError(err, 'abuseReports:adminErrors.resolve'));
      })
      // Either way the page may be out of date: somebody else may have
      // decided it first.
      .then(refresh)
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleReopen = () => {
    setSubmitting(true);

    api.abuseReports.reopen(id)
      .then(() => {
        alertSuccess(i18n.t('abuseReports:adminAlerts.reopened'));
      })
      .catch((err) => {
        alertError(resolveError(err, 'abuseReports:adminErrors.reopen'));
      })
      .then(refresh)
      .finally(() => {
        setSubmitting(false);
      });
  };

  const back = (
    <Box sx={{ mb: 1 }}>
      <Button component={RouterLink} to="/admin/reports" startIcon={<BackIcon />}>
        {i18n.t('abuseReports:case.back')}
      </Button>
    </Box>
  );

  if (notFound) {
    return (
      <>
        {back}
        <Card>
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('abuseReports:case.notFound')}
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!item) {
    return (
      <>
        {back}
        {isFetching && <LinearProgress />}
      </>
    );
  }

  const isOpen = item.status === 'open';
  const targetUrl = target.url(item);
  const body = target.body(item);
  const statusLabel = i18n.t(`abuseReports:statuses.${item.status}`);

  return (
    <>
      {back}
      {isFetching && <LinearProgress />}

      {/* What was reported */}
      <Box sx={{ mb: 2 }}>
        <Card>
          <CardHeader
            title={target.title(item)}
            subheader={
              <>
                {target.kind(item.targetType)}
                {item.targetOwner && item.targetOwner.id !== item.targetId &&
                  <>
                    {' · '}
                    <Link component={RouterLink} to={getURL(item.targetOwner)}>
                      {i18n.t('abuseReports:list.by', { name: item.targetOwner.name })}
                    </Link>
                  </>}
              </>
            }
            action={<Chip label={statusLabel} color={isOpen ? 'primary' : 'default'} />}
            slotProps={{
              title: { variant: 'h6' },
            }}
          />
          {(body || item.targetGone) &&
            <CardContent>
              {body &&
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {body}
                </Typography>}
              {item.targetGone &&
                <Typography variant="body2" color="textSecondary">
                  {i18n.t('abuseReports:case.targetGoneHint')}
                </Typography>}
            </CardContent>}
          {targetUrl &&
            <>
              <Divider />
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t('abuseReports:case.openHint')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to={targetUrl} color="primary">
                  {i18n.t('abuseReports:case.open')}
                </Button>
              </CardActions>
            </>}
        </Card>
      </Box>

      {/* The decision, or the buttons that make one */}
      <Box sx={{ mb: 2 }}>
        <Card>
          <CardHeader
            title={i18n.t('abuseReports:case.decision')}
            slotProps={{
              title: { variant: 'h6' },
            }}
          />
          {!isOpen &&
            <CardContent>
              <Typography variant="body2">
                {item.decidedBy ?
                  i18n.t('abuseReports:case.decidedBy', {
                    status: statusLabel,
                    name: item.decidedBy.name,
                    date: formatDateTime(item.decidedAt),
                  }) :
                  i18n.t('abuseReports:case.decidedAutomatically', {
                    status: statusLabel,
                    date: formatDateTime(item.decidedAt),
                  })}
              </Typography>
              {item.decisionAction &&
                <Typography variant="body2" color="textSecondary">
                  {i18n.t(`abuseReports:actions.${item.decisionAction}`)}
                </Typography>}
              {item.decisionNote &&
                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {`${i18n.t('abuseReports:case.note')}: ${item.decisionNote}`}
                </Typography>}
            </CardContent>}
          <CardActions>
            {isOpen &&
              <>
                <Button
                  fullWidth
                  disabled={submitting}
                  onClick={() => {
                    setResolving('dismissed');
                  }}
                >
                  {i18n.t('abuseReports:resolve.dismiss')}
                </Button>
                <Button
                  fullWidth
                  color="primary"
                  variant="contained"
                  disabled={submitting}
                  onClick={() => {
                    setResolving('actioned');
                  }}
                >
                  {i18n.t('abuseReports:resolve.action')}
                </Button>
              </>}
            {/* Nothing to reopen once the thing itself is gone. */}
            {!isOpen && !item.targetGone &&
              <Button disabled={submitting} onClick={handleReopen}>
                {i18n.t('abuseReports:resolve.reopen')}
              </Button>}
          </CardActions>
        </Card>
      </Box>

      {/* Who reported it, and why */}
      <Box sx={{ mb: 2 }}>
        <Card>
          <CardHeader
            title={i18n.t('abuseReports:case.reports')}
            subheader={i18n.t('abuseReports:list.reports', { count: item.reportCount })}
            slotProps={{
              title: { variant: 'h6' },
            }}
          />
          <Divider />
          <List disablePadding>
            {(item.reports || []).map((report) => {
              return (
                <ListItem key={report.id} divider alignItems="flex-start">
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography variant="subtitle2">
                        {report.reporter ?
                          <Link component={RouterLink} to={getURL(report.reporter)}>
                            {report.reporter.name}
                          </Link> :
                          `#${report.reporterId}`}
                        {` · ${report.reasonLabel}`}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {report.details || i18n.t('abuseReports:case.noDetails')}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {i18n.t('abuseReports:case.reportedOn', {
                            date: formatDateTime(report.createdAt),
                          })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Card>
      </Box>

      {/* The same thing, reported before */}
      {item.previous && item.previous.length > 0 &&
        <Card>
          <CardHeader
            title={i18n.t('abuseReports:case.previous')}
            slotProps={{
              title: { variant: 'h6' },
            }}
          />
          <Divider />
          <List disablePadding>
            {item.previous.map((earlier) => {
              return (
                <ListItemButton
                  key={earlier.id}
                  component={RouterLink}
                  to={`/admin/reports/${earlier.id}`}
                  divider
                >
                  <ListItemText
                    primary={`${i18n.t(`abuseReports:statuses.${earlier.status}`)} · ${i18n.t('abuseReports:list.reports', { count: earlier.reportCount })}`}
                    secondary={formatDateTime(earlier.firstReportedAt)}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Card>}

      {resolving &&
        <ResolveDialog
          status={resolving}
          submitting={submitting}
          onClose={() => {
            setResolving('');
          }}
          onConfirm={handleResolve}
        />}
    </>
  );
};

ReportsCase.propTypes = {
  id: PropTypes.string.isRequired,
  alertError: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  readAdminCounts: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    readAdminCounts: () => {
      return dispatch(actions.admin.readCounts());
    },
  };
};

export default connect(null, mapDispatchToProps)(ReportsCase);
