import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import i18n from '../../../languages';
import utils from '../../../utils';
import target from './target';

const { getURL } = utils.node;

// The title of each card of a case, small as inside every card.
export const CARD_TITLE = {
  title: { variant: 'subtitle1', sx: { fontWeight: 500 } },
};

const formatDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(i18n.language);
};

// The decision on a case, or the two buttons that make one, with what each
// choice means in a line beside them. A decided case can be opened again,
// unless what it is about is gone.
export const CaseDecision = ({ report }) => {
  const {
    item,
    submitting,
    ask,
    reopen,
  } = report;
  const isOpen = item.status === 'open';
  const statusLabel = i18n.t(`abuseReports:statuses.${item.status}`);

  return (
    <Box sx={{ mb: 2 }}>
      <Card>
        <CardHeader
          title={i18n.t('abuseReports:case.decision')}
          slotProps={CARD_TITLE}
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
        {/* What each choice means, beside two short buttons. */}
        {isOpen &&
          <CardContent sx={{ pt: 0 }}>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('abuseReports:resolve.hint')}
            </Typography>
          </CardContent>}
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          {isOpen &&
            <>
              <Button
                fullWidth
                disabled={submitting}
                onClick={() => {
                  ask('dismissed');
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
                  ask('actioned');
                }}
              >
                {i18n.t('abuseReports:resolve.action')}
              </Button>
            </>}
          {/* Nothing to reopen once the thing itself is gone. */}
          {!isOpen && !item.targetGone &&
            <Button fullWidth disabled={submitting} onClick={reopen}>
              {i18n.t('abuseReports:resolve.reopen')}
            </Button>}
        </CardActions>
      </Card>
    </Box>
  );
};

CaseDecision.propTypes = {
  // What useCase gives.
  report: PropTypes.object.isRequired,
};

// Who reported it and why, and the same thing reported before, each earlier
// case leading to its own page.
export const CaseReports = ({ item }) => {
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Card>
          <CardHeader
            title={i18n.t('abuseReports:case.reports')}
            subheader={i18n.t('abuseReports:list.reports', { count: item.reportCount })}
            slotProps={CARD_TITLE}
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
                            {report.reporter.name || `@${report.reporter.alias}`}
                          </Link> :
                          `#${report.reporterId}`}
                        {` · ${target.reasonOf(report)}`}
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

      {item.previous && item.previous.length > 0 &&
        <Card>
          <CardHeader
            title={i18n.t('abuseReports:case.previous')}
            slotProps={CARD_TITLE}
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
    </>
  );
};

CaseReports.propTypes = {
  // The case, as the server sent it.
  item: PropTypes.object.isRequired,
};
