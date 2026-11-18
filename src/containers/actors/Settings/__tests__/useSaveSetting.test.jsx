/* global globalThis */
import React, { act } from 'react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import { vi } from 'vitest';

import useSaveSetting, { forNamespace } from '../useSaveSetting';

vi.mock('../../../../actions', () => {
  return {
    default: {
      groups: {
        read: (key, namespace) => { return { type: 'READ', key, namespace }; },
      },
      app: {
        alert: {
          error: (message) => { return { type: 'ALERT_ERROR', message }; },
          success: (message) => { return { type: 'ALERT_SUCCESS', message }; },
        },
      },
    },
  };
});

const ROCINANTE = { id: 12, alias: 'rocinante' };
const HOLDEN = { id: 3, name: 'James Holden' };

const storeWith = () => {
  const dispatched = [];
  const state = {
    groups: { groups: { current: ROCINANTE } },
    session: { viewer: HOLDEN },
  };
  const store = createStore((current = state, action) => {
    dispatched.push(action);
    return current;
  });
  return { store, dispatched };
};

// A promise and the means to settle it, so the test decides when the
// server answers.
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

describe('useSaveSetting', () => {
  let box;
  let root;
  let result;

  const Card = () => {
    result = useSaveSetting('groups');
    return null;
  };

  const draw = (store) => {
    act(() => {
      root.render(<Provider store={store}><Card /></Provider>);
    });
  };

  const settled = async () => {
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    box = document.createElement('div');
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('gives the profile whose settings are open, and the viewer', () => {
    const { store } = storeWith();
    draw(store);

    expect(result.actor).toBe(ROCINANTE);
    expect(result.viewer).toBe(HOLDEN);
    expect(result.isSaving).toBe(false);
  });

  it('sends the choice, reads the profile again, and says it was saved', async () => {
    const { store, dispatched } = storeWith();
    draw(store);
    const answer = deferred();

    act(() => {
      result.save(() => { return answer.promise; }, { saved: 'a.saved', notSaved: 'a.notSaved' });
    });
    expect(result.isSaving).toBe(true);

    answer.resolve();
    await settled();

    const types = dispatched.map((action) => { return action.type; });
    expect(types).toContain('READ');
    expect(types.indexOf('READ')).toBeLessThan(types.indexOf('ALERT_SUCCESS'));
    expect(types).not.toContain('ALERT_ERROR');
    expect(dispatched.find((action) => { return action.type === 'READ'; }).namespace).toBe('groups');
    expect(result.isSaving).toBe(false);
  });

  it('says when it was not saved, and does not read the profile again', async () => {
    const { store, dispatched } = storeWith();
    draw(store);

    act(() => {
      result.save(() => { return Promise.reject(new Error('refused')); }, {
        saved: 'a.saved', notSaved: 'a.notSaved',
      });
    });
    await settled();

    const types = dispatched.map((action) => { return action.type; });
    expect(types).not.toContain('READ');
    expect(types).toContain('ALERT_ERROR');
    expect(result.isSaving).toBe(false);
  });

  it('makes a card for one namespace, told which it is', () => {
    let told = '';
    const Told = ({ namespace }) => {
      told = namespace;
      return null;
    };

    Told.propTypes = { namespace: PropTypes.string.isRequired };
    const ForGroups = forNamespace(Told)('groups');

    act(() => {
      root.render(<ForGroups />);
    });

    expect(told).toBe('groups');
  });
});
