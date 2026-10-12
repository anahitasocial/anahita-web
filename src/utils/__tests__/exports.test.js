/**
 * @jest-environment node
 */
/* eslint-env jest */
import dataExports from '../exports';

describe('a copy of your own data', () => {
  it('shows the latest export that is still worth showing', () => {
    expect(dataExports.current([{ status: 'cancelled' }, { status: 'ready', id: 'a' }, { status: 'expired' }]).id).toBe('a');
    expect(dataExports.current([{ status: 'building', id: 'b' }, { status: 'ready', id: 'a' }]).id).toBe('b');
    expect(dataExports.current([{ status: 'failed', id: 'c' }]).id).toBe('c');
    expect(dataExports.current([{ status: 'expired' }, { status: 'cancelled' }])).toBe(null);
    expect(dataExports.current([])).toBe(null);
    expect(dataExports.current(undefined)).toBe(null);
  });

  it('can be asked for when none is being made and it is not too soon', () => {
    const now = Date.UTC(2026, 9, 11);

    expect(dataExports.canAsk([], '', now)).toBe(true);
    expect(dataExports.canAsk([{ status: 'ready' }], '', now)).toBe(true);
    expect(dataExports.canAsk([{ status: 'pending' }], '', now)).toBe(false);
    expect(dataExports.canAsk([{ status: 'building' }], '', now)).toBe(false);
    expect(dataExports.canAsk([], '2026-10-15T00:00:00Z', now)).toBe(false);
    expect(dataExports.canAsk([], '2026-10-10T00:00:00Z', now)).toBe(true);
  });

  it('says how big an archive is, and a day', () => {
    expect(dataExports.size(841728906)).toBe('803 MB');
    expect(dataExports.size(3 * 1024 * 1024 * 1024)).toBe('3 GB');
    expect(dataExports.size(2048)).toBe('2 KB');
    expect(dataExports.size(0)).toBe('1 KB');
    expect(dataExports.day('2026-10-18T05:00:00Z', 'en-GB')).toMatch(/1[78] October 2026/);
    expect(dataExports.day('', 'en-GB')).toBe('');
    expect(dataExports.day('not a date', 'en-GB')).toBe('');
  });

  it('tells an installation without the service from an error', () => {
    expect(dataExports.isAbsent({ response: { status: 404 } })).toBe(true);
    expect(dataExports.isAbsent({ response: { status: 502 } })).toBe(true);
    expect(dataExports.isAbsent({})).toBe(true);
    expect(dataExports.isAbsent({ response: { status: 500 } })).toBe(false);
    expect(dataExports.isAbsent({ response: { status: 403 } })).toBe(false);
  });
});
