import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import ActorAvatar from '../../../components/ActorAvatar';
import ActorType from '../../../proptypes/Actor';
import utils from '../../../utils';
import i18n from '../../../languages';

const { getActorName, getURL } = utils.node;

const ActorBodyAdmins = (props) => {
  const {
    actor,
  } = props;

  const namespace = utils.node.getNamespace(actor);
  // An event's administrators are its hosts, and the card says so; a group
  // putting it on is the first of them.
  const host = actor.event && actor.event.host && actor.event.host.id ? actor.event.host : null;
  const admins = host ?
    [host, ...actor.administrators.filter((admin) => { return admin.id !== host.id; })] :
    actor.administrators;

  return (
    <Card>
      <CardHeader
        title={
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{ fontWeight: 500 }}
          >
            {i18n.t(`${namespace}:settings.admins`)}
          </Typography>
        }
      />
      <List>
        {admins.map((admin) => {
          const key = `admin_${admin.id}`;
          const href = getURL(admin);
          return (
            <ListItemButton
              key={key}
              href={href}
              component="a"
            >
              <ListItemAvatar>
                <ActorAvatar actor={admin} />
              </ListItemAvatar>
              <ListItemText
                primary={getActorName(admin)}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Card>
  );
};

ActorBodyAdmins.propTypes = {
  actor: ActorType.isRequired,
};

export default ActorBodyAdmins;
