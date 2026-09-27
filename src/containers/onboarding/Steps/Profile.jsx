import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import PersonInfoFields from '../../people/Settings/InfoFields';
import Progress from '../../../components/Progress';
import StepActions from '../StepActions';
import ViewerType from '../../../proptypes/Viewer';
import api from '../../../api';
import form from '../../../utils/form';
import i18n from '../../../languages';

const formFields = form.createFormFields([
  'name',
  'body',
  'personPronouns',
]);

// Display name, bio and pronouns, pre-filled with whatever is already there.
//
// Shown even when all three are filled in — somebody who applied through
// approval mode arrives with name and bio from their application — so they can
// see what others will see, and move straight through.
//
// Through the API rather than the people slice: this person is the viewer,
// not whichever profile the slice happens to be holding.
const OnboardingProfile = ({
  viewer,
  primaryLabel,
  onNext,
  onSkip,
  refreshSession,
  alertError,
}) => {
  const [person, setPerson] = useState(null);
  const [fields, setFields] = useState(formFields);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api.people.read(viewer.alias)
      .then(({ data }) => { if (!cancelled) setPerson(data); })
      // Nothing to pre-fill is not a reason to stop somebody filling it in.
      .catch(() => { if (!cancelled) setPerson({ id: viewer.id }); });

    return () => { cancelled = true; };
  }, [viewer.alias, viewer.id]);

  const handleOnChange = (event) => {
    const { target } = event;
    const { name, value } = target;

    setFields({ ...form.validateField(target, fields) });
    setPerson({ ...person, [name]: value });
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();

    const newFields = form.validateForm(event.target, fields);
    setFields({ ...newFields });

    if (!form.isValid(newFields)) {
      return;
    }

    setPending(true);

    // websiteUrl is not on this step, but it goes back with the rest.
    // PATCH /people/:id writes every field and clears any it is not sent, so
    // leaving it out would wipe the person's website.
    api.people.edit({
      ...form.fieldsToData(newFields),
      websiteUrl: person.websiteUrl || '',
      id: person.id,
    })
      .then(() => { return refreshSession(); })
      .then(() => {
        setPending(false);
        onNext();
      })
      .catch(() => {
        setPending(false);
        alertError(i18n.t('onboarding:prompts.error'));
      });
  };

  if (!person) {
    return <Progress />;
  }

  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {i18n.t('onboarding:profile.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('onboarding:profile.description')}
        </Typography>
        <PersonInfoFields
          fields={fields}
          person={person}
          handleOnChange={handleOnChange}
        />
      </CardContent>
      <StepActions
        label={primaryLabel}
        type="submit"
        pending={pending}
        onSkip={onSkip}
      />
    </form>
  );
};

OnboardingProfile.propTypes = {
  viewer: ViewerType.isRequired,
  primaryLabel: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  refreshSession: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

export default OnboardingProfile;
