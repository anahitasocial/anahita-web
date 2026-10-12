import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

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
const WhoToFollow = ({ alertSuccess, alertError }) => {
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
      <List>
        {items.map((item) => {
          const { actor } = item;

          return (
            <ListItem
              key={`who-to-follow-${actor.id}`}
              secondaryAction={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <ControlFollow actor={actor} />
                  <Tooltip title={i18n.t('recommendations:dismiss')}>
                    <IconButton
                      edge="end"
                      aria-label={i18n.t('recommendations:dismiss')}
                      onClick={() => {
                        handleDismiss(actor);
                      }}
                    >
                      <DismissIcon />
                    </IconButton>
                  </Tooltip>
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
                primary={
                  <Link component={RouterLink} to={getURL(actor)} color="inherit" underline="hover">
                    {getActorName(actor)}
                  </Link>
                }
                secondary={recommendations.reasonText(item, related, i18n.t.bind(i18n))}
                slotProps={{
                  primary: { noWrap: true },
                  secondary: { noWrap: true },
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <CardActions sx={{ p: 1, pt: 0 }}>
        <Button fullWidth component={RouterLink} to="/suggestions">
          {i18n.t('recommendations:seeMore')}
        </Button>
      </CardActions>
    </Card>
  );
};

WhoToFollow.propTypes = {
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

export default connect(null, mapDispatchToProps)(WhoToFollow);
