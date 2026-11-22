/* global globalThis */
import React, { act } from 'react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

import api from '../../../api';
import useFeedsBrowse from '../useFeedsBrowse';
import apiUtils from '../../../utils/api';

vi.mock('../../../api', () => {
  return {
    default: {
      customFeeds: {
        pinned: vi.fn(),
        discover: vi.fn(),
        setPinned: vi.fn(),
        setPins: vi.fn(),
        deleteItem: vi.fn(),
      },
    },
  };
});

const feed = (id) => { return { id, name: `Feed ${id}` }; };
// As the API's client hands an answer on: every key camelCased.
const answer = (data, pagination) => {
  return Promise.resolve({ data: apiUtils.camelCaseKeys(pagination ? { data, pagination } : { data }) });
};

describe('useFeedsBrowse', () => {
  let box;
  let root;
  let result;
  let alerts;

  // As the store gives them, the same functions on every render.
  const alertSuccess = (message) => { alerts.push(['success', message]); };
  const alertError = (message) => { alerts.push(['error', message]); };

  const List = ({ whose }) => {
    result = useFeedsBrowse({ whose, alertSuccess, alertError });
    return null;
  };

  List.propTypes = { whose: PropTypes.string.isRequired };

  const settled = async () => {
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    });
  };

  const draw = async (whose = 'everyone') => {
    act(() => {
      root.render(<List whose={whose} />);
    });
    await settled();
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    alerts = [];
    vi.clearAllMocks();
    api.customFeeds.pinned.mockImplementation(() => { return answer([feed(2), feed(3)]); });
    api.customFeeds.discover.mockImplementation(() => {
      return answer([feed(1), feed(2)], { next_start: 20, has_more: true });
    });
    box = document.createElement('div');
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('reads the first page of the chosen list, and the feeds on the home page', async () => {
    await draw('mine');

    expect(api.customFeeds.discover.mock.calls[0][0])
      .toEqual({ whose: 'mine', start: 0, limit: 20 });
    expect(result.shown.map((each) => { return each.id; })).toEqual([1, 2]);
    expect(result.hasMore).toBe(true);
    expect(result.isLoading).toBe(false);
    expect(result.placeOf(feed(2))).toBe(0);
    expect(result.placeOf(feed(1))).toBe(-1);
  });

  it('shows the feeds on the home page alone, without asking for a list', async () => {
    await draw('home');

    expect(api.customFeeds.discover).not.toHaveBeenCalled();
    expect(result.shown.map((each) => { return each.id; })).toEqual([2, 3]);
    expect(result.pinnedCount).toBe(2);
  });

  it('adds the next page where the server says it starts', async () => {
    await draw();
    api.customFeeds.discover.mockImplementation(() => {
      return answer([feed(4)], { has_more: false });
    });

    act(() => { result.more(); });
    await settled();

    expect(api.customFeeds.discover.mock.calls[1][0]).toMatchObject({ start: 20 });
    expect(result.shown.map((each) => { return each.id; })).toEqual([1, 2, 4]);
    expect(result.hasMore).toBe(false);
  });

  it('says the list failed when it could not be read', async () => {
    api.customFeeds.pinned.mockImplementation(() => { return Promise.reject(new Error('down')); });
    await draw();

    expect(result.hasFailed).toBe(true);
  });

  it('puts a feed on the home page, and reads the home page again', async () => {
    api.customFeeds.setPinned.mockImplementation(() => { return Promise.resolve({}); });
    await draw();

    act(() => { result.pin(feed(1), true); });
    expect(result.waiting).toBe(true);
    await settled();

    expect(api.customFeeds.setPinned.mock.calls[0]).toEqual([feed(1), true]);
    expect(api.customFeeds.pinned).toHaveBeenCalledTimes(2);
    expect(alerts[0][0]).toBe('success');
    expect(result.waiting).toBe(false);
  });

  it('moves a feed one place on the home page, and not past either end', async () => {
    api.customFeeds.setPins.mockImplementation(() => { return answer([feed(3), feed(2)]); });
    await draw('home');

    act(() => { result.move(feed(2), -1); });
    expect(api.customFeeds.setPins).not.toHaveBeenCalled();

    act(() => { result.move(feed(2), 1); });
    await settled();

    expect(api.customFeeds.setPins.mock.calls[0][0]).toEqual([3, 2]);
    expect(result.placeOf(feed(3))).toBe(0);
  });

  it('takes a deleted feed out of the list, and says why one was refused', async () => {
    api.customFeeds.deleteItem.mockImplementation(() => { return Promise.resolve({}); });
    await draw();

    act(() => { result.deleteItem(feed(1)); });
    await settled();
    expect(result.shown.map((each) => { return each.id; })).toEqual([2]);

    api.customFeeds.deleteItem.mockImplementation(() => { return Promise.reject(new Error('down')); });
    act(() => { result.deleteItem(feed(2)); });
    await settled();
    expect(alerts[alerts.length - 1][0]).toBe('error');
    expect(result.waiting).toBe(false);
  });
});
