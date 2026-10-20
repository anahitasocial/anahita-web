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

fieldNames.push('postal_code');

const formFields = form.createFormFields(fieldNames);

const FORM_ID = 'location-add-form';

// What the person typed that the server can find a point by. A city, state or
// country the operator fixed is not enough on its own: it would put the pin
// in the middle of the city.
const typedAddress = (formData) => {
  return ['address', 'city', 'postal_code'].some((key) => {
    return fieldNames.includes(key) && String(formData[key] || '').trim() !== '';
  });
};

const LocationsSelectorAdd = (props) => {
  const {
    node = null,
    name,
    callback,
    near = null,
    startPoint = null,
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
  });
  const [isFetching, setIsFetching] = useState(false);
  // Where the pin starts: none, unless the composer was searching near a
  // photo's position, where the new location most likely is (part 5).
  const [point, setPoint] = useState(startPoint);
  const [pointError, setPointError] = useState('');

  const handlePointChange = (newPoint) => {
    setPoint(newPoint);
    setPointError('');
  };

  const handleOnChange = (event) => {
    const { target } = event;
    const newFields = form.validateField(target, fields);

    location[target.name] = target.value;

    setFields({ ...newFields });
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();
    // Its own submit only. Opened from a composer, this form is drawn
    // outside the composer's form but inside its React tree, which passes
    // the submit on to the composer, and posted the post with it.
    event.stopPropagation();

    const { target } = event;
    const newFields = form.validateForm(target, fields);

    const formData = form.fieldsToData(newFields);
    const located = Boolean(point) || typedAddress(formData);

    setPointError(located ? '' : i18n.t('locations:point.needed'));

    if (form.isValid(newFields) && located) {
      // A pin placed wins over the address; with none, the server finds the
      // point by the address.
      if (point) {
        formData.latitude = point.latitude;
        formData.longitude = point.longitude;
      }

      formData.city = process.env.REACT_APP_LOCATION_FIXED_CITY || formData.city;

      formData.state_province =
      process.env.REACT_APP_LOCATION_FIXED_STATE_PROVINCE ||
      formData.state_province;
      formData.country = process.env.REACT_APP_LOCATION_FIXED_COUNTRY || formData.country;

      setIsFetching(true);
      api.locations.add(formData)
        .then((response) => {
          // From a composer there is no post yet: the location goes back to
          // it, to be tied to the post once it is posted.
          if (!node) {
            setIsFetching(false);
            callback(response.data);
            return;
          }
          api.tagGraph(node)
            .add(response.data)
            .then(() => {
              setIsFetching(false);
              callback(response.data);
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
          point={point}
          onPointChange={handlePointChange}
          pointError={pointError}
          near={near}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          type="submit"
          form={FORM_ID}
          color="primary"
          disabled={isFetching}
          variant="contained"
        >
          {i18n.t('actions:add')}
        </Button>
      </DialogActions>
    </>
  );
};

LocationsSelectorAdd.propTypes = {
  // The post to tie the new location to; none from a composer, whose post
  // is not made yet.
  node: NodeType,
  name: PropTypes.string.isRequired,
  // Called with the location made.
  callback: PropTypes.func.isRequired,
  near: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  // A pin already placed, to be moved if need be.
  startPoint: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
};

export default LocationsSelectorAdd;
