import React, { useState } from 'react';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import MapIcon from '@mui/icons-material/MapOutlined';
import OpenIcon from '@mui/icons-material/ExpandMore';
import PlaceIcon from '@mui/icons-material/PlaceOutlined';
import WebsiteIcon from '@mui/icons-material/Web';
import VerifiedIcon from '@mui/icons-material/Verified';
import FediverseIcon from '@mui/icons-material/Hub';

import i18n from '../../../languages';
import EntityBody from '../../../components/NodeBody';
import AnahitaMap from '../../../components/Map';
import MenuItemLabel from '../../../components/MenuItemLabel';
import BlueskyIcon from '../../../components/BlueskyIcon';
import federation from '../../../utils/federation';
import events from '../../../utils/events';
import ActorType from '../../../proptypes/Actor';

// The host of an address, without its "www.": example.com.
const hostOf = (address) => {
  try {
    return new URL(address).hostname.replace(/^www\./, '');
  } catch (e) {
    return address;
  }
};

const ActorBodyAbout = (props) => {
  const { actor } = props;
  const { body } = actor;

  // Where an event is held: the address kept on it, which the server sends
  // to whoever is going, and where that is on a map when whoever made the
  // event asked for one. Everybody else is told only that there is one.
  const event = actor.event || {};
  const address = events.addressLine(event.address);
  const hasPoint = events.hasPoint(event.address);
  const [mapsAnchor, setMapsAnchor] = useState(null);
  const closeMaps = () => {
    setMapsAnchor(null);
  };

  // Somebody on another network: where they are, and what of them is
  // here, said in place of a website. The page it leads to is theirs
  // there, which is what was kept as their website.
  const remote = federation.isRemote(actor);
  const onBluesky = remote && (actor.type || '').includes('.atproto-service.');
  const domain = federation.domainOf(actor);
  // Their page there is worked out from where they came from; a profile
  // made here has the website its owner gave it.
  const websiteUrl = remote ?
    (federation.pageOf(actor) || actor.websiteUrl) :
    actor.websiteUrl;
  // A website's site is the domain proved for it: shown as that domain,
  // verified, which is what says who is behind it.
  const isWebsite = (actor.type || '').includes('.website.');
  const siteShown = isWebsite ? hostOf(websiteUrl) : websiteUrl;

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
        <CardContent>
          <EntityBody contentFilter>
            {body}
          </EntityBody>
        </CardContent>}
      {/* One list: its website, then where it is held, so the map sits
          right under its address. Pressing where it is offers the maps it
          can be opened in. */}
      {/* A line between what they say of themselves and the list. */}
      {body && (address || event.hasAddress || websiteUrl) && <Divider />}
      {(address || event.hasAddress || websiteUrl) &&
        <List>
          {websiteUrl &&
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
                {remote && (onBluesky ? <BlueskyIcon /> : <FediverseIcon />)}
                {!remote && <WebsiteIcon />}
              </ListItemIcon>
              {remote ?
                <ListItemText
                  primary={onBluesky ?
                    i18n.t('federation:remote.onBluesky') :
                    i18n.t('federation:remote.on', { domain })}
                  secondary={i18n.t('federation:remote.shared')}
                /> :
                <ListItemText
                  primary={i18n.t('actor:website')}
                  secondary={
                    <Typography
                      variant="body1"
                      noWrap
                      component="span"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      {siteShown}
                      {isWebsite &&
                        <VerifiedIcon
                          fontSize="small"
                          color="primary"
                          titleAccess={i18n.t('websites:about.verified')}
                        />}
                    </Typography>
                  }
                />}
            </ListItemButton>}
          {address &&
            <ListItemButton
              aria-haspopup="menu"
              aria-expanded={Boolean(mapsAnchor)}
              onClick={(e) => {
                setMapsAnchor(e.currentTarget);
              }}
            >
              <ListItemIcon>
                <PlaceIcon />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t('events:event.address.title')}
                secondary={address}
              />
              <OpenIcon color="action" />
            </ListItemButton>}
          {!address && event.hasAddress &&
            <ListItem>
              <ListItemIcon>
                <PlaceIcon />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t('events:event.address.title')}
                secondary={i18n.t('events:event.address.forGoing')}
              />
            </ListItem>}
        </List>}
      {address &&
        <Menu
          anchorEl={mapsAnchor}
          open={Boolean(mapsAnchor)}
          onClose={closeMaps}
        >
          {events.mapLinks(event.address).map((link) => {
            return (
              <MenuItem
                key={link.key}
                component="a"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMaps}
              >
                <MenuItemLabel icon={<MapIcon fontSize="small" />}>
                  {i18n.t(`events:event.address.maps.${link.key}`)}
                </MenuItemLabel>
              </MenuItem>
            );
          })}
        </Menu>}
      {address && hasPoint &&
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
    </Card>
  );
};

ActorBodyAbout.propTypes = {
  actor: ActorType.isRequired,
};

export default ActorBodyAbout;
