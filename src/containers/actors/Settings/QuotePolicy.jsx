import React from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';

import api from '../../../api';
import i18n from '../../../languages';
import quotes from '../../../utils/quotes';
import useSaveSetting, { forNamespace } from './useSaveSetting';

// Who can quote this person's posts, for the posts that do not say
// themselves. Anyone unless they choose otherwise.
//
// For people only: it is the setting of a post's author, and authors are
// people. Saved as soon as it is chosen.
const ActorsSettingsQuotePolicy = ({ namespace }) => {
  const { actor, isSaving, save } = useSaveSetting(namespace);

  const handleChange = (event) => {
    const policy = event.target.value;

    save(() => {
      return api.quotes.setPersonPolicy(actor, policy);
    }, {
      saved: 'replies:quote.policy.saved',
      notSaved: 'replies:quote.policy.notSaved',
    });
  };

  return (
    <Card>
      <CardHeader title={i18n.t('replies:quote.policy.title')} />
      <CardContent sx={{ pt: 0 }}>
        <FormControl disabled={isSaving}>
          <RadioGroup
            aria-label={i18n.t('replies:quote.policy.title')}
            name="person-quote-policy"
            value={quotes.effective('', actor.quotePolicy)}
            onChange={handleChange}
          >
            {quotes.POLICIES.map((policy) => {
              return (
                <FormControlLabel
                  key={policy}
                  value={policy}
                  control={<Radio />}
                  label={i18n.t(`replies:quote.policy.${policy}`)}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {i18n.t('replies:quote.policy.personHelp')}
        </Typography>
      </CardContent>
    </Card>
  );
};

ActorsSettingsQuotePolicy.propTypes = {
  namespace: PropTypes.string.isRequired,
};

export default forNamespace(ActorsSettingsQuotePolicy);
