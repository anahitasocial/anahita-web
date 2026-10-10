import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';

import BackIcon from '@mui/icons-material/ArrowBackIos';

import EventDateTile from './EventDateTile';
import events from '../utils/events';
import utils from '../utils';

const {
  getActorName,
  getActorInitials,
  getAvatarURL,
  getURL,
} = utils.node;

// Settings page chrome: the actor's name, avatar and a way back to the profile.
//
// children is optional. The person settings page stacks several cards under one
// section and passes none, using this purely as a header — nesting those cards
// inside this one would draw a card border around a column of card borders. The
// notifications editor still passes children and is unaffected.
const ActorSettingCard = ({
  actor,
  subheader = 'Settings',
  children = null,
}) => {
  const src = getAvatarURL(actor, 'medium');
  const initials = getActorInitials(actor);
  const url = getURL(actor);

  return (
    <Card>
      <CardHeader
        avatar={
          <Button
            href={url}
            variant="text"
            startIcon={<BackIcon />}
          >
            {/* An event has no avatar. Where one would be is the day it
                is on, as everywhere else an event is drawn. */}
            {events.isEvent(actor) ?
              <EventDateTile actor={actor} /> :
              <Avatar
                aria-label={getActorName(actor)}
                alt={getActorName(actor)}
                src={src}
              >
                {!src && initials}
              </Avatar>}
          </Button>
        }
        title={getActorName(actor)}
        subheader={subheader}
      />
      {/* Only when there is something to divide it from. Without the guard a
          header-only card ends on a rule with nothing under it. */}
      {children && <Divider />}
      {children}
    </Card>
  );
};

ActorSettingCard.propTypes = {
  actor: PropTypes.object.isRequired,
  subheader: PropTypes.string,
  children: PropTypes.node,
};

export default ActorSettingCard;
