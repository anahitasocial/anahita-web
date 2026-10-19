import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DismissIcon from '@mui/icons-material/Close';

import useSuggestions from './useSuggestions';
import ActorAvatar from '../../components/ActorAvatar';
import ControlFollow from '../controls/Follow';
import actions from '../../actions';
import i18n from '../../languages';
import recommendations from '../../utils/recommendations';
import utils from '../../utils';

const { getActorName, getURL } = utils.node;

// How many are shown on the home page. The rest are a press away.
const SHOWN = 3;

// "Who to follow", on the home page: a few people the viewer might follow,
// each with the reason it is suggested, a Follow button and a way to say
// not interested.
//
// The ✕ in its corner puts the whole card away for a week.
//
// Nothing is drawn while it is being read, when there is nobody to suggest,
// or on an installation with no recommendation service: the home page is
// then as it was without it.
//
// `columns`: side by side, three across, as the feeds under it are when
// they are read in columns; a list, one under another, when they are not.
const WhoToFollow = ({ alertSuccess, alertError, columns = false }) => {
  const {
    items,
    related,
    isLoading,
    dismiss,
  } = useSuggestions('person', SHOWN);
  // Put away by the ✕ in its corner, for a week. Kept in the browser.
  const [isHidden, setIsHidden] = useState(() => {
    return recommendations.isHidden();
  });

  if (isHidden || isLoading || items.length === 0) {
    return null;
  }

  const handleDismiss = (actor) => {
    dismiss(actor).then(() => {
      alertSuccess(i18n.t('recommendations:dismissed'));
    }).catch(() => {
      alertError(i18n.t('recommendations:failed'));
    });
  };

  const dismissButton = (actor) => {
    return (
      <Tooltip title={i18n.t('recommendations:dismiss')}>
        <IconButton
          aria-label={i18n.t('recommendations:dismiss')}
          onClick={() => {
            handleDismiss(actor);
          }}
        >
          <DismissIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const nameLink = (actor) => {
    return (
      <Link component={RouterLink} to={getURL(actor)} color="inherit" underline="hover">
        {getActorName(actor)}
      </Link>
    );
  };

  // Three across: each a picture, a name, why, and its buttons.
  const across = (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {items.map((item) => {
        const { actor } = item;
        return (
          <Grid key={`who-to-follow-${actor.id}`} size={4}>
            <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
              <ActorAvatar actor={actor} linked size="large" />
              <Typography variant="subtitle1" noWrap sx={{ maxWidth: '100%' }}>
                {nameLink(actor)}
              </Typography>
              <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: '100%' }}>
                {recommendations.reasonText(item, related, i18n.t.bind(i18n))}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <ControlFollow actor={actor} />
                {dismissButton(actor)}
              </Stack>
            </Stack>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <Card component="section" sx={{ mb: 2 }}>
      <CardHeader
        title={i18n.t('recommendations:whoToFollow')}
        slotProps={{ title: { variant: 'h6', component: 'h2' } }}
        action={
          <Tooltip title={i18n.t('recommendations:hide', { count: recommendations.HIDE_DAYS })}>
            <IconButton
              aria-label={i18n.t('recommendations:hide', { count: recommendations.HIDE_DAYS })}
              onClick={() => {
                recommendations.hide();
                setIsHidden(true);
                alertSuccess(i18n.t('recommendations:hidden', { count: recommendations.HIDE_DAYS }));
              }}
            >
              <DismissIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <Divider />
      {columns ? across :
      <List>
        {items.map((item) => {
          const { actor } = item;

          return (
            <ListItem
              key={`who-to-follow-${actor.id}`}
              secondaryAction={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <ControlFollow actor={actor} />
                  {dismissButton(actor)}
                </Stack>
              }
              // Room for the two buttons, so a long name is cut short
              // before it runs under them.
              sx={{ pr: 22 }}
            >
              <ListItemAvatar>
                <ActorAvatar actor={actor} linked />
              </ListItemAvatar>
              <ListItemText
                primary={nameLink(actor)}
                secondary={recommendations.reasonText(item, related, i18n.t.bind(i18n))}
                slotProps={{
                  primary: { noWrap: true },
                  secondary: { noWrap: true },
                }}
              />
            </ListItem>
          );
        })}
      </List>}
      <CardActions sx={{ p: 1, pt: 0 }}>
        <Button fullWidth component={RouterLink} to="/recommendations">
          {i18n.t('recommendations:seeMore')}
        </Button>
      </CardActions>
    </Card>
  );
};

WhoToFollow.propTypes = {
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  columns: PropTypes.bool,
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

export default connect(null, mapDispatchToProps)(WhoToFollow);
