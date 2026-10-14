/* eslint-env jest */
import featured from '../featured';

jest.mock('../../../api', () => {
  return {};
});

const { mergeFeatured } = featured;

const viewer = { id: 1 };

describe('mergeFeatured', () => {
  it('puts the inviter first', () => {
    const list = mergeFeatured({
      inviter: { id: 9 },
      people: [{ id: 2 }],
      groups: [{ id: 3 }],
      viewer,
    });

    expect(list.map((a) => { return a.id; })).toEqual([9, 2, 3]);
  });

  // An inviter who is also featured is shown once, where the inviter goes.
  it('shows an actor once', () => {
    const list = mergeFeatured({
      inviter: { id: 2 },
      people: [{ id: 2 }, { id: 4 }],
      viewer,
    });

    expect(list.map((a) => { return a.id; })).toEqual([2, 4]);
  });

  it('never offers the viewer to themselves', () => {
    const list = mergeFeatured({ people: [{ id: 1 }, { id: 2 }], viewer });

    expect(list.map((a) => { return a.id; })).toEqual([2]);
  });

  // The empty-list rule: nothing to offer means the step is skipped.
  it('is empty when there is nothing to offer', () => {
    expect(mergeFeatured({ viewer })).toEqual([]);
  });
});

describe('the steps somebody who has just joined gets', () => {
  it('always has a photo and a profile', () => {
    expect(featured.stepsFor({})).toEqual(['avatar', 'profile']);
  });

  it('adds interests when there are enough to pick from', () => {
    expect(featured.stepsFor({ interests: 2 })).toEqual(['avatar', 'profile']);
    expect(featured.stepsFor({ interests: 3 })).toEqual(['avatar', 'profile', 'interests']);
  });

  it('puts them in order, recommendations last', () => {
    expect(featured.stepsFor({ interests: 10, featured: 2, hasRecommendations: true }))
      .toEqual(['avatar', 'profile', 'interests', 'featured', 'recommended']);
  });

  it('has no recommendations without the service', () => {
    expect(featured.stepsFor({ featured: 2 })).toEqual(['avatar', 'profile', 'featured']);
  });
});
