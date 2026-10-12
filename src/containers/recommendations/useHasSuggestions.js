import { useEffect, useState } from 'react';

import api from '../../api';

// Whether this installation has a recommendation service, for whatever
// offers the way to suggestions: the menu.
//
// Asked once for as long as the page is open, however many things ask: the
// service is there or it is not. False until it has answered, so nothing
// is offered and then taken away.
let asked = null;

const useHasSuggestions = (isAuthenticated) => {
  const [has, setHas] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setHas(false);
      asked = null;
      return undefined;
    }

    let isCurrent = true;

    if (!asked) {
      asked = api.recommendations.preferences().then(() => {
        return true;
      }).catch(() => {
        return false;
      });
    }

    asked.then((answer) => {
      if (isCurrent) {
        setHas(answer);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated]);

  return has;
};

export default useHasSuggestions;
