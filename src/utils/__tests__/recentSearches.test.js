/**
 * @jest-environment node
 */
/* eslint-env jest */
import recent from '../recentSearches';

const memory = () => {
  const kept = {};
  return {
    kept,
    getItem: (key) => { return key in kept ? kept[key] : null; },
    setItem: (key, value) => { kept[key] = `${value}`; },
    removeItem: (key) => { delete kept[key]; },
  };
};

const terms = (searches) => {
  return searches.map((each) => { return each.term; });
};

describe('recent searches', () => {
  it('are listed newest first, with the tab each was run under', () => {
    const storage = memory();
    recent.add(7, 'seeds', 'feeds', storage);
    recent.add(7, 'compost', '', storage);
    recent.add(7, 'garden', 'actors', storage);

    expect(recent.list(7, storage)).toEqual([
      { term: 'garden', scope: 'actors' },
      { term: 'compost', scope: '' },
      { term: 'seeds', scope: 'feeds' },
    ]);
  });

  it('keep a search once, moved to the top and kept as last typed', () => {
    const storage = memory();
    recent.add(7, 'seeds', '', storage);
    recent.add(7, 'compost', '', storage);
    recent.add(7, '  Seeds ', 'feeds', storage);

    expect(recent.list(7, storage)).toEqual([
      { term: 'Seeds', scope: 'feeds' },
      { term: 'compost', scope: '' },
    ]);
  });

  it('keep ten, the oldest going first', () => {
    const storage = memory();
    for (let i = 1; i <= 11; i += 1) {
      recent.add(7, `term ${i}`, '', storage);
    }

    const kept = terms(recent.list(7, storage));
    expect(kept).toHaveLength(recent.MAX);
    expect(kept[0]).toBe('term 11');
    expect(kept).not.toContain('term 1');
  });

  it('do not keep what the server would not search for', () => {
    const storage = memory();
    recent.add(7, 'a', '', storage);
    recent.add(7, '   ', '', storage);
    recent.add(7, 'x'.repeat(101), '', storage);
    recent.add(7, null, '', storage);

    expect(recent.list(7, storage)).toEqual([]);
  });

  it('are each person\'s own', () => {
    const storage = memory();
    recent.add(7, 'seeds', '', storage);
    recent.add(8, 'compost', '', storage);

    expect(terms(recent.list(7, storage))).toEqual(['seeds']);
    expect(terms(recent.list(8, storage))).toEqual(['compost']);
    // A visitor who is not signed in has none, and keeps none.
    expect(recent.add(0, 'garden', '', storage)).toEqual([]);
    expect(Object.keys(storage.kept)).toHaveLength(2);
  });

  it('can be forgotten one at a time, or all at once', () => {
    const storage = memory();
    recent.add(7, 'seeds', '', storage);
    recent.add(7, 'compost', '', storage);

    expect(terms(recent.remove(7, 'SEEDS', storage))).toEqual(['compost']);
    expect(terms(recent.list(7, storage))).toEqual(['compost']);

    recent.clear(7, storage);
    expect(recent.list(7, storage)).toEqual([]);
    expect(storage.kept).toEqual({});
  });

  it('are none, and break nothing, when storage is refused or spoilt', () => {
    const refusing = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
      removeItem: () => { throw new Error('denied'); },
    };
    expect(recent.list(7, refusing)).toEqual([]);
    expect(() => { recent.add(7, 'seeds', '', refusing); }).not.toThrow();
    expect(() => { recent.clear(7, refusing); }).not.toThrow();

    const spoilt = memory();
    spoilt.setItem('search.recent.7', '{not json');
    expect(recent.list(7, spoilt)).toEqual([]);
    spoilt.setItem('search.recent.7', JSON.stringify([{ term: 'ok' }, 5, { term: 'x' }]));
    expect(terms(recent.list(7, spoilt))).toEqual(['ok']);

    expect(recent.list(7, null)).toEqual([]);
  });
});
