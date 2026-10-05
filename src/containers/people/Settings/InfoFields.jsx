import React from 'react';
import PropTypes from 'prop-types';

import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import PersonType from '../../../proptypes/Person';
import { Person as PERSON } from '../../../constants';
import SelectPronouns from '../../../components/SelectPronouns';
import i18n from '../../../languages';
import postLanguage from '../../../utils/postLanguage';

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
        required
        slotProps={{
          htmlInput: {
            maxLength: NAME.MAX_LENGTH,
            minLength: NAME.MIN_LENGTH,
          },
        }}
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
        required
        slotProps={{
          htmlInput: {
            maxLength: BODY.MAX_LENGTH,
            minLength: BODY.MIN_LENGTH,
          },
        }}
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
      {/* The language this person usually writes in. The composer starts
          on it, on every device; each post can still say otherwise. Not
          the language of the interface, which is a different thing. */}
      <FormControl variant="standard" margin="normal" fullWidth>
        <InputLabel id="posting-language-label" shrink>
          {i18n.t('people:person.postingLanguage')}
        </InputLabel>
        <Select
          variant="standard"
          labelId="posting-language-label"
          name="language"
          value={postLanguage.primaryOf(person.language)}
          onChange={handleOnChange}
          displayEmpty
        >
          {/* Not chosen: the composer goes by the browser's language. */}
          <MenuItem value="">
            {i18n.t('people:person.postingLanguageUnset')}
          </MenuItem>
          {postLanguage.optionsWith(postLanguage.primaryOf(person.language)).map((code) => {
            return (
              <MenuItem key={`posting_language_${code}`} value={code}>
                {postLanguage.nameOf(code, i18n.language || 'en')}
              </MenuItem>
            );
          })}
        </Select>
        <FormHelperText>
          {i18n.t('people:person.postingLanguageHint')}
        </FormHelperText>
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
