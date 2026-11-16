import medium from '../medium';

// A site administrator warns as a moderator what they did not write
// (anahita-services row 122, phase 4).
describe('medium.isWarningModerator', () => {
  const post = { id: 1, author: { id: 7 } };

  it('is an administrator on somebody else\'s post', () => {
    expect(medium.isWarningModerator({ id: 9, personType: 'administrator' }, post)).toBe(true);
    expect(medium.isWarningModerator({ id: 9, personType: 'super-administrator' }, post)).toBe(true);
  });

  it('is not an administrator on their own post, nor anybody else', () => {
    expect(medium.isWarningModerator({ id: 7, personType: 'administrator' }, post)).toBe(false);
    expect(medium.isWarningModerator({ id: 9, personType: 'registered' }, post)).toBe(false);
    expect(medium.isWarningModerator(null, post)).toBe(false);
  });
});
