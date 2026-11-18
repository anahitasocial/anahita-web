/* global globalThis */
import React, { act } from 'react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

import api from '../../../api';
import useFeedForm, {
  FROM_CHOSEN, FROM_EVERYONE, FROM_FOLLOWING, NEAR_LIVE, NEAR_NONE,
} from '../useFeedForm';

vi.mock('../../../api', () => {
  return {
    default: {
      customFeeds: { add: vi.fn(), edit: vi.fn() },
    },
  };
});

// A feed kept on the server, with the profiles and places it names.
const CERES = {
  id: 33,
  name: 'Ceres Station',
  body: 'News from the Belt',
  access: 'public',
  icon: 'feed',
  definition: {
    sources: { following: false, actors: [5, 6] },
    filters: { locationsAny: [70] },
    exclude: { actors: [9] },
  },
  references: [
    { id: 5, name: 'Naomi Nagata' },
    { id: 70, name: 'Tycho Station' },
  ],
};

const submit = { preventDefault: () => {} };

describe('useFeedForm', () => {
  let box;
  let root;
  let result;
  let saved;
  let alerts;

  const Form = ({ feed }) => {
    result = useFeedForm({
      feed,
      onSaved: (data) => { saved.push(data); },
      alertSuccess: (message) => { alerts.push(['success', message]); },
      alertError: (message) => { alerts.push(['error', message]); },
    });
    return null;
  };

  Form.propTypes = { feed: PropTypes.object };

  const draw = (feed = null) => {
    act(() => {
      root.render(<Form feed={feed} />);
    });
  };

  const settled = async () => {
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    saved = [];
    alerts = [];
    vi.clearAllMocks();
    box = document.createElement('div');
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('starts a new feed from the profiles the viewer follows', () => {
    draw();

    expect(result.isNew).toBe(true);
    expect(result.from).toBe(FROM_FOLLOWING);
    expect(result.definition.sources.following).toBe(true);
    expect(result.nearKind).toBe(NEAR_NONE);
  });

  it('starts a feed being changed from what it holds, naming what it names', () => {
    draw(CERES);

    expect(result.isNew).toBe(false);
    expect(result.from).toBe(FROM_CHOSEN);
    expect(result.actors).toEqual([{ id: 5, name: 'Naomi Nagata' }, { id: 6, name: '#6' }]);
    expect(result.locations).toEqual([{ id: 70, name: 'Tycho Station' }]);
    expect(result.excluded).toEqual([{ id: 9, name: '#9' }]);
    expect(result.onlyPicked).toBe(true);
    expect(result.sent.filters.actorTypes).toEqual([]);
  });

  it('looks at everyone once a new feed is narrowed before its source was chosen', () => {
    draw();

    act(() => { result.setFilters({ hashtagsAny: ['belters'] }); });

    expect(result.from).toBe(FROM_EVERYONE);
    expect(result.definition.sources.following).toBe(false);
  });

  it('keeps the source a person chose when the feed is narrowed', () => {
    draw();

    act(() => { result.chooseFrom(FROM_FOLLOWING); });
    act(() => { result.setFilters({ hashtagsAny: ['belters'] }); });

    expect(result.from).toBe(FROM_FOLLOWING);
    expect(result.definition.sources.following).toBe(true);
  });

  it('ticks a kind of post on and off', () => {
    draw();

    act(() => { result.tickFilter('mediaTypes', 'photo', true); });
    expect(result.definition.filters.mediaTypes).toEqual(['photo']);

    act(() => { result.tickFilter('mediaTypes', 'photo', false); });
    expect(result.definition.filters.mediaTypes).toEqual([]);
  });

  it('follows the reader with an area, and changes its radius by the slider\'s steps', () => {
    draw();

    act(() => { result.chooseNear(NEAR_LIVE); });
    expect(result.nearKind).toBe(NEAR_LIVE);
    expect(result.definition.filters.near).toEqual({
      latitude: 0, longitude: 0, radiusKm: 10, live: true,
    });

    act(() => { result.setRadius(5); });
    expect(result.definition.filters.near.radiusKm).toBe(50);

    act(() => { result.chooseNear(NEAR_NONE); });
    expect(result.definition.filters.near).toBe(null);
  });

  it('asks for a name before anything is sent', () => {
    draw();

    act(() => { result.save(submit); });

    expect(result.error).toBe('name_required');
    expect(api.customFeeds.add).not.toHaveBeenCalled();

    act(() => { result.setName('Rocinante'); });
    expect(result.error).toBe('');
  });

  it('adds a new feed, and says so', async () => {
    api.customFeeds.add.mockImplementation(() => { return Promise.resolve({ data: { id: 34 } }); });
    draw();

    act(() => { result.setName(' Rocinante '); });
    act(() => { result.save(submit); });
    expect(result.isSaving).toBe(true);
    await settled();

    expect(api.customFeeds.add.mock.calls[0][0]).toMatchObject({ name: 'Rocinante', access: 'myself' });
    expect(saved).toEqual([{ id: 34 }]);
    expect(alerts[0][0]).toBe('success');
  });

  it('changes a feed by its id, and shows a refusal the form can explain', async () => {
    api.customFeeds.edit.mockImplementation(() => {
      return Promise.reject(Object.assign(new Error('refused'), {
        response: { data: { error: 'too_broad' } },
      }));
    });
    draw(CERES);

    act(() => { result.save(submit); });
    await settled();

    expect(api.customFeeds.edit.mock.calls[0][0]).toMatchObject({ id: 33, name: 'Ceres Station' });
    expect(result.error).toBe('too_broad');
    expect(result.isSaving).toBe(false);
    expect(saved).toEqual([]);
  });
});
