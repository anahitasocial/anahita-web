import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import ActorAvatar from '../../../components/ActorAvatar';
import Progress from '../../../components/Progress';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';
import utils from '../../../utils';

const { getActorName, getURL } = utils.node;

// The people the viewer has blocked, with a way to unblock each.
//
// Theirs alone, so it is in their settings. It was a tab of the Social
// Graph on their profile, which is what other people look at.
const ActorsSettingsBlocked = ({
  actor,
  viewer,
  alertError,
}) => {
  const [rows, setRows] = useState(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [waiting, setWaiting] = useState(0);

  useEffect(() => {
    api.socialgraph.browse({
      filter: 'blocks',
      actor,
      start: 0,
      limit: 100,
    }).then((result) => {
      setRows(result.data.data || []);
    }).catch(() => {
      setHasFailed(true);
    });
  }, [actor.id]);

  const handleUnblock = (person) => {
    setWaiting(person.id);
    api.socialgraph.unblock({ actor: person, viewer }).then(() => {
      setRows((before) => {
        return before.filter((each) => {
          return each.id !== person.id;
        });
      });
    }).catch(() => {
      alertError(i18n.t('socialgraph:blocked.failed'));
    }).finally(() => {
      setWaiting(0);
    });
  };

  return (
    <Card>
      <CardHeader title={i18n.t('socialgraph:blocks')} />
      <CardContent sx={{ pt: 0 }}>
        {!rows && !hasFailed && <Progress />}
        {hasFailed &&
          <Typography variant="body2" color="error" role="alert">
            {i18n.t('socialgraph:failed')}
          </Typography>}
        {rows && rows.length === 0 &&
          <Typography variant="body2" color="textSecondary">
            {i18n.t('socialgraph:blocked.none')}
          </Typography>}
        {rows && rows.length > 0 &&
          <List disablePadding>
            {rows.map((person) => {
              return (
                <ListItem
                  key={`blocked-${person.id}`}
                  disableGutters
                  secondaryAction={
                    <Button
                      disabled={waiting === person.id}
                      onClick={() => {
                        handleUnblock(person);
                      }}
                    >
                      {i18n.t('actions:unblock')}
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <ActorAvatar actor={person} linked />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Link href={getURL(person)} color="inherit" underline="hover">
                        {getActorName(person)}
                      </Link>
                    }
                    secondary={person.alias ? `@${person.alias}` : null}
                  />
                </ListItem>
              );
            })}
          </List>}
      </CardContent>
    </Card>
  );
};

ActorsSettingsBlocked.propTypes = {
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActorsSettingsBlocked);
