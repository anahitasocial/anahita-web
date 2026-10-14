/**
 * @jest-environment node
 */
/* eslint-env jest */
import choices from '../searchChoices';

const memory = () => {
  const kept = {};
  return {
    getItem: (key) => { return key in kept ? kept[key] : null; },
    setItem: (key, value) => { kept[key] = `${value}`; },
  };
};

describe('how somebody likes Most relevant ordered', () => {
  it('is as it comes until chosen, and each person\'s own', () => {
    const storage = memory();
    expect(choices.read(7, storage)).toEqual(choices.NONE);

    choices.write(7, { followedFirst: true }, storage);
    expect(choices.read(7, storage)).toEqual({ followedFirst: true, recentFirst: false });
    expect(choices.read(8, storage)).toEqual(choices.NONE);
    expect(choices.read(0, storage)).toEqual(choices.NONE);
  });

  it('sends only what is chosen', () => {
    expect(choices.paramsOf(choices.NONE)).toEqual({});
    expect(choices.paramsOf({ followedFirst: true, recentFirst: true }))
      .toEqual({ followed_first: true, recent_first: true });
  });

  it('is as it comes when storage is refused or spoilt', () => {
    const refusing = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
    };
    expect(choices.read(7, refusing)).toEqual(choices.NONE);
    expect(choices.write(7, { recentFirst: 'yes' }, refusing)).toEqual({ followedFirst: false, recentFirst: true });

    const spoilt = memory();
    spoilt.setItem('search.choices.7', '{nope');
    expect(choices.read(7, spoilt)).toEqual(choices.NONE);
  });
});
