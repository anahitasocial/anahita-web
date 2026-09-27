import React, { useState } from 'react';
import PropTypes from 'prop-types';

import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import ActorAvatar from '../../../components/ActorAvatar';
import ActorType from '../../../proptypes/Actor';
import StepActions from '../StepActions';
import ViewerType from '../../../proptypes/Viewer';
import i18n from '../../../languages';
import utils from '../../../utils';

const { getActorName, isPerson } = utils.node;

// The accounts the installation features, with whoever invited this person
// first.
//
// NOTHING IS FOLLOWED AUTOMATICALLY. Nothing is pre-checked, the inviter
// included: a follow is public, and an account can require approval first,
// which a follow made on somebody's behalf would have to either honour or
// bypass. Every follow here is a box the person ticks.
//
// One control per row, a checkbox, rather than a Follow button beside it —
// two ways to do the same thing on one row would leave the checkbox wrong the
// moment the button was used. Accounts already followed say so, with nothing
// to tick.
const OnboardingFeatured = ({
  viewer,
  actors,
  inviterId = null,
  primaryLabel,
  onNext,
  onSkip,
  followActor,
  alertError,
}) => {
  const [selected, setSelected] = useState(new Set());
  const [pending, setPending] = useState(false);

  const toggle = (id) => {
    const next = new Set(selected);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setSelected(next);
  };

  // Each follow on its own: one that fails does not stop the rest, and does
  // not stop the flow either. The accounts are still there to follow later.
  const followSelected = () => {
    if (selected.size === 0) {
      onNext();
      return;
    }

    setPending(true);

    const follows = actors
      .filter((actor) => { return selected.has(actor.id); })
      .map((actor) => { return followActor({ actor, viewer }); });

    Promise.allSettled(follows).then((results) => {
      setPending(false);

      if (results.some((result) => { return result.status === 'rejected'; })) {
        alertError(i18n.t('onboarding:prompts.followError'));
      }

      onNext();
    });
  };

  const secondaryText = (actor) => {
    if (actor.id === inviterId) {
      return i18n.t('onboarding:featured.inviter');
    }

    return isPerson(actor)
      ? i18n.t('onboarding:featured.person')
      : i18n.t('onboarding:featured.group');
  };

  return (
    <>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {i18n.t('onboarding:featured.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('onboarding:featured.description')}
        </Typography>
        <List>
          {actors.map((actor) => {
            const following = Boolean(actor.isLeadingViewer);
            const labelId = `onboarding-featured-${actor.id}`;
            const content = (
              <>
                <ListItemAvatar>
                  <ActorAvatar actor={actor} />
                </ListItemAvatar>
                <ListItemText
                  id={labelId}
                  primary={getActorName(actor)}
                  secondary={secondaryText(actor)}
                />
              </>
            );

            return (
              <ListItem
                key={actor.id}
                disablePadding={!following}
                secondaryAction={following
                  ? (
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t('onboarding:featured.following')}
                    </Typography>
                  )
                  : (
                    <Checkbox
                      edge="end"
                      color="primary"
                      checked={selected.has(actor.id)}
                      disabled={pending}
                      onChange={() => { toggle(actor.id); }}
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  )}
              >
                {following
                  ? content
                  : (
                    <ListItemButton
                      disabled={pending}
                      onClick={() => { toggle(actor.id); }}
                    >
                      {content}
                    </ListItemButton>
                  )}
              </ListItem>
            );
          })}
        </List>
      </CardContent>
      <StepActions
        label={selected.size > 0
          ? i18n.t('onboarding:actions.followSelected')
          : primaryLabel}
        onClick={followSelected}
        pending={pending}
        onSkip={onSkip}
      />
    </>
  );
};

OnboardingFeatured.propTypes = {
  viewer: ViewerType.isRequired,
  actors: PropTypes.arrayOf(ActorType).isRequired,
  inviterId: PropTypes.number,
  primaryLabel: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  followActor: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

export default OnboardingFeatured;
