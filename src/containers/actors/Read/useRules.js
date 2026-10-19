import { useEffect, useState } from 'react';

import api from '../../../api';

// A group's or an event's rules (roadmap row 102, part 5), read once for its
// page: { version, items, agreedVersion }, or null until they come, and for
// any other kind of profile.
const useActorRules = (actor) => {
  const [rules, setRules] = useState(null);
  const type = (actor && actor.type) || '';
  const hasRules = type.includes('.group.') || type.includes('.event.');

  useEffect(() => {
    let current = true;
    setRules(null);
    if (!actor || !actor.id || !hasRules) {
      return undefined;
    }
    api.rules.read(actor).then(({ data }) => {
      if (current) {
        setRules(data);
      }
    }).catch(() => {
      // Not to be seen, or not there: no rules shown.
    });
    return () => {
      current = false;
    };
  }, [actor && actor.id, hasRules]);

  return rules;
};

export default useActorRules;
