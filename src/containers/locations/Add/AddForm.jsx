import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';

import { Locations as LOCATION } from '../../../constants';
import LocationType from '../../../proptypes/Location';
import CountrySelect from '../../../components/SelectCountry';
import RegionSelect from '../../../components/SelectRegion';
import PointPicker from '../../../components/PointPicker';

import i18n from '../../../languages';

// As long as the server keeps it (geo_postalcode).
const POSTAL_CODE_MAX_LENGTH = 15;

const PointType = PropTypes.shape({
  latitude: PropTypes.number,
  longitude: PropTypes.number,
});

const {
  TITLE,
  ADDRESS,
  CITY,
} = LOCATION.FIELDS;

const LocationAddForm = ({
  handleOnChange,
  handleOnSubmit,
  fields,
  location,
  isFetching,
  actions = null,
  // A location needs a name and a point; the address is there to find the
  // point by, or to be read, and may be left out.
  requiredFields = ['name'],
  point = null,
  onPointChange,
  pointError = '',
  near = null,
  id = undefined,
}) => {
  return (
    <form
      id={id}
      onSubmit={handleOnSubmit}
      noValidate
      autoComplete="off"
    >
      <CardContent>
        <TextField
          id="location-name"
          margin="normal"
          variant="outlined"
          label={i18n.t('locations:location.name')}
          onChange={handleOnChange}
          name="name"
          value={location.name}
          error={fields.name.error !== ''}
          helperText={fields.name.error || ' '}
          disabled={isFetching}
          fullWidth
          autoFocus
          required={requiredFields.includes('name')}
          slotProps={{
            htmlInput: {
              maxLength: TITLE.MAX_LENGTH,
            },
          }}
        />
        <PointPicker
          point={point}
          onChange={onPointChange}
          near={near}
          error={pointError}
          disabled={isFetching}
        />
        <TextField
          id="location-address"
          margin="normal"
          variant="outlined"
          label={i18n.t('locations:location.address')}
          onChange={handleOnChange}
          name="address"
          value={location.address}
          error={fields.address.error !== ''}
          helperText={fields.address.error || ' '}
          disabled={isFetching}
          fullWidth
          required={requiredFields.includes('address')}
          slotProps={{
            htmlInput: {
              maxLength: ADDRESS.MAX_LENGTH,
            },
          }}
        />
        {fields.city &&
          <TextField
            id="location-city"
            margin="normal"
            variant="outlined"
            label={i18n.t('locations:location.city')}
            onChange={handleOnChange}
            name="city"
            value={location.city}
            error={fields.city.error !== ''}
            helperText={fields.city.error || ' '}
            disabled={isFetching}
            fullWidth
            required={requiredFields.includes('city')}
            slotProps={{
              htmlInput: {
                maxLength: CITY.MAX_LENGTH,
              },
            }}
          />}
        {fields.country &&
          <FormControl
            variant="outlined"
            fullWidth
            margin="normal"
          >
            <InputLabel id="location-country-label">
              {i18n.t('locations:location.country')}
            </InputLabel>
            <CountrySelect
              variant="outlined"
              id="location-country"
              name="country"
              label={i18n.t('locations:location.country')}
              onChange={handleOnChange}
              value={location.country}
              disabled={isFetching}
            />
          </FormControl>}
        {fields.state_province &&
          <FormControl
            variant="outlined"
            fullWidth
            margin="normal"
          >
            <InputLabel id="location-country-label">
              {i18n.t('locations:location.province')}
            </InputLabel>
            <RegionSelect
              variant="outlined"
              id="state_province"
              name="state_province"
              label={i18n.t('locations:location.province')}
              onChange={handleOnChange}
              value={location.stateProvince}
              disabled={location.country === '' || isFetching}
              country={location.country}
            />
          </FormControl>}
        <TextField
          id="location-postal-code"
          margin="normal"
          variant="outlined"
          label={i18n.t('locations:location.postalCode')}
          onChange={handleOnChange}
          name="postal_code"
          value={location.postal_code ?? location.postalCode ?? ''}
          error={fields.postal_code.error !== ''}
          helperText={fields.postal_code.error || ' '}
          disabled={isFetching}
          fullWidth
          required={requiredFields.includes('postal_code')}
          slotProps={{
            htmlInput: {
              maxLength: POSTAL_CODE_MAX_LENGTH,
            },
          }}
        />
      </CardContent>
      {actions &&
      <CardActions>
        {actions}
      </CardActions>}
    </form>
  );
};

LocationAddForm.propTypes = {
  id: PropTypes.string,
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  location: LocationType.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  actions: PropTypes.node,
  isFetching: PropTypes.bool.isRequired,
  requiredFields: PropTypes.arrayOf(PropTypes.string),
  point: PointType,
  onPointChange: PropTypes.func.isRequired,
  pointError: PropTypes.string,
  near: PointType,
};

export default LocationAddForm;
