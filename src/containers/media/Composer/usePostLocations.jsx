import React, { useEffect, useState } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LocationIcon from '@mui/icons-material/LocationOnOutlined';

import LocationPicker from './LocationPicker';
import api from '../../../api';
import { Medium as MEDIUM } from '../../../constants';

// What is kept of a location with the draft: enough to show its chip and to
// tie the post to it.
const keep = (location) => {
  return {
    id: location.id,
    type: location.type,
    name: location.name,
    city: location.city || '',
  };
};

const keyFor = (actorId) => {
  return `composer-locations:${actorId}`;
};

const read = (key) => {
  try {
    const kept = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(kept) ? kept : [];
  } catch (e) {
    return [];
  }
};

const write = (key, locations) => {
  try {
    if (locations.length > 0) {
      window.localStorage.setItem(key, JSON.stringify(locations));
    } else {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    // Nothing kept. The composer works the same.
  }
};

// The locations a new post is tagged with (roadmap row 82, part 3): chosen
// with the pin among the composer's small buttons, shown as chips under the
// text, up to five, and kept with the draft in this browser, one list for
// each profile, shared by the short box and the extended composer, so that
// they go along when one becomes the other.
//
// The post is tagged once it exists, with the calls its Locations tab uses.
// A tag that fails does not lose the post: `tag` says how many failed, and
// they can be added from the post's page.
const usePostLocations = (actorId) => {
  const key = keyFor(actorId);
  const [locations, setLocations] = useState(() => {
    return read(key);
  });

  useEffect(() => {
    setLocations(read(key));
  }, [key]);

  const change = (next) => {
    setLocations(next);
    write(key, next);
  };

  const add = (location) => {
    if (locations.length >= MEDIUM.MAX_LOCATIONS ||
      locations.some((each) => { return each.id === location.id; })) {
      return;
    }
    change([...locations, keep(location)]);
  };

  const remove = (location) => {
    change(locations.filter((each) => { return each.id !== location.id; }));
  };

  // Ties the post to each location, answering how many could not be.
  const tag = (post) => {
    if (!post || !post.id || locations.length === 0) {
      return Promise.resolve(0);
    }
    return Promise.all(locations.map((location) => {
      return api.tagGraph(post).add(location).then(() => {
        return 0;
      }).catch(() => {
        return 1;
      });
    })).then((failed) => {
      return failed.reduce((sum, each) => { return sum + each; }, 0);
    });
  };

  return {
    locations,
    // The draft as the other composer may have left it.
    reload: () => {
      setLocations(read(key));
    },
    clear: () => {
      change([]);
    },
    tag,
    button: ({ disabled = false } = {}) => {
      return (
        <LocationPicker chosen={locations} onPick={add} disabled={disabled} />
      );
    },
    // Under the text, where the link card is.
    chips: ({ disabled = false } = {}) => {
      if (locations.length === 0) {
        return null;
      }
      return (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {locations.map((location) => {
            return (
              <Chip
                key={location.id}
                icon={<LocationIcon />}
                label={location.name}
                size="small"
                variant="outlined"
                onDelete={disabled ? undefined : () => {
                  remove(location);
                }}
              />
            );
          })}
        </Stack>
      );
    },
  };
};

export default usePostLocations;
