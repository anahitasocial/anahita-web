import React, { useState } from 'react';
import PropTypes from 'prop-types';

import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import StepActions from '../StepActions';
import api from '../../../api';
import i18n from '../../../languages';
import customFeeds from '../../../utils/customFeeds';

// What somebody who has just joined is interested in: the hashtags on the
// most public posts lately, as chips to pick.
//
// What is picked becomes one feed, "My interests": every post on the site with
// any of those hashtags, on their home page, theirs alone. A feed takes ten
// hashtags at most, so ten can be picked. That feed is also what the next
// step recommends by: the recommendation service reads the hashtags of the
// feeds somebody owns. Nothing is picked for them.
const OnboardingInterests = ({
  interests,
  primaryLabel,
  onNext,
  onSkip,
  alertError,
}) => {
  const [picked, setPicked] = useState(new Set());
  const [pending, setPending] = useState(false);

  const toggle = (alias) => {
    const next = new Set(picked);
    if (next.has(alias)) {
      next.delete(alias);
    } else if (next.size < customFeeds.LIMITS.hashtags) {
      next.add(alias);
    }
    setPicked(next);
  };
  const isFull = picked.size >= customFeeds.LIMITS.hashtags;

  const followPicked = () => {
    if (picked.size === 0) {
      onNext();
      return;
    }
    setPending(true);

    const tags = Array.from(picked).map((alias) => {
      return alias.toLowerCase();
    });
    api.customFeeds.follow({
      name: i18n.t('onboarding:interests.feedName'),
      icon: 'star',
      definition: customFeeds.ofHashtags(tags),
    }, customFeeds.fingerprint).catch(() => {
      alertError(i18n.t('onboarding:prompts.followError'));
    }).finally(() => {
      setPending(false);
      onNext();
    });
  };

  return (
    <>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {i18n.t('onboarding:interests.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {i18n.t('onboarding:interests.description')}
        </Typography>
        <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
          {interests.map((interest) => {
            const isOn = picked.has(interest.alias);
            return (
              <Chip
                key={interest.alias}
                label={`#${interest.name}`}
                color={isOn ? 'primary' : 'default'}
                variant={isOn ? 'filled' : 'outlined'}
                aria-pressed={isOn}
                disabled={pending || (isFull && !isOn)}
                onClick={() => {
                  toggle(interest.alias);
                }}
              />
            );
          })}
        </Stack>
      </CardContent>
      <StepActions
        label={picked.size > 0 ?
          i18n.t('onboarding:interests.follow', { count: picked.size }) :
          primaryLabel}
        onClick={followPicked}
        pending={pending}
        onSkip={onSkip}
      />
    </>
  );
};

OnboardingInterests.propTypes = {
  interests: PropTypes.arrayOf(PropTypes.shape({
    alias: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  primaryLabel: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

export default OnboardingInterests;
