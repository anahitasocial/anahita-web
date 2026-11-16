/* eslint-env jest */
import graphAccess from '../graphAccess';

// THE RULE THIS GUARDS (roadmap row 151): the choices are the Access card's
// own levels, only those narrower than the profile, after "the same".
describe('choicesFor', () => {
  it('offers a public person every narrower level', () => {
    expect(graphAccess.choicesFor('public', true)).toEqual(['', 'registered', 'followers', 'leaders', 'mutuals', 'myself']);
  });

  it('offers a followers-only person what is narrower still', () => {
    expect(graphAccess.choicesFor('followers', true)).toEqual(['', 'leaders', 'mutuals', 'myself']);
  });

  it('offers a group no people it follows or mutuals', () => {
    expect(graphAccess.choicesFor('public', false)).toEqual(['', 'registered', 'followers', 'admins']);
    expect(graphAccess.choicesFor('admins', false)).toEqual(['']);
  });
});

describe('myself and admins', () => {
  it('keeps a person\'s only me as admins on the server', () => {
    expect(graphAccess.toServer('myself')).toBe('admins');
    expect(graphAccess.toServer('followers')).toBe('followers');
    expect(graphAccess.fromServer('admins', true)).toBe('myself');
    expect(graphAccess.fromServer('admins', false)).toBe('admins');
    expect(graphAccess.fromServer(undefined, true)).toBe('');
  });
});

describe('every choice, for the access dialog (roadmap row 155)', () => {
  it('offers the same as the profile first, then every level, the wider ones greyed', () => {
    const options = graphAccess.optionsFor('followers', true);
    expect(options[0]).toEqual({ value: '', narrower: true });
    expect(options.map((o) => { return o.value; })).toEqual(['', 'public', 'registered', 'followers', 'leaders', 'mutuals', 'myself']);
    const open = options.filter((o) => { return o.narrower; }).map((o) => { return o.value; });
    expect(open).toEqual(['', 'leaders', 'mutuals', 'myself']);
  });
});
