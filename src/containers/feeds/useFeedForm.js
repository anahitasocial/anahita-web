import { useState } from 'react';

import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import postLanguage from '../../utils/postLanguage';
import reasonOf, { isExplained } from './reasonOf';

// Where a feed's posts come from.
export const FROM_EVERYONE = 'everyone';
export const FROM_FOLLOWING = 'following';
export const FROM_CHOSEN = 'chosen';

// The radii an area may have, in kilometres, a step of the slider each.
export const RADII = [1, 2, 5, 10, 25, 50, 100, 250, 500];

// An area: none, wherever the reader is, or a point kept with the feed.
export const NEAR_NONE = 'none';
export const NEAR_LIVE = 'live';
export const NEAR_FIXED = 'fixed';

// What the form starts from: a feed being changed, or a new one of the
// profiles the viewer follows.
const startingValues = (feed) => {
  return {
    name: (feed && feed.name) || '',
    body: (feed && feed.body) || '',
    access: (feed && feed.access) || 'myself',
    icon: (feed && feed.icon) || 'feed',
    definition: feed ? customFeeds.complete(feed.definition) : customFeeds.starting(),
  };
};

// The profiles and places a feed's definition lists, as the nodes the
// pickers hold. One the viewer may no longer see is kept by its id, so
// saving the feed does not quietly take it out.
const chosenFrom = (ids, references) => {
  const byId = {};
  (references || []).forEach((node) => {
    byId[node.id] = node;
  });

  return ids.map((id) => {
    return byId[id] || { id, name: `#${id}` };
  });
};

const idsOf = (nodes) => {
  return nodes.map((node) => {
    return node.id;
  });
};

const toggled = (list, item, isOn) => {
  const without = list.filter((each) => {
    return each !== item;
  });

  return isOn ? [...without, item] : without;
};

