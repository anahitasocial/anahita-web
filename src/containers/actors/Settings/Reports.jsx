import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import Progress from '../../../components/Progress';
import ActorType from '../../../proptypes/Actor';
import target from '../../admin/Reports/target';
import api from '../../../api';
import i18n from '../../../languages';

const LIMIT = 20;

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(i18n.language);
};

// A group's or an event's reports against its rules, for its administrators
// (roadmap row 102, part 6b). Nobody's name: the server sends none. They act
// on a post on its own page, where deleting it closes its report; deciding
// the case is the site's administrators'.
const ActorReports = ({ actor }) => {
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [failed, setFailed] = useState(false);

  const read = useCallback((offset) => {
    return api.abuseReports.browseProfileCases(actor.id, { limit: LIMIT, offset })
      .then(({ data }) => {
        setItems((before) => {
          return [...(offset > 0 && before ? before : []), ...(data.data || [])];
        });
        setTotal((data.pagination && data.pagination.total) || 0);
      })
      .catch(() => {
        setFailed(true);
      });
  }, [actor.id]);

  useEffect(() => {
    setItems(null);
    setFailed(false);
    read(0);
  }, [read]);

  if (failed && !items) {
    return (
      <CardContent>
        <Typography variant="body2" color="error">
          {i18n.t('rules:reports.loadError')}
        </Typography>
      </CardContent>
    );
  }

  if (!items) {
    return <Progress />;
  }

  return (
    <>
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('rules:reports.intro')}
        </Typography>
      </CardContent>
      <Divider />
      {items.length === 0 &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('rules:reports.none')}
          </Typography>
        </CardContent>}
      {items.length > 0 &&
        <InfiniteScroll
          dataLength={items.length}
          next={() => { return read(items.length); }}
          hasMore={items.length < total && !failed}
          loader={<Progress key="reports-progress" />}
          style={{ overflow: 'visible' }}
        >
          <List disablePadding>
            {items.map((item) => {
              const url = target.url(item);
              return (
                <ListItem
                  key={`report-case-${item.id}`}
                  divider
                  alignItems="flex-start"
                  secondaryAction={url &&
                    <Button component={RouterLink} to={url} size="small">
                      {i18n.t('rules:reports.view')}
                    </Button>}
                  sx={{ pr: 12 }}
                >
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}
                      >
                        {item.targetGone ?
                          i18n.t('rules:reports.gone') :
                          target.title(item)}
                      </Typography>
                    }
                    secondary={(item.reports || []).map((report, index) => {
                      return (
                        // eslint-disable-next-line react/no-array-index-key
                        <Typography key={`report-${index}`} variant="body2" color="textSecondary" component="div">
                          {`${i18n.t('rules:reports.broke', { rule: report.rule })} · ${formatDate(report.createdAt)}`}
                          {report.details &&
                            <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                              {report.details}
                            </Typography>}
                        </Typography>
                      );
                    })}
                  />
                </ListItem>
              );
            })}
          </List>
        </InfiniteScroll>}
    </>
  );
};

ActorReports.propTypes = {
  actor: ActorType.isRequired,
};

export default ActorReports;
