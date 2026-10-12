import React from 'react';
import PropTypes from 'prop-types';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// A list of words, typed one at a time and kept as chips: hashtags,
// keywords. Enter, or leaving the field, adds what was typed.
//
// `clean` tidies each word as it is added, and a word that comes out empty,
// or is there already, is dropped. No more than `max` are kept.
const WordsField = ({
  label,
  helperText = '',
  value,
  onChange,
  clean = (word) => {
    return word.trim();
  },
  max = 10,
  disabled = false,
}) => {
  const handleChange = (event, words) => {
    const kept = [];

    words.forEach((word) => {
      const cleaned = clean(String(word));
      const known = kept.some((each) => {
        return each.toLowerCase() === cleaned.toLowerCase();
      });

      if (cleaned && !known && kept.length < max) {
        kept.push(cleaned);
      }
    });

    onChange(kept);
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      autoSelect
      options={[]}
      value={value}
      disabled={disabled}
      onChange={handleChange}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            label={label}
            helperText={helperText}
          />
        );
      }}
    />
  );
};

WordsField.propTypes = {
  label: PropTypes.string.isRequired,
  helperText: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  clean: PropTypes.func,
  max: PropTypes.number,
  disabled: PropTypes.bool,
};

export default WordsField;
