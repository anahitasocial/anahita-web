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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import ReportsIcon from '@mui/icons-material/Flag';

import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';

import target from './target';

const STATUSES = ['open', 'actioned', 'dismissed'];
const PAGE_SIZE = 20;

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

// The cases, by status. Open ones are the work; the other two are the
// record of what was decided.
const ReportsList = ({
  alertError,
}) => {
  const [status, setStatus] = useState('open');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(true);

  const fetchPage = useCallback((offset, which) => {
    setIsFetching(true);

    return api.abuseReports.browseCases({
      status: which,
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
    fetchPage(0, status);
  }, [fetchPage, status]);

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
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          value={status}
          onChange={(event, value) => {
            // Clicking the selected button would clear it. One is always
            // selected.
            if (value) {
              setStatus(value);
            }
          }}
          aria-label={i18n.t('abuseReports:list.filter')}
        >
          {STATUSES.map((value) => {
            return (
              <ToggleButton key={value} value={value}>
                {i18n.t(`abuseReports:statuses.${value}`)}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </CardContent>

      {isFetching && <LinearProgress />}

      {/* An empty open list is the good state, and says so. */}
      {!isFetching && items.length === 0 &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t(`abuseReports:list.empty.${status}`)}
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
                        {(item.reasons || []).map((reason) => {
                          return (
                            <Chip
                              key={reason.key}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                              label={reason.count > 1 ?
                                `${reason.label} × ${reason.count}` :
                                reason.label}
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

      {items.length < total &&
        <CardActions>
          <Button
            fullWidth
            disabled={isFetching}
            onClick={() => {
              fetchPage(items.length, status);
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
