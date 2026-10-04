import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ReportsIcon from '@mui/icons-material/Flag';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';

import target from './target';

const STATUSES = ['open', 'actioned', 'dismissed'];
const PAGE_SIZE = 20;

// The filter's value for "every reason". Not '', which a select shows as
// nothing chosen.
const ANY_REASON = 'any';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

// The cases, by status and, if wanted, by a reason somebody gave. Open
// ones are the work; the other two statuses are the record of what was
// decided.
//
// The filters are select lists rather than a row of buttons: three
// buttons already crowd a phone's width, and a list of sixteen reasons
// could not be buttons at any width.
//
// More cases are fetched by a "Show more" button that adds to the list,
// not by pages. The open list shrinks as it is worked through, and with
// pages every case closed would shift the rest up and hide one behind
// the page boundary.
const ReportsList = ({
  alertError,
}) => {
  const [status, setStatus] = useState('open');
  const [reason, setReason] = useState(ANY_REASON);
  const [reasons, setReasons] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(true);

  // Every reason on the installation's list, for the filter. If this
  // fails the list still works, with the filter left at "any".
  useEffect(() => {
    let current = true;

    api.abuseReports.reasons(undefined, i18n.language)
      .then(({ data }) => {
        if (current) {
          setReasons(data.data || []);
        }
      })
      .catch(() => {});

    return () => {
      current = false;
    };
  }, []);

  const fetchPage = useCallback((offset, which, why) => {
    setIsFetching(true);

    return api.abuseReports.browseCases({
      status: which,
      reason: why === ANY_REASON ? '' : why,
      limit: PAGE_SIZE,
      offset,
      lang: i18n.language,
    })
      .then(({ data }) => {
        const page = data.data || [];

        setItems((previous) => {
          return offset === 0 ? page : [...previous, ...page];
        });
        setTotal((data.pagination && data.pagination.total) || 0);
      })
      .catch(() => {
        alertError(i18n.t('abuseReports:list.loadError'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [alertError]);

  useEffect(() => {
    setItems([]);
    fetchPage(0, status, reason);
  }, [fetchPage, status, reason]);

  const filtered = reason !== ANY_REASON;

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <ReportsIcon />
          </Avatar>
        }
        title={
          <Typography variant="h6">
            {i18n.t('abuseReports:cTitle')}
          </Typography>
        }
      />
      <Divider />
      <CardContent>
        {/* Side by side where there is room, stacked on a phone. */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <TextField
            select
            size="small"
            name="status"
            label={i18n.t('abuseReports:list.status')}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
            }}
            sx={{ minWidth: { sm: 180 } }}
            fullWidth
          >
            {STATUSES.map((value) => {
              return (
                <MenuItem key={value} value={value}>
                  {i18n.t(`abuseReports:statuses.${value}`)}
                </MenuItem>
              );
            })}
          </TextField>
          <TextField
            select
            size="small"
            name="reason"
            label={i18n.t('abuseReports:list.reason')}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
            }}
            fullWidth
          >
            <MenuItem value={ANY_REASON}>
              {i18n.t('abuseReports:list.anyReason')}
            </MenuItem>
            {reasons.map((item) => {
              return (
                <MenuItem key={item.key} value={item.key}>
                  {item.label}
                </MenuItem>
              );
            })}
          </TextField>
        </Box>
      </CardContent>

      {isFetching && <LinearProgress />}

      {/* An empty open list is the good state, and says so. */}
      {!isFetching && items.length === 0 &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {filtered ?
              i18n.t('abuseReports:list.empty.filtered') :
              i18n.t(`abuseReports:list.empty.${status}`)}
          </Typography>
        </CardContent>}

      {items.length > 0 &&
        <List disablePadding>
          {items.map((item) => {
            return (
              <ListItemButton
                key={item.id}
                component={Link}
                to={`/admin/reports/${item.id}`}
                divider
                alignItems="flex-start"
              >
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="subtitle1">
                      {target.title(item)}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary">
                        {target.kind(item.targetType)}
                        {item.targetOwner && item.targetOwner.id !== item.targetId &&
                          ` · ${i18n.t('abuseReports:list.by', { name: item.targetOwner.name })}`}
                        {` · ${i18n.t('abuseReports:list.reports', { count: item.reportCount })}`}
                        {` · ${i18n.t('abuseReports:list.lastReported', {
                          date: formatDate(item.lastReportedAt),
                        })}`}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {(item.reasons || []).map((given) => {
                          return (
                            <Chip
                              key={given.key}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                              label={given.count > 1 ?
                                `${given.label} × ${given.count}` :
                                given.label}
                            />
                          );
                        })}
                      </Box>
                    </>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>}

      {/* How much of the list is on screen, so the size of the queue is
          known without reaching its end. */}
      {items.length > 0 &&
        <CardContent>
          <Typography variant="caption" color="textSecondary">
            {i18n.t('abuseReports:list.showing', {
              shown: items.length,
              total: Math.max(total, items.length),
            })}
          </Typography>
        </CardContent>}

      {items.length < total &&
        <CardActions>
          <Button
            fullWidth
            disabled={isFetching}
            onClick={() => {
              fetchPage(items.length, status, reason);
            }}
          >
            {i18n.t('abuseReports:list.more')}
          </Button>
        </CardActions>}
    </Card>
  );
};

ReportsList.propTypes = {
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(ReportsList);