// Making a custom feed, or changing one, apart from how the form is drawn.
//
// A feed is where its posts come from, narrowed by what they are about, less
// what is left out. It gives what the fields show, the way to change each,
// what the feed shows in a sentence (`sent`, `names`), the error to show,
// and `save(event)`, which checks the feed and sends it.
const useFeedForm = ({
  feed = null,
  onSaved,
  alertSuccess,
  alertError,
}) => {
  const isNew = !feed;

  const [values, setValues] = useState(() => {
    return startingValues(feed);
  });
  const references = (feed && feed.references) || [];
  const [actors, setActors] = useState(() => {
    return chosenFrom(values.definition.sources.actors, references);
  });
  const [locations, setLocations] = useState(() => {
    return chosenFrom(values.definition.filters.locationsAny, references);
  });
  const [excluded, setExcluded] = useState(() => {
    return chosenFrom(values.definition.exclude.actors, references);
  });
  const [error, setError] = useState('');
  // Where the posts come from, as one choice of three (the user,
  // 2026-10-17: a hashtag feed showed only the posts of profiles followed,
  // as the tick a new feed started with said, and nobody saw it).
  const [from, setFrom] = useState(() => {
    if ((values.definition.sources.actors || []).length > 0) {
      return FROM_CHOSEN;
    }
    return values.definition.sources.following ? FROM_FOLLOWING : FROM_EVERYONE;
  });
  // Whether that choice is as the form set it, or as the person did. A new
  // feed starts from the profiles they follow so that it shows something;
  // given a hashtag, a keyword, a place or an area before they chose, it
  // looks at everyone, which is what that almost always means.
  const [choseFrom, setChoseFrom] = useState(!isNew);
  // Finding where the person is, for an area around them.
  const [whereIAm, setWhereIAm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { definition } = values;
  const problem = customFeeds.problem(definition);
  let nearKind = NEAR_NONE;
  if (definition.filters.near) {
    nearKind = definition.filters.near.live ? NEAR_LIVE : NEAR_FIXED;
  }

  // Profiles named by hand, and nothing else to draw from: whose posts
  // these are is already said, and "Posted on" could only hide some of
  // them. It is not offered then, and not sent.
  const onlyPicked = !definition.sources.following &&
    (definition.sources.actors || []).length > 0;
  const sent = onlyPicked ?
    { ...definition, filters: { ...definition.filters, actorTypes: [] } } :
    definition;

  // Changes one field of the feed itself; `clears` takes the error away, as
  // the fields an error can be about do.
  const setValue = (name, value, clears = false) => {
    if (clears) {
      setError('');
    }
    setValues({ ...values, [name]: value });
  };

  // Changes one part of the definition: its sources, filters or exclude.
  const setDefinition = (part, changes) => {
    setError('');
    const next = {
      ...definition,
      [part]: { ...definition[part], ...changes },
    };
    // Narrowed for the first time, in a new feed whose source nobody has
    // chosen: everyone, as said above.
    if (part === 'filters' && !choseFrom && from === FROM_FOLLOWING &&
      !customFeeds.narrows(definition) && customFeeds.narrows(next)) {
      next.sources = { ...next.sources, following: false };
      setFrom(FROM_EVERYONE);
    }
    setValues({ ...values, definition: next });
  };

  const chooseFrom = (choice) => {
    setChoseFrom(true);
    setFrom(choice);
    if (choice === FROM_EVERYONE) {
      setActors([]);
      setDefinition('sources', { following: false, actors: [] });
    } else if (choice === FROM_FOLLOWING) {
      setActors([]);
      setDefinition('sources', { following: true, actors: [] });
    } else {
      setDefinition('sources', { following: false });
    }
  };

  // The area around where the browser says the person is.
  const nearMe = () => {
    if (!navigator.geolocation) {
      setWhereIAm('denied');
      return;
    }
    setWhereIAm('finding');
    navigator.geolocation.getCurrentPosition((position) => {
      setWhereIAm('');
      setDefinition('filters', {
        near: {
          // A street's worth of precision, and no more: the point is kept
          // with the feed.
          latitude: Math.round(position.coords.latitude * 1000) / 1000,
          longitude: Math.round(position.coords.longitude * 1000) / 1000,
          radiusKm: (definition.filters.near && definition.filters.near.radiusKm) || 10,
          live: false,
        },
      });
    }, () => {
      setWhereIAm('denied');
    }, { maximumAge: 10 * 60 * 1000, timeout: 15000 });
  };

  // No area, wherever the reader is, or where the person is now.
  const chooseNear = (kind) => {
    const { near } = definition.filters;
    const radiusKm = (near && near.radiusKm) || 10;
    if (kind === NEAR_NONE) {
      setDefinition('filters', { near: null });
    } else if (kind === NEAR_LIVE) {
      setDefinition('filters', {
        near: {
          latitude: 0, longitude: 0, radiusKm, live: true,
        },
      });
    } else {
      nearMe();
    }
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }
    if (!values.name.trim()) {
      setError('name_required');
      return;
    }
    if (problem) {
      setError(problem);
      return;
    }

    setIsSaving(true);

    const fields = {
      name: values.name.trim(),
      body: values.body.trim(),
      access: values.access,
      icon: values.icon,
      definition: sent,
    };
    const call = isNew ?
      api.customFeeds.add(fields) :
      api.customFeeds.edit({ id: feed.id, ...fields });

    call.then((result) => {
      alertSuccess(i18n.t('customFeeds:prompts.saved'));
      onSaved(result.data);
    }).catch((response) => {
      const reason = reasonOf(response) || 'generic';

      if (isExplained(reason)) {
        setError(reason);
      } else {
        alertError(i18n.t('customFeeds:form.errors.generic'));
      }
      setIsSaving(false);
    });
  };

  return {
    isNew,
    values,
    definition,
    error,
    isSaving,
    // The feed itself.
    setIcon: (icon) => { setValue('icon', icon); },
    setName: (name) => { setValue('name', name, true); },
    setBody: (body) => { setValue('body', body); },
    setAccess: (access) => { setValue('access', access, true); },
    // Where its posts come from.
    from,
    chooseFrom,
    actors,
    pickActors: (nodes) => {
      setActors(nodes);
      setDefinition('sources', { actors: idsOf(nodes) });
    },
    setFollowing: (following) => {
      setDefinition('sources', { following });
    },
    // What they are about.
    onlyPicked,
    setFilters: (changes) => {
      setDefinition('filters', changes);
    },
    // A kind of post, or of profile it was posted on, ticked or not.
    tickFilter: (list, kind, isOn) => {
      setDefinition('filters', { [list]: toggled(definition.filters[list], kind, isOn) });
    },
    locations,
    pickLocations: (nodes) => {
      setLocations(nodes);
      setDefinition('filters', { locationsAny: idsOf(nodes) });
    },
    nearKind,
    whereIAm,
    chooseNear,
    setRadius: (index) => {
      setDefinition('filters', {
        near: { ...definition.filters.near, radiusKm: RADII[index] },
      });
    },
    setMatch: (match) => {
      setValues({ ...values, definition: { ...definition, match } });
    },
    setIncludeReplies: (includeReplies) => {
      setError('');
      setValues({ ...values, definition: { ...definition, includeReplies } });
    },
    // The languages offered, with the feed's own among them whatever it is.
    languages: postLanguage.optionsWith(definition.filters.language || postLanguage.CODES[0]),
    // What is left out.
    setExclude: (changes) => {
      setDefinition('exclude', changes);
    },
    excluded,
    pickExcluded: (nodes) => {
      setExcluded(nodes);
      setDefinition('exclude', { actors: idsOf(nodes) });
    },
    // What the feed shows, in a sentence.
    sent,
    names: customFeeds.namesOf([...actors, ...locations, ...excluded]),
    save: handleSave,
  };
};

export default useFeedForm;
