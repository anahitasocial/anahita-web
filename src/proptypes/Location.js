import {
  shape,
  number,
  string,
  arrayOf,
} from 'prop-types';

import PersonType from './Person';

export default shape({
  id: number,
  type: string,
  name: string,
  alias: string,
  body: string,
  author: PersonType,
  createdAt: string,
  editor: PersonType,
  updatedAt: string,
  latitude: number,
  longitude: number,
  commands: arrayOf(string),
  address: string,
  city: string,
  state_province: string,
  country: string,
});
