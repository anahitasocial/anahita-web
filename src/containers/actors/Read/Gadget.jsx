import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Truncate from 'react-truncate';

import AddIcon from '@mui/icons-material/Add';

import ActorAvatar from '../../../components/actor/Avatar';
import PersonType from '../../../proptypes/Person';
import Progress from '../../../components/Progress';

import i18n from '../../../languages';
import utils from '../../../utils';
import permissions from '../../../permissions';
import * as api from '../../../api';

const { getActorName, getURL } = utils.node;

const ActorsGadget = (props) => {
  const {
    admin,
    viewer,
    namespace,
    actorSettings = {},
  } = props;
  const [actors, setActors] = useState([]);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setWaiting(true);
    api.projects
      .browse({
        oid: admin.id,
        filter: 'administering',
        offset: 0,
        limit: 1000,
      })
      .then((results) => {
        const { data } = results.data;
        setActors(data);
        setWaiting(false);
        return true;
      }).catch((err) => {
        console.error(err);
        setWaiting(false);
      });
  }, [admin.id]);

  // Was passing `namespace` as the second argument, which canAdd ignored —
  // it now carries the GROUPS_FROM level the server enforces.
  const canAdd = permissions.actor.canAdd(admin, actorSettings)
    && admin.id === viewer.id;

  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Typography
            variant="h3"
            style={{
              fontSize: 24,
            }}
          >
            {i18n.t(`${namespace}:mTitle`)}
          </Typography>
        }
      />
      {waiting && <Progress />}
      <List>
        {actors.map((actor) => {
          const key = `${namespace}_${actor.id}`;
          const href = getURL(actor);
          return (
            <ListItem
              key={key}
              href={href}
              component="a"
              button
            >
              <ListItemAvatar>
                <ActorAvatar actor={actor} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Truncate>
                    {getActorName(actor)}
                  </Truncate>
                }
                secondary={
                  <Truncate lines={3}>
                    {actor.body}
                  </Truncate>
                }
              />
            </ListItem>
          );
        })}
      </List>
      {canAdd &&
        <CardActions>
          <Button
            variant="outlined"
            fullWidth
            component="a"
            href="/groups/add/"
          >
            <AddIcon />
          </Button>
        </CardActions>}
    </Card>
  );
};

ActorsGadget.propTypes = {
  admin: PersonType.isRequired,
  viewer: PersonType.isRequired,
  namespace: PropTypes.string.isRequired,
  actorSettings: PropTypes.object,
};

const mapStateToProps = (state) => {
  const { nodeInfo } = state.app;

  return {
    // Connected only for this: who may create a group is a server setting,
    // and the gadget offers the button that depends on it.
    actorSettings: (nodeInfo && nodeInfo.metadata) || {},
  };
};

const ConnectedActorsGadget = connect(mapStateToProps)(ActorsGadget);

export default (namespace) => {
  return (props) => {
    return (<ConnectedActorsGadget namespace={namespace} {...props} />);
  };
};
