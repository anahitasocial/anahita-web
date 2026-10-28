import { useEffect, useState } from 'react';

import federation from '../../../utils/federation';

// The handle a profile here goes by on the fediverse, @ana@example.org, or
// '' while it is not on it. Whether a person or a website turned federation
// on is theirs to tell other servers and nobody's to keep in the profile, so
// it is asked as another server would: by WebFinger, which answers for those
// who did and for nobody else. Groups and events are not on the fediverse,
// and somebody from elsewhere has their handle under their name already.
const useFediverseHandle = (actor) => {
  const [handle, setHandle] = useState('');
  const type = (actor && actor.type) || '';
  const alias = (actor && actor.alias) || '';
  const asked = alias && !federation.isRemote(actor) &&
    (type.includes('.person-service.person.') || type.includes('.website.'));

  useEffect(() => {
    setHandle('');
    if (!asked) {
      return undefined;
    }
    let current = true;
    const resource = federation.siteHandle(alias).replace(/^@/, 'acct:');
    const base = process.env.REACT_APP_API_BASE_URL || '';
    fetch(`${base}/.well-known/webfinger?resource=${encodeURIComponent(resource)}`)
      .then((response) => {
        return response.ok ? response.json() : null;
      })
      .then((found) => {
        if (current && found) {
          setHandle(federation.handleOfSubject(found.subject));
        }
      })
      .catch(() => {
        // Not on the fediverse, as far as the page can tell.
      });
    return () => {
      current = false;
    };
  }, [asked, alias]);

  return handle;
};

export default useFediverseHandle;
