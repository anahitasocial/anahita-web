/* global globalThis */
import React, { act } from 'react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import {
  MemoryRouter, Route, Routes, useLocation,
} from 'react-router-dom';
import { legacy_createStore as createStore } from 'redux';
import { vi } from 'vitest';

import useActorSettings from '../useActorSettings';
import { ITEMS, SECTIONS } from '../sections';

// The actions are written down as plain objects: the hook is asked only
// what it dispatches, not what the server answers.
vi.mock('../../../../actions', () => {
  const read = (id, namespace) => { return { type: 'READ', id, namespace }; };
  return {
    default: {
      people: { read },
      groups: { read },
      events: { read },
      app: {
        alert: {
          error: (message) => { return { type: 'ALERT_ERROR', message }; },
          success: (message) => { return { type: 'ALERT_SUCCESS', message }; },
        },
      },
    },
  };
});

const AMOS = { id: 3, personType: 'registered' };
const NAOMI = { id: 4, personType: 'administrator' };
const DRUMMER = { id: 5, personType: 'super-administrator' };

// A store holding one profile of a namespace, as its reducer keeps it, and
// what is dispatched to it.
const storeOf = (namespace, current, viewer, slice = {}) => {
  const dispatched = [];
  const initial = {
    [namespace]: {
      [namespace]: { current },
      isFetching: false,
      error: '',
      success: false,
      ...slice,
    },
    session: { viewer },
  };
  const reducer = (state = initial, action) => {
    dispatched.push(action);
    if (action.type === 'SET') {
      return { ...state, [namespace]: { ...state[namespace], ...action.slice } };
    }
    return state;
  };
  return { store: createStore(reducer), dispatched };
};

describe('useActorSettings', () => {
  let box;
  let root;
  let result;
  let where;

  const Page = ({ namespace, selectedTab }) => {
    result = useActorSettings(namespace, selectedTab);
    where = useLocation();
    return null;
  };

  Page.propTypes = {
    namespace: PropTypes.string.isRequired,
    selectedTab: PropTypes.string,
  };

  const draw = (store, namespace, entry, selectedTab) => {
    act(() => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[entry]}>
            <Routes>
              <Route
                path={`/${namespace}/:id/settings/:section?`}
                element={<Page namespace={namespace} selectedTab={selectedTab} />}
              />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    });
  };

  const reads = (dispatched) => {
    return dispatched.filter((action) => { return action.type === 'READ'; });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    box = document.createElement('div');
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('reads a person by the whole of their username, hyphen and all', () => {
    const { store, dispatched } = storeOf('people', {}, AMOS);
    draw(store, 'people', '/people/jean-luc/settings');

    expect(reads(dispatched)).toEqual([{ type: 'READ', id: 'jean-luc', namespace: 'people' }]);
    expect(result.isLoading).toBe(false);
  });

  it('reads a group by the number before its name', () => {
    const { store, dispatched } = storeOf('groups', {}, AMOS);
    draw(store, 'groups', '/groups/7-tycho-station/settings');

    expect(reads(dispatched)).toEqual([{ type: 'READ', id: '7', namespace: 'groups' }]);
  });

  it('does not read a profile the store already holds', () => {
    const { store, dispatched } = storeOf('people', { id: 3 }, AMOS);
    draw(store, 'people', '/people/amos/settings');

    expect(reads(dispatched)).toEqual([]);
  });

  it('is loading while a profile it does not hold is on its way', () => {
    const { store } = storeOf('people', {}, AMOS, { isFetching: true });
    draw(store, 'people', '/people/amos/settings');

    expect(result.isLoading).toBe(true);
  });

  it('says when an edit was saved, and when it failed', () => {
    const { store, dispatched } = storeOf('people', { id: 3 }, AMOS);
    draw(store, 'people', '/people/amos/settings');

    act(() => { store.dispatch({ type: 'SET', slice: { success: true } }); });
    act(() => { store.dispatch({ type: 'SET', slice: { success: false, error: 'refused' } }); });

    const alerts = dispatched.filter((action) => {
      return action.type.startsWith('ALERT_');
    }).map((action) => { return action.type; });
    expect(alerts).toEqual(['ALERT_SUCCESS', 'ALERT_ERROR']);
  });

  describe('a person', () => {
    it('opens the section the address names', () => {
      const { store } = storeOf('people', { id: 3 }, AMOS);
      draw(store, 'people', '/people/amos/settings/security');

      expect(result.section.key).toBe(SECTIONS.SECURITY);
    });

    it('falls back to the account section for one it does not have', () => {
      const { store } = storeOf('people', { id: 3 }, AMOS);
      draw(store, 'people', '/people/amos/settings/privacy');

      expect(result.section.key).toBe(SECTIONS.ACCOUNT);
    });

    it('goes to a section by its address', () => {
      const { store } = storeOf('people', { id: 3 }, AMOS);
      draw(store, 'people', '/people/amos/settings');

      act(() => { result.chooseSection(SECTIONS.DATA); });

      expect(where.pathname).toBe('/people/amos/settings/data');
      expect(result.section.key).toBe(SECTIONS.DATA);
    });

    it('has no security section on somebody else\'s profile', () => {
      const { store } = storeOf('people', { id: 3 }, NAOMI);
      draw(store, 'people', '/people/amos/settings');

      const keys = result.sections.map((section) => { return section.key; });
      expect(keys).not.toContain(SECTIONS.SECURITY);
      expect(keys).toContain(SECTIONS.ADMINISTRATION);
    });
  });

  describe('a group', () => {
    it('opens on the tab a link asks for', () => {
      const { store } = storeOf('groups', { id: 7 }, AMOS);
      draw(store, 'groups', { pathname: '/groups/7-tycho-station/settings', state: { tab: ITEMS.RULES } });

      expect(result.tab.key).toBe(ITEMS.RULES);
    });

    it('falls back to the first tab for one it does not have', () => {
      const { store } = storeOf('groups', { id: 7 }, AMOS);
      draw(store, 'groups', '/groups/7-tycho-station/settings', ITEMS.DANGER);

      expect(result.tabs.map((tab) => { return tab.key; })).not.toContain(ITEMS.DANGER);
      expect(result.tab.key).toBe(ITEMS.INFO);
    });

    it('changes tab when one is chosen', () => {
      const { store } = storeOf('groups', { id: 7 }, AMOS);
      draw(store, 'groups', '/groups/7-tycho-station/settings');

      act(() => { result.chooseTab(ITEMS.ACCESS); });

      expect(result.tab.key).toBe(ITEMS.ACCESS);
    });

    it('offers only the way back, and removing it for good, once it is deleted', () => {
      const group = { id: 7, deletedAt: '2026-11-01', authorized: { delete: true } };
      const { store } = storeOf('groups', group, DRUMMER);
      draw(store, 'groups', '/groups/7-tycho-station/settings');

      expect(result.dangerItems.map((item) => { return item.key; }))
        .toEqual([ITEMS.DELETE, ITEMS.PURGE]);
    });

    it('gives an event its own form, with a card of its own, and a way to call it off', () => {
      const { store } = storeOf('events', { id: 9 }, AMOS);
      draw(store, 'events', '/events/9-gallifrey/settings');

      expect(result.tabs[0]).toEqual({ key: ITEMS.INFO, bare: false });
      expect(result.dangerItems.map((item) => { return item.key; })).toEqual([ITEMS.CANCEL]);
    });
  });
});
