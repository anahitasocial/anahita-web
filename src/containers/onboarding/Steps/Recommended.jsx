import React, { useEffect, useState } from 'react';
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
import Progress from '../../../components/Progress';
import StepActions from '../StepActions';
import ViewerType from '../../../proptypes/Viewer';
import api from '../../../api';
import i18n from '../../../languages';
import recommendations from '../../../utils/recommendations';
import utils from '../../../utils';

const { getActorName } = utils.node;

// How many of each kind are asked for.
const EACH = 5;

// People and groups recommended to somebody who has just joined, each with
// the reason, asked of the recommendation service as for a newcomer
// (`context=onboarding`): by who invited them, the hashtags they picked a
// step before, what is popular and what is featured. Asked when the step is
// reached, so that what was picked and followed before it counts.
//
// As with the featured accounts, nothing is followed without a tick, and
// a step with nothing to show moves on by itself.
const OnboardingRecommended = ({
  viewer,
  primaryLabel,
  onNext,
  onSkip,
  followActor,
  alertError,
}) => {
  const [rows, setRows] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let current = true;
    const ask = (kind) => {
      return api.recommendations.actors({ kind, limit: EACH, context: 'onboarding' }).then((result) => {
        const related = result.data.related || [];
        return (result.data.items || []).filter((item) => {
          return item.actor;
        }).map((item) => {
          return {
            actor: item.actor,
            why: recommendations.reasonText(item, related, i18n.t.bind(i18n), kind),
          };
        });
      }).catch(() => {
        return [];
      });
    };

    Promise.all([ask('person'), ask('group')]).then(([people, groups]) => {
      if (!current) {
        return;
      }
      const found = people.concat(groups);
      if (found.length === 0) {
        onNext();
        return;
      }
      setRows(found);
    });

    return () => {
      current = false;
    };
  }, []);

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const followSelected = () => {
    if (selected.size === 0) {
      onNext();
      return;
    }
    setPending(true);
    const follows = rows.filter((row) => {
      return selected.has(row.actor.id);
    }).map((row) => {
      return followActor({ actor: row.actor, viewer });
    });
    Promise.allSettled(follows).then((results) => {
      setPending(false);
      if (results.some((result) => { return result.status === 'rejected'; })) {
        alertError(i18n.t('onboarding:prompts.followError'));
      }
      onNext();
    });
  };

  if (rows === null) {
    return <Progress />;
  }

  return (
    <>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {i18n.t('onboarding:recommended.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('onboarding:recommended.description')}
        </Typography>
        <List>
          {rows.map(({ actor, why }) => {
            const labelId = `onboarding-recommended-${actor.id}`;
            return (
              <ListItem
                key={actor.id}
                disablePadding
                secondaryAction={
                  <Checkbox
                    edge="end"
                    color="primary"
                    checked={selected.has(actor.id)}
                    disabled={pending}
                    onChange={() => { toggle(actor.id); }}
                    slotProps={{ input: { 'aria-labelledby': labelId } }}
                  />
                }
              >
                <ListItemButton
                  disabled={pending}
                  onClick={() => { toggle(actor.id); }}
                >
                  <ListItemAvatar>
                    <ActorAvatar actor={actor} />
                  </ListItemAvatar>
                  <ListItemText
                    id={labelId}
                    primary={getActorName(actor)}
                    secondary={why}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </CardContent>
      <StepActions
        label={selected.size > 0 ?
          i18n.t('onboarding:actions.followSelected') :
          primaryLabel}
        onClick={followSelected}
        pending={pending}
        onSkip={onSkip}
      />
    </>
  );
};

OnboardingRecommended.propTypes = {
  viewer: ViewerType.isRequired,
  primaryLabel: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  followActor: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

export default OnboardingRecommended;
