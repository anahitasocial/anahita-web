import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';

import ActorType from '../../../proptypes/Actor';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import quotes from '../../../utils/quotes';

// Who can quote this person's posts, for the posts that do not say
// themselves. Anyone unless they choose otherwise.
//
// For people only: it is the setting of a post's author, and authors are
// people. Saved as soon as it is chosen.
const ActorsSettingsQuotePolicy = ({
  actor,
  read,
  alertSuccess,
  alertError,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    setIsSaving(true);
    api.quotes.setPersonPolicy(actor, event.target.value).then(() => {
      return read(actor);
    }).then(() => {
      alertSuccess(i18n.t('replies:quote.policy.saved'));
    }).catch(() => {
      alertError(i18n.t('replies:quote.policy.notSaved'));
    })
      .finally(() => {
        setIsSaving(false);
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
  actor: ActorType.isRequired,
  read: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    return {
      actor: state[namespace][namespace].current,
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      read: (actor) => {
        return dispatch(actions[namespace].read(actor.id, namespace));
      },
      alertSuccess: (message) => {
        return dispatch(actions.app.alert.success(message));
      },
      alertError: (message) => {
        return dispatch(actions.app.alert.error(message));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(ActorsSettingsQuotePolicy);
};
