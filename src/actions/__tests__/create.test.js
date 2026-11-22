/* eslint-env jest */
import createActions from '../create';
import apiUtils from '../../utils/api';

// What a list's browse says of the page after this one, from what the
// server answered, camelCased as the API's client does to every answer.
const hasMoreAfter = async (pagination, count) => {
  const data = Array.from({ length: count }, (_, i) => { return { id: i + 1 }; });
  const answer = { data: apiUtils.camelCaseKeys({ data, pagination }) };
  const api = { browse: () => { return Promise.resolve(answer); } };
  const dispatched = [];
  await createActions('feed_leaders')(api).browse({})((action) => { dispatched.push(action); });
  return dispatched.find((a) => { return a.type === 'FEED_LEADERS_BROWSE_SUCCESS'; }).hasMore;
};

describe('whether a list has another page', () => {
  // THE RULE THIS GUARDS (roadmap row 170): the home feed is not counted,
  // and says whether there is more; that is taken over any guess.
  it('takes has_more where the server says it, as hasMore once camelCased', async () => {
    expect(await hasMoreAfter({
      offset: 0, limit: 20, total: 0, has_more: false,
    }, 20)).toBe(false);
    expect(await hasMoreAfter({
      offset: 0, limit: 20, total: 0, has_more: true,
    }, 20)).toBe(true);
  });

  it('works it out from a total', async () => {
    expect(await hasMoreAfter({ offset: 0, limit: 20, total: 25 }, 20)).toBe(true);
    expect(await hasMoreAfter({ offset: 20, limit: 20, total: 25 }, 5)).toBe(false);
  });

  it('guesses from a full page with neither', async () => {
    expect(await hasMoreAfter({ offset: 0, limit: 20, total: 0 }, 20)).toBe(true);
    expect(await hasMoreAfter({ offset: 0, limit: 20, total: 0 }, 7)).toBe(false);
  });
});
