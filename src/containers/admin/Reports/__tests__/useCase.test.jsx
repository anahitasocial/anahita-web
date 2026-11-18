/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import { vi } from 'vitest';

import api from '../../../../api';
import useCase from '../useCase';

vi.mock('../../../../api', () => {
  return {
    default: {
      abuseReports: { readCase: vi.fn(), resolve: vi.fn(), reopen: vi.fn() },
      warnings: { edit: vi.fn() },
    },
  };
});

// The two moderation actions have their own tests: here they only say they
// can act, and hand back what is called when they have.
const moderation = vi.hoisted(() => { return {}; });
vi.mock('../../../moderation/useRemoveAsSpam', () => {
  return {
    default: (viewer, actor, onRemoved) => {
      moderation.spamOf = actor;
      moderation.removed = onRemoved;
      return { canRemove: Boolean(actor), open: () => {}, dialog: null };
    },
  };
});
vi.mock('../../../moderation/useRefuseAccount', () => {
  return {
    default: (viewer, account, onRefused) => {
      moderation.refused = onRefused;
      return { canRefuse: false, open: () => {}, dialog: null };
    },
    canRefuseAccount: () => { return false; },
  };
});

const NOTE = { id: 40, type: 'node.medium.note-service.note.v1', body: 'A note' };
const OPEN = {
  id: 7, status: 'open', target: NOTE, targetGone: false,
};

const refusal = (status, error) => {
  return Promise.reject(Object.assign(new Error('refused'), {
    response: { status, data: { error } },
  }));
};

describe('useCase', () => {
  let box;
  let root;
  let result;
  let told;

  // As the store gives them, the same functions on every render.
  const alertError = (message) => { told.push(['error', message]); };
  const alertSuccess = (message) => { told.push(['success', message]); };
  const readAdminCounts = () => { told.push(['counts']); };

  const Page = () => {
    result = useCase({
      id: '7', alertError, alertSuccess, readAdminCounts,
    });
    return null;
  };

  const settled = async () => {
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    });
  };

  const draw = async () => {
    const store = createStore((state = { session: { viewer: { id: 1 } } }) => { return state; });
    act(() => {
      root.render(<Provider store={store}><Page /></Provider>);
    });
    await settled();
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    told = [];
    vi.clearAllMocks();
    api.abuseReports.readCase.mockImplementation(() => {
      return Promise.resolve({ data: OPEN });
    });
    api.abuseReports.resolve.mockImplementation(() => { return Promise.resolve({}); });
    api.abuseReports.reopen.mockImplementation(() => { return Promise.resolve({}); });
    api.warnings.edit.mockImplementation(() => { return Promise.resolve({}); });
    box = document.createElement('div');
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('reads the case, and gives what was reported while it is open', async () => {
    await draw();

    expect(api.abuseReports.readCase.mock.calls[0][0]).toBe('7');
    expect(result.item).toBe(OPEN);
    expect(result.isFetching).toBe(false);
    expect(result.reported).toBe(NOTE);
    expect(result.canWarn).toBe(true);
    expect(moderation.spamOf).toBe(NOTE);
  });

  it('says there is no such case when the server has none', async () => {
    api.abuseReports.readCase.mockImplementation(() => { return refusal(404); });
    await draw();

    expect(result.notFound).toBe(true);
    expect(told).toEqual([]);
  });

  it('decides a case, then reads it again with the counts', async () => {
    await draw();

    act(() => { result.ask('dismissed'); });
    expect(result.resolving).toBe('dismissed');

    act(() => { result.resolve({ status: 'dismissed', action: '', note: '' }); });
    expect(result.submitting).toBe(true);
    await settled();

    expect(api.abuseReports.resolve.mock.calls[0]).toEqual(['7', { status: 'dismissed', action: '', note: '' }]);
    expect(result.resolving).toBe('');
    expect(result.submitting).toBe(false);
    expect(told.map((entry) => { return entry[0]; })).toEqual(['success', 'counts']);
    expect(api.abuseReports.readCase).toHaveBeenCalledTimes(2);
  });

  it('says why a decision was refused, and reads the case again', async () => {
    api.abuseReports.resolve.mockImplementation(() => { return refusal(409, 'already_decided'); });
    await draw();

    act(() => { result.resolve({ status: 'actioned', action: 'other', note: '' }); });
    await settled();

    expect(told[0][0]).toBe('error');
    expect(api.abuseReports.readCase).toHaveBeenCalledTimes(2);
  });

  it('closes the case as removed as spam once the profile is removed', async () => {
    await draw();

    act(() => { moderation.removed(); });
    await settled();

    expect(api.abuseReports.resolve.mock.calls[0][1]).toEqual({
      status: 'actioned', action: 'removed_as_spam', note: '',
    });
  });

  it('says nothing when a refused account\'s case was closed already', async () => {
    api.abuseReports.resolve.mockImplementation(() => { return refusal(409, 'already_decided'); });
    await draw();

    act(() => { moderation.refused(); });
    await settled();

    expect(told.map((entry) => { return entry[0]; })).toEqual(['counts']);
  });

  it('closes the case as warned when a warning is given, and decides nothing when one is taken off', async () => {
    await draw();

    act(() => { result.warning.open(); });
    expect(result.warning.isOpen).toBe(true);

    act(() => { result.warning.save({ kind: 'spoiler' }); });
    await settled();
    expect(result.warning.isOpen).toBe(false);
    expect(api.abuseReports.resolve.mock.calls[0][1]).toMatchObject({ action: 'warned' });

    act(() => { result.warning.save(null); });
    await settled();
    expect(api.abuseReports.resolve).toHaveBeenCalledTimes(1);
  });

  it('opens a decided case again', async () => {
    await draw();

    act(() => { result.reopen(); });
    await settled();

    expect(api.abuseReports.reopen.mock.calls[0][0]).toBe('7');
    expect(told.map((entry) => { return entry[0]; })).toEqual(['success', 'counts']);
  });
});
