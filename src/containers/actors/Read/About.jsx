import React from 'react';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import MapIcon from '@mui/icons-material/MapOutlined';
import PlaceIcon from '@mui/icons-material/PlaceOutlined';
import WebsiteIcon from '@mui/icons-material/Web';

import i18n from '../../../languages';
import Player from '../../../components/Player';
import EntityBody from '../../../components/NodeBody';
import AnahitaMap from '../../../components/Map';
import events from '../../../utils/events';
import ActorType from '../../../proptypes/Actor';

const ActorBodyAbout = (props) => {
  const { actor } = props;
  const {
    body,
    websiteUrl,
  } = actor;

  // Where an event is held: the address kept on it, which the server sends
  // to whoever is going, and where that is on a map when whoever made the
  // event asked for one. Everybody else is told only that there is one.
  const event = actor.event || {};
  const address = events.addressLine(event.address);
  const hasPoint = events.hasPoint(event.address);

  return (
    <Card component="section">
      <CardHeader
        title={
          <Typography
            variant="h3"
            style={{
              fontSize: 24,
            }}
          >
            {i18n.t('actor:about')}
          </Typography>
        }
      />
      {body &&
        <>
          <Player text={body} />
          <CardContent>
            <EntityBody contentFilter>
              {body}
            </EntityBody>
          </CardContent>
        </>}
      {address &&
        <>
          <List>
            <ListItem>
              <ListItemIcon>
                <PlaceIcon />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t('events:event.address.title')}
                secondary={address}
              />
            </ListItem>
          </List>
          {hasPoint &&
            <AnahitaMap
              locations={[{
                id: actor.id,
                name: address,
                latitude: event.address.latitude,
                longitude: event.address.longitude,
              }]}
              height={240}
              linked={false}
            />}
          <List>
            <ListItemButton
              component="a"
              href={events.mapURL(event.address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemIcon>
                <MapIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t('events:event.address.openMap')} />
            </ListItemButton>
          </List>
        </>}
      {!address && event.hasAddress &&
        <List>
          <ListItem>
            <ListItemIcon>
              <PlaceIcon />
            </ListItemIcon>
            <ListItemText
              primary={i18n.t('events:event.address.title')}
              secondary={i18n.t('events:event.address.forGoing')}
            />
          </ListItem>
        </List>}
      {websiteUrl &&
        <List>
          <ListItemButton
            component="a"
            href={websiteUrl}
            target="_blank"
            /*
              nofollow because an arbitrary person-supplied link on a public
              profile is an SEO-spam magnet; noopener/noreferrer because
              target="_blank" otherwise hands the opened page a handle on this
              one. rel="me" is the Mastodon convention for a profile link and
              is what would let a site verify itself back to us later.
            */
            rel="me nofollow noopener noreferrer"
          >
            <ListItemIcon>
              <WebsiteIcon />
            </ListItemIcon>
            <ListItemText
              primary={i18n.t('actor:website')}
              secondary={
                <Typography
                  variant="body1"
                  noWrap
                >
                  {websiteUrl}
                </Typography>
              }
            />
          </ListItemButton>
        </List>}
    </Card>
  );
};

ActorBodyAbout.propTypes = {
  actor: ActorType.isRequired,
};

export default ActorBodyAbout;
