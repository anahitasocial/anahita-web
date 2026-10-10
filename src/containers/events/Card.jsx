import React from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ActorAvatar from '../../components/ActorAvatar';
import ControlInviteAnswer from '../controls/InviteAnswer';
import EventWhen from './When';
import i18n from '../../languages';
import utils from '../../utils';

const { getActorName, getURL } = utils.node;

// An event in a list: what it is called, when it is, and how it stands.
//
// One the viewer was invited to and has not answered carries Decline and
// Accept. The server may have sent only its name, picture and time
// (`restricted`), which is all this draws of it either way.
const EventCard = ({ actor, onAnswered = null }) => {
  const { event } = actor;

  return (
    <Card>
      <CardHeader
        avatar={<ActorAvatar actor={actor} linked />}
        title={
          <Link href={getURL(actor)} color="inherit" underline="hover">
            {getActorName(actor)}
          </Link>
        }
        subheader={event && event.host ?
          i18n.t('events:event.form.hostedBy', { name: getActorName(event.host) }) :
          null}
        slotProps={{
          title: { variant: 'h6' },
        }}
      />
      {event &&
        <CardContent sx={{ pt: 0 }}>
          <EventWhen event={event} dense />
          <Stack direction="row" spacing={1} sx={{ pt: 1, flexWrap: 'wrap' }}>
            {(event.state === 'cancelled' || event.state === 'past' || event.state === 'happening') &&
              <Chip
                size="small"
                color={event.state === 'cancelled' ? 'error' : 'default'}
                label={i18n.t(`events:event.state.${event.state}`)}
              />}
            {event.viewerRsvp &&
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={i18n.t(event.viewerRsvp === 'going' ?
                  'events:event.rsvp.youAreGoing' :
                  'events:event.rsvp.youSaidMaybe')}
              />}
            <Typography variant="body2" color="textSecondary" sx={{ alignSelf: 'center' }}>
              {i18n.t('events:event.counts.going', { count: event.goingCount || 0 })}
            </Typography>
          </Stack>
        </CardContent>}
      {actor.isInvited &&
        <CardActions sx={{ p: 1 }}>
          <ControlInviteAnswer actor={actor} onAnswered={onAnswered} />
        </CardActions>}
    </Card>
  );
};

EventCard.propTypes = {
  // An event actor, or what the server sends of one the viewer was only
  // invited to.
  actor: PropTypes.object.isRequired,
  // Called with true or false when an invitation on the card is answered.
  onAnswered: PropTypes.func,
};

export default EventCard;
