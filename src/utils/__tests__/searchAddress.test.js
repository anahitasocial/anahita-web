/**
 * @jest-environment node
 */
/* eslint-env jest */
import address from '../searchAddress';

describe('the search page\'s address', () => {
  it('stays plain when everything is as it comes', () => {
    expect(address.of({ q: 'seeds' })).toBe('/search?q=seeds');
    expect(address.of({
      q: 'seeds', scope: 'all', sort: 'relevant', km: 125,
    })).toBe('/search?q=seeds');
  });

  it('carries the tab, the order and the distance', () => {
    const link = address.of({
      q: 'seed bank', scope: 'feeds', sort: 'recent', km: 50,
    });
    expect(link).toBe('/search?q=seed+bank&scope=feeds&sort=recent&km=50');
    expect(address.read(link.split('?')[1])).toEqual({
      q: 'seed bank', scope: 'feeds', sort: 'recent', km: 50,
    });
  });

  it('reads what it does not know as it comes', () => {
    expect(address.read('?q=x&scope=everything&sort=loudest&km=7')).toEqual({
      q: 'x', scope: 'all', sort: 'relevant', km: 125,
    });
    expect(address.read('')).toEqual({
      q: undefined, scope: 'all', sort: 'relevant', km: 125,
    });
  });

  it('leaves out what it does not know when writing', () => {
    expect(address.of({
      q: 'x', scope: 'everything', sort: 'loudest', km: 7,
    })).toBe('/search?q=x');
  });
});
