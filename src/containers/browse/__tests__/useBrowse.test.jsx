/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';

import useBrowse from '../useBrowse';

// A list in a store of its own: what the hook asks for is written down, and
// the test plays the server by answering with a page.
const listStore = () => {
  const empty = {
    items: { byId: {}, allIds: [] }, total: 0, error: '', isFetching: false,
  };
  const asked = [];
  const reducer = (state = empty, action) => {
    asked.push(action);
    switch (action.type) {
      case 'BROWSE':
        return { ...state, isFetching: true };
      case 'ANSWER': {
        const allIds = [...state.items.allIds, ...action.ids];
        const byId = { ...state.items.byId };
        action.ids.forEach((id) => { byId[id] = { id }; });
        return {
          ...state, isFetching: false, total: action.total, items: { byId, allIds },
        };
      }
      case 'FAIL':
        return { ...state, isFetching: false, error: action.error };
      case 'RESET':
        return empty;
      default:
        return state;
    }
  };
  return { store: createStore(reducer), asked };
};

const browse = (params) => { return { type: 'BROWSE', params }; };
const reset = () => { return { type: 'RESET' }; };
const prepend = (nodes) => { return { type: 'PREPEND', nodes }; };
const select = (state) => { return state; };
const ids = (from, count) => {
  return Array.from({ length: count }, (_, i) => { return from + i; });
};

describe('useBrowse', () => {
  let box;
  let root;
  let result;

  const List = (props) => {
    result = useBrowse({
      browse, reset, prepend, select, ...props,
    });
    return null;
  };

  const draw = (store, props = {}) => {
    act(() => {
      root.render(<Provider store={store}><List {...props} /></Provider>);
    });
  };

  const browsed = (asked) => {
    return asked.filter((a) => { return a.type === 'BROWSE'; }).map((a) => { return a.params; });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    box = document.createElement('div');
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('asks for the first page, with what else the list is of', () => {
    const { store, asked } = listStore();
    draw(store, { params: { filter: 'posts' } });
    expect(browsed(asked)).toEqual([{ filter: 'posts', start: 0, limit: 20 }]);
  });

  it('asks for the next page when scrolled, after the server has answered', () => {
    const { store, asked } = listStore();
    draw(store);
    act(() => { store.dispatch({ type: 'ANSWER', ids: ids(1, 20), total: 45 }); });
    act(() => { result.next(); });
    expect(browsed(asked).map((p) => { return p.start; })).toEqual([0, 20]);
  });

  it('asks for nothing while a page is on its way, or when there is no more', () => {
    const { store, asked } = listStore();
    draw(store);
    act(() => { result.next(); });
    expect(browsed(asked)).toHaveLength(1);
    act(() => { store.dispatch({ type: 'ANSWER', ids: ids(1, 5), total: 5 }); });
    expect(result.hasMore).toBe(false);
    act(() => { result.next(); });
    expect(browsed(asked)).toHaveLength(1);
  });

  it('begins the next page where the list says, as the home feed counts what it holds', () => {
    const { store, asked } = listStore();
    draw(store, { nextStart: (start, held) => { return Math.max(held, start + 1); } });
    act(() => { store.dispatch({ type: 'ANSWER', ids: ids(1, 23), total: 60 }); });
    act(() => { result.next(); });
    expect(browsed(asked)[1].start).toBe(23);
  });

  it('empties the list and reads it again from the first page when what it is of changes', () => {
    const { store, asked } = listStore();
    draw(store, { queryKey: 'a' });
    act(() => { store.dispatch({ type: 'ANSWER', ids: ids(1, 20), total: 45 }); });
    act(() => { result.next(); });
    act(() => { store.dispatch({ type: 'ANSWER', ids: ids(21, 20), total: 45 }); });
    asked.length = 0;
    draw(store, { queryKey: 'b' });
    expect(asked.map((a) => { return a.type; })).toEqual(['RESET', 'BROWSE']);
    expect(browsed(asked)[0].start).toBe(0);
  });

  it('is empty only once the server has answered with nothing', () => {
    const { store } = listStore();
    draw(store);
    expect(result.isEmpty).toBe(false);
    act(() => { store.dispatch({ type: 'ANSWER', ids: [], total: 0 }); });
    expect(result.isEmpty).toBe(true);
  });

  it('shows an error when one comes', () => {
    const { store, asked } = listStore();
    draw(store);
    act(() => { store.dispatch({ type: 'FAIL', error: 'The server could not be reached.' }); });
    const alert = asked.find((a) => { return a.type === 'APP_ALERT_ADD'; });
    expect(alert).toBeTruthy();
  });

  it('puts what is posted on top, through the list', () => {
    const { store, asked } = listStore();
    draw(store);
    act(() => { result.prepend([{ id: 99 }]); });
    expect(asked.find((a) => { return a.type === 'PREPEND'; }).nodes).toEqual([{ id: 99 }]);
  });

  it('empties the list when the page is left', () => {
    const { store, asked } = listStore();
    draw(store);
    asked.length = 0;
    act(() => { root.unmount(); });
    expect(asked.map((a) => { return a.type; })).toContain('RESET');
    root = createRoot(box);
  });
});
