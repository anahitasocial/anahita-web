import React from 'react';
import PropTypes from 'prop-types';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';

import PersonType from '../../../proptypes/Person';
import { Person as PERSON } from '../../../constants';
import SelectPronouns from '../../../components/SelectPronouns';
import i18n from '../../../languages';

const {
  NAME,
  BODY,
} = PERSON.FIELDS;

// Name, bio and pronouns: what others see beside a person's avatar.
//
// Shared by the settings form and the onboarding profile step, so the two can
// never disagree about limits or labels. The container declares `name` and
// `body` in its createFormFields; pronouns has no validation to report.
const PersonInfoFields = ({
  handleOnChange,
  fields,
  person,
  autoFocus = true,
}) => {
  const {
    name,
    body,
  } = fields;

  return (
    <>
      <TextField
        variant="standard"
        name="name"
        value={person.name || ''}
        onChange={handleOnChange}
        label={i18n.t('people:person.displayName')}
        error={name.error !== ''}
        helperText={name.error}
        autoFocus={autoFocus}
        fullWidth
        margin="normal"
        inputProps={{
          maxLength: NAME.MAX_LENGTH,
          minLength: NAME.MIN_LENGTH,
        }}
        required
      />
      <TextField
        variant="standard"
        name="body"
        value={person.body || ''}
        onChange={handleOnChange}
        label={i18n.t('people:person.body')}
        error={body.error !== ''}
        helperText={body.error}
        margin="normal"
        fullWidth
        multiline
        inputProps={{
          maxLength: BODY.MAX_LENGTH,
          minLength: BODY.MIN_LENGTH,
        }}
        required
      />
      <FormControl variant="standard" margin="normal" fullWidth>
        <InputLabel id="pronouns-label" shrink>
          {i18n.t('people:person.pronouns')}
        </InputLabel>
        <SelectPronouns
          labelId="pronouns-label"
          name="personPronouns"
          value={person.personPronouns || ''}
          onChange={handleOnChange}
        />
      </FormControl>
    </>
  );
};

PersonInfoFields.propTypes = {
  handleOnChange: PropTypes.func.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  person: PersonType.isRequired,
  autoFocus: PropTypes.bool,
};

export default PersonInfoFields;
