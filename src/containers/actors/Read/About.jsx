import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
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
import RulesIcon from '@mui/icons-material/Rule';
import CalendarIcon from '@mui/icons-material/CalendarTodayOutlined';
import CopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';

import MapIcon from '@mui/icons-material/MapOutlined';
import OpenIcon from '@mui/icons-material/ExpandMore';
import PlaceIcon from '@mui/icons-material/PlaceOutlined';
import WebsiteIcon from '@mui/icons-material/Web';
import VerifiedIcon from '@mui/icons-material/Verified';
import FediverseIcon from '@mui/icons-material/Hub';

import { listProps } from '../../../utils/lists';
import i18n from '../../../languages';
import EntityBody from '../../../components/NodeBody';
import AnahitaMap from '../../../components/Map';
import MenuItemLabel from '../../../components/MenuItemLabel';
import BlueskyIcon from '../../../components/BlueskyIcon';
import federation from '../../../utils/federation';
import events from '../../../utils/events';
import ActorType from '../../../proptypes/Actor';
import useFediverseHandle from './useFediverseHandle';

// The host of an address, without its "www.": example.com.
const hostOf = (address) => {
  try {
    return new URL(address).hostname.replace(/^www\./, '');
  } catch (e) {
    return address;
  }
};

// When it was made, as month and year in the reader's own language:
// "October 2026". How long somebody has been here, not the day.
const monthYear = (value) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
};

const ActorBodyAbout = (props) => {
  const { actor, rules = null } = props;
  // Its rules, which whoever follows it or answers it agrees to (roadmap
  // row 102, part 5): shown at all times, in order.
  const ruleItems = (rules && rules.items) || [];
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

  // Its handle on the fediverse, copied when pressed, for somebody on
  // Mastodon to follow it by: a person's or a website's that is on it.
  const fediverseHandle = useFediverseHandle(actor);
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(navigator.clipboard && navigator.clipboard.writeText);
  const copyHandle = () => {
    navigator.clipboard.writeText(fediverseHandle).then(() => {
      setCopied(true);
    }).catch(() => {
      setCopied(false);
    });
  };

  // When it joined, or was made: a person, a group or a website here. An
  // event's own date is what matters of it, and somebody from elsewhere
  // joined their own server, not this one.
  const isPerson = (actor.type || '').includes('.person-service.person.');
  const since = !remote && !events.isEvent(actor) ? monthYear(actor.createdAt) : '';
  const hasList = Boolean(address || event.hasAddress || websiteUrl || fediverseHandle || since);

  return (
    <Card component="section">
      <CardHeader
        title={
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{ fontWeight: 500 }}
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
      {body && hasList && <Divider />}
      {hasList &&
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
          {fediverseHandle &&
            <ListItemButton
              onClick={canCopy ? copyHandle : undefined}
              disabled={!canCopy}
              aria-label={`${i18n.t('actor:fediverse.copy')} ${fediverseHandle}`}
              sx={{ '&.Mui-disabled': { opacity: 1 } }}
            >
              <ListItemIcon>
                <FediverseIcon />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t('actor:fediverse.title')}
                secondary={fediverseHandle}
                slotProps={{ secondary: { sx: { overflowWrap: 'anywhere' } } }}
              />
              {canCopy && (copied ?
                <DoneIcon color="action" titleAccess={i18n.t('actor:fediverse.copied')} /> :
                <CopyIcon color="action" fontSize="small" />)}
            </ListItemButton>}
          {since &&
            <ListItem>
              <ListItemIcon>
                <CalendarIcon />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t(isPerson ? 'actor:since.joined' : 'actor:since.created')}
                secondary={since}
              />
            </ListItem>}
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
      {ruleItems.length > 0 &&
        <>
          {(body || hasList) && <Divider />}
          <CardContent>
            <Typography
              variant="subtitle1"
              component="h4"
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, mb: 1,
              }}
            >
              <RulesIcon fontSize="small" color="action" />
              {i18n.t('rules:about.title')}
            </Typography>
            <Box {...listProps(ruleItems)}>
              {ruleItems.map((rule, index) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={`rule-${index}`}>
                    <Typography variant="body2">{rule.title}</Typography>
                    {rule.body &&
                      <Typography variant="body2" color="textSecondary">{rule.body}</Typography>}
                  </li>
                );
              })}
            </Box>
          </CardContent>
        </>}
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
  // From GET .../rules: { version, items, agreedVersion }, or null.
  rules: PropTypes.object,
};

export default ActorBodyAbout;
