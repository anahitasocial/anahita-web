import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LocationIcon from '@mui/icons-material/LocationOnOutlined';

import LocationPicker from './LocationPicker';
import api from '../../../api';
import i18n from '../../../languages';
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
// They are sent with the post (`location_ids`), and the server ties them as
// it makes it, before it goes to other servers, which it then goes with
// (the user, 2026-10-19; part 3b). A draft kept on the server is tied to
// them before it is published (`tag`), for the same reason.
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

  // What is sent with the post.
  const ids = () => {
    return locations.map((location) => { return location.id; });
  };

  // Ties a post that exists already, a draft, to each location, answering
  // how many could not be.
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
    ids,
    tag,
    button: ({ disabled = false } = {}) => {
      return (
        <LocationPicker chosen={locations} onPick={add} disabled={disabled} />
      );
    },
    // Under the text, where the link card is; and, where the post will go
    // to other servers, that they go with it, which is the consent it
    // asks for.
    chips: ({ disabled = false, goesOut = false } = {}) => {
      if (locations.length === 0) {
        return null;
      }
      return (
        <Box sx={{ mt: 1 }}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
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
          {goesOut &&
          <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 0.5 }}>
            {i18n.t('composer:locations.goesOut')}
          </Typography>}
        </Box>
      );
    },
  };
};

export default usePostLocations;
