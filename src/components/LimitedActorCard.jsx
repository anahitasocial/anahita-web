import React from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import LockIcon from '@mui/icons-material/LockOutlined';

import ActorAvatar from './ActorAvatar';
import i18n from '../languages';
import utils from '../utils';

const { getActorName, getURL } = utils.node;

// A profile the viewer may not see, which lets people ask to follow it: its
// picture and name, that it is private, and the way to ask.
//
// That is all the server sends of it (`restricted`), so there is nothing
// else to draw. Used as the card in the lists of people and of groups, and
// as the whole page when such a profile is opened.
const LimitedActorCard = ({ actor, action = null, note = '' }) => {
  return (
    <Card>
      <CardHeader
        avatar={<ActorAvatar actor={actor} linked />}
        title={
          <Link href={getURL(actor)} color="inherit" underline="hover">
            {getActorName(actor)}
          </Link>
        }
        subheader={actor.alias ? `@${actor.alias}` : null}
        slotProps={{
          title: { variant: 'h6' },
        }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <LockIcon fontSize="small" />
          {i18n.t('actor:limited.private')}
        </Typography>
        {note &&
          <Typography variant="body1" sx={{ pt: 2 }}>
            {note}
          </Typography>}
      </CardContent>
      {action &&
        <CardActions sx={{ p: 1 }}>
          {action}
        </CardActions>}
    </Card>
  );
};

LimitedActorCard.propTypes = {
  actor: PropTypes.object.isRequired,
  action: PropTypes.node,
  // A line of its own under the first, such as that the viewer was
  // invited.
  note: PropTypes.string,
};

export default LimitedActorCard;
