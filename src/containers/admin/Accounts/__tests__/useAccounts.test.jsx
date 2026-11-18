/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

import api from '../../../../api';
import useAccounts from '../useAccounts';

vi.mock('../../../../api', () => {
  return {
    default: {
      accounts: { browse: vi.fn(), BATCH_MAX: 3 },
    },
  };
});

const ROY = { id: 1, personType: 'super-administrator' };

// Accounts named after the IT Crowd and Stargate, the viewer among them.
const person = (id, extra = {}) => {
  return {
    id, kind: 'person', alias: `p${id}`, personType: 'registered', ...extra,
  };
};
const MOSS = person(2);
const JEN = person(3);
const TEALC = person(4, { personType: 'administrator' });
const CARTER = person(5);

// The server's answer: a page of accounts, and how many match in all.
const page = (accounts, total) => {
  return Promise.resolve({ data: { data: accounts, pagination: { total } } });
};

describe('useAccounts', () => {
  let box;
  let root;
  let result;
  let alerts;

  // As the store gives it, the same function on every render: the list is
  // asked for again whenever it changes.
  const alertError = (message) => { alerts.push(message); };

  const List = () => {
    result = useAccounts({ viewer: ROY, alertError });
    return null;
  };

  // Lets the server's answer, and anything after it, land.
  const settled = async () => {
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    });
  };

  const draw = async () => {
    act(() => {
      root.render(<List />);
    });
    await settled();
  };

  const asked = () => {
    return api.accounts.browse.mock.calls.map((call) => { return call[0]; });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    alerts = [];
    api.accounts.browse.mockReset();
    api.accounts.browse.mockImplementation(() => {
      return page([ROY, MOSS, JEN, TEALC], 6);
    });
    box = document.createElement('div');
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    vi.useRealTimers();
  });

  it('asks for the first page of people, with no filter', async () => {
    await draw();

    expect(asked()[0]).toMatchObject({
      kind: 'person', q: '', tier: '', state: '', limit: 50, offset: 0,
    });
    expect(result.items).toHaveLength(4);
    expect(result.total).toBe(6);
    expect(result.isFetching).toBe(false);
    expect(result.filtered).toBe(false);
  });

  it('adds the next page after the accounts it holds', async () => {
    await draw();
    api.accounts.browse.mockImplementation(() => { return page([CARTER], 6); });

    act(() => { result.more(); });
    await settled();

    expect(asked()[1]).toMatchObject({ offset: 4 });
    expect(result.items.map((account) => { return account.id; })).toEqual([1, 2, 3, 4, 5]);
  });

  it('searches once the typing pauses', async () => {
    await draw();

    act(() => { result.setSearch(' moss '); });
    expect(asked()).toHaveLength(1);

    await act(async () => { vi.advanceTimersByTime(400); });
    await settled();

    expect(asked()[1]).toMatchObject({ q: 'moss', offset: 0 });
    expect(result.filtered).toBe(true);
  });

  it('never selects the viewer or an administrator', async () => {
    await draw();

    expect(result.selectable.map((account) => { return account.id; })).toEqual([2, 3]);
    expect(result.hasProtected).toBe(true);

    act(() => { result.toggleShown(); });
    expect(result.selectedAccounts.map((account) => { return account.id; })).toEqual([2, 3]);

    act(() => { result.toggleShown(); });
    expect(result.selectedAccounts).toEqual([]);
  });

  it('selects every account that matches, up to as many as may be removed at once', async () => {
    await draw();
    api.accounts.browse.mockImplementation(() => { return page([MOSS, JEN, TEALC], 6); });

    act(() => { result.selectMatching(); });
    await settled();

    expect(asked()[1]).toMatchObject({ limit: 3, offset: 0 });
    expect(Object.keys(result.selected)).toEqual(['2', '3']);
  });

  it('drops the selection and starts again when a filter changes', async () => {
    await draw();
    act(() => { result.toggle(MOSS); });
    expect(result.selectedAccounts).toEqual([MOSS]);

    act(() => { result.setFilter('tier', 'dormant'); });
    await settled();

    expect(asked()[1]).toMatchObject({ tier: 'dormant', offset: 0 });
    expect(result.selectedAccounts).toEqual([]);
    expect(result.filtered).toBe(true);

    act(() => { result.clearFilters(); });
    await settled();
    expect(result.filtered).toBe(false);
  });

  it('lets go of the filters a person has when groups are chosen', async () => {
    await draw();
    act(() => { result.setFilter('onlyUnverified', true); });
    await settled();

    act(() => { result.changeKind('group'); });
    await settled();

    expect(result.hasAdmins).toBe(true);
    expect(result.oneAtATime).toBe(false);
    expect(asked()[asked().length - 1]).toMatchObject({ kind: 'group', onlyUnverified: false });
  });

  it('offers no ticks for events, which are removed one at a time', async () => {
    await draw();
    act(() => { result.changeKind('event'); });
    await settled();

    expect(result.oneAtATime).toBe(true);
    expect(result.canSelect({ ...MOSS, kind: 'event' })).toBe(false);
  });

  it('says when the list could not be read', async () => {
    api.accounts.browse.mockImplementation(() => { return Promise.reject(new Error('down')); });
    await draw();

    expect(alerts).toHaveLength(1);
    expect(result.isFetching).toBe(false);
  });
});
