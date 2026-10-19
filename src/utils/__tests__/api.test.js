/* eslint-env jest */
import api from '../api';

// A form's fields, as the services read them.
describe('api.constructFormData', () => {
  it('sends a list as the same key once for each item', () => {
    const form = api.constructFormData({ content: 'Hello', location_ids: [12, 31] });
    expect(form.getAll('location_ids')).toEqual(['12', '31']);
    expect(form.get('content')).toBe('Hello');
  });

  it('sends nothing for an empty list', () => {
    const form = api.constructFormData({ location_ids: [] });
    expect(form.has('location_ids')).toBe(false);
  });
});
