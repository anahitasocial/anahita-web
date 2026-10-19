/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import LocationForm from './AddForm';
import api from '../../../api';
import i18n from '../../../languages';
import form from '../../../utils/form';
import NodeType from '../../../proptypes/Node';
import LocationDefault from '../../../proptypes/LocationDefault';

const fieldNames = ['name', 'address'];

if (!process.env.REACT_APP_LOCATION_FIXED_CITY) {
  fieldNames.push('city');
}

if (!process.env.REACT_APP_LOCATION_FIXED_STATE_PROVINCE) {
  fieldNames.push('state_province');
}

if (!process.env.REACT_APP_LOCATION_FIXED_COUNTRY) {
  fieldNames.push('country');
}

const formFields = form.createFormFields(fieldNames);

const FORM_ID = 'location-add-form';

const LocationsSelectorAdd = (props) => {
  const {
    node,
    name,
    callback,
  } = props;

  formFields.name.value = name;

  const [fields, setFields] = useState(formFields);
  /* eslint no-unused-vars: "off" */
  const [location, setLocation] = useState({
    ...LocationDefault,
    // What was searched for, so a place not found is added under that name.
    name,
    country: process.env.REACT_APP_LOCATION_FIXED_COUNTRY,
    state_province: process.env.REACT_APP_LOCATION_FIXED_STATE_PROVINCE,
    city: process.env.REACT_APP_LOCATION_FIXED_CITY,
    source_id: node.id,
  });
  const [isFetching, setIsFetching] = useState(false);

  const handleOnChange = (event) => {
    const { target } = event;
    const newFields = form.validateField(target, fields);

    location[target.name] = target.value;

    setFields({ ...newFields });
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();

    const { target } = event;
    const newFields = form.validateForm(target, fields);

    if (form.isValid(newFields)) {
      const formData = form.fieldsToData(newFields);

      formData.city = process.env.REACT_APP_LOCATION_FIXED_CITY || formData.city;

      formData.state_province =
      process.env.REACT_APP_LOCATION_FIXED_STATE_PROVINCE ||
      formData.state_province;
      formData.country = process.env.REACT_APP_LOCATION_FIXED_COUNTRY || formData.country;

      setIsFetching(true);
      api.locations.add(formData)
        .then((response) => {
          api.tagGraph(node)
            .add(response.data)
            .then(() => {
              setIsFetching(false);
              callback();
            })
            .catch((err) => {
              console.error('Error adding location to tag graph', err);
            });
        }).catch(() => {
          setIsFetching(false);
        });
    }

    setFields({ ...newFields });
  };

  // The form scrolls inside the dialog's fixed height, and its button stays
  // in view under it, tied to the form by its id.
  return (
    <>
      <DialogContent sx={{ p: 0 }}>
        <LocationForm
          id={FORM_ID}
          fields={fields}
          location={location}
          handleOnChange={handleOnChange}
          handleOnSubmit={handleOnSubmit}
          isFetching={isFetching}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          type="submit"
          form={FORM_ID}
          color="primary"
          disabled={isFetching}
          variant="contained"
          fullWidth
        >
          {i18n.t('actions:add')}
        </Button>
      </DialogActions>
    </>
  );
};

LocationsSelectorAdd.propTypes = {
  node: NodeType.isRequired,
  name: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired,
};

export default LocationsSelectorAdd;
