import { act } from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import api from '../../../../api';
import useComposer from '../useComposer';
import { drawHook, settle, storeOf } from './drawHook';

// The rest of the API as it is: the actions are made from it.
vi.mock('../../../../api', async (importOriginal) => {
  const real = await importOriginal();
  return {
    default: {
      ...real.default,
      federation: {
        settings: vi.fn(),
        blueskySettings: vi.fn(),
      },
    },
  };
});

// Each test is of a viewer of its own: whether one is on the fediverse is
// asked once and remembered (useOnFediverse).
let lastId = 100;
const person = () => {
  lastId += 1;
  return {
    id: lastId, name: 'Maurice Moss', type: 'com.anahita.actor.person', language: 'en',
  };
};

describe('useComposer', () => {
  let hook;
  let viewer;
  let held;

  const draw = (props = {}) => {
    hook.draw({ actor: viewer, open: true, ...props });
    return hook.result.current;
  };

  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    api.federation.settings.mockResolvedValue({ data: { enabled: true } });
    api.federation.blueskySettings.mockResolvedValue({ data: { connected: true } });
    viewer = person();
    held = storeOf({ session: { viewer }, app: { nodeInfo: null } });
    hook = drawHook(useComposer, held.store);
  });

  afterEach(() => {
    hook.unmount();
  });

  it('goes to other servers from the writer\'s own profile, open to everybody', async () => {
    draw({ withBluesky: true });
    await settle();
    const { goesOut, goesToBluesky, staysHere } = hook.result.current;
    expect(hook.result.current.choices.access).toBe('public');
    expect(goesOut).toBe(true);
    expect(goesToBluesky).toBe(true);
    expect(staysHere).toBe(false);
  });

  it('goes nowhere else from somebody else\'s profile', async () => {
    draw({ actor: { id: 1, name: 'James Holden', type: 'com.anahita.actor.person' } });
    await settle();
    expect(hook.result.current.goesOut).toBe(false);
    expect(hook.result.current.staysHere).toBe(false);
  });

  it('asks of Bluesky only when told to', async () => {
    draw();
    await settle();
    expect(api.federation.settings).toHaveBeenCalled();
    expect(api.federation.blueskySettings).not.toHaveBeenCalled();
    expect(hook.result.current.goesToBluesky).toBe(false);
  });

  it('sends its locations, and reads them again as it opens', () => {
    draw({ open: false });
    expect(hook.result.current.locationIds()).toEqual({});
    window.localStorage.setItem(
      `composer-locations:${viewer.id}`,
      JSON.stringify([{ id: 5, type: 'location', name: 'Ceres' }]),
    );
    draw({ open: true });
    expect(hook.result.current.locationIds()).toEqual({ location_ids: [5] });
    act(() => { hook.result.current.posted(); });
    expect(hook.result.current.locationIds()).toEqual({});
  });

  it('says how it went', () => {
    draw();
    act(() => {
      hook.result.current.alertSuccess('Posted');
      hook.result.current.alertError('Not posted');
    });
    expect(held.alerts().map((each) => { return [each.severity, each.body]; })).toEqual([
      ['success', 'Posted'],
      ['error', 'Not posted'],
    ]);
  });
});
