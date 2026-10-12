import { useEffect, useState } from 'react';

import api from '../../api';
import recommendations from '../../utils/recommendations';

// The suggestions of one kind, for whatever draws them: the card on the
// home page, the page of suggestions.
//
// `isAbsent` is set when the installation has no recommendation service,
// and whoever asked then draws nothing at all. `dismiss` takes one out of
// the list at once and tells the service, which does not suggest it again.
const useSuggestions = (kind, limit) => {
  const [items, setItems] = useState([]);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAbsent, setIsAbsent] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    api.recommendations.actors({ kind, limit }).then((result) => {
      if (isCurrent) {
        setItems(result.data.items || []);
        setRelated(result.data.related || []);
        setIsAbsent(false);
      }
    }).catch((error) => {
      if (isCurrent) {
        setItems([]);
        setIsAbsent(recommendations.isAbsent(error));
      }
    }).finally(() => {
      if (isCurrent) {
        setIsLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [kind, limit]);

  const dismiss = (actor) => {
    setItems((before) => {
      return before.filter((item) => {
        return item.actorId !== actor.id;
      });
    });

    return api.recommendations.setDismissed(actor, true);
  };

  return {
    items,
    related,
    isLoading,
    isAbsent,
    dismiss,
  };
};

export default useSuggestions;
