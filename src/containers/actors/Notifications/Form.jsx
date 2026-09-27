import React from 'react';
import PropTypes from 'prop-types';

import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Switch from '@mui/material/Switch';

import i18n from '../../../languages';

const ActorsNotificationsForm = (props) => {
  const {
    namespace,
    emailMutedGlobally,
    sendEmail,
    isSubscribed,
    handleEditType,
    handleEdit,
  } = props;

  return (
    <>
      <FormControl variant="standard" margin="normal" fullWidth>
        <FormLabel component="legend">
          {i18n.t(`${namespace}:notifications.optionsTitle`)}
        </FormLabel>
        <RadioGroup
          aria-label="gender"
          value={isSubscribed ? 0 : 1}
          onChange={handleEditType}
        >
          <FormControlLabel
            value={0}
            control={<Radio />}
            label={i18n.t(`${namespace}:notifications.options.all`)}
          />
          <FormControlLabel
            value={1}
            control={<Radio />}
            label={i18n.t(`${namespace}:notifications.options.following`)}
          />
        </RadioGroup>
      </FormControl>
      {!emailMutedGlobally &&
      <FormControlLabel
        control={
          <Switch
            checked={sendEmail}
            onChange={handleEdit}
            name="sendEmail"
          />
        }
        label={i18n.t(`${namespace}:notifications.email`)}
      />}
    </>
  );
};

ActorsNotificationsForm.propTypes = {
  namespace: PropTypes.string.isRequired,
  emailMutedGlobally: PropTypes.bool.isRequired,
  sendEmail: PropTypes.bool.isRequired,
  isSubscribed: PropTypes.bool.isRequired,
  handleEditType: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
};

export default ActorsNotificationsForm;
