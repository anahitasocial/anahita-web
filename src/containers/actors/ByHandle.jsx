import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import ActorsRead from './Read';
import NotFoundPage from '../NotFound';
import Progress from '../../components/Progress';
import api from '../../api';

const READS = {
  people: ActorsRead('people'),
  groups: ActorsRead('groups'),
  events: ActorsRead('events'),
  websites: ActorsRead('websites'),
};

// A profile at its alias: /@ana, /@ana/photos, /@garden, /@ana@mastodon.social.
//
// Matched as any one-word address with something after it, so it says
// "not found" for whatever does not begin with @. The alias is looked up
// once (api/handles: which kind of profile it is, and its id), then the
// profile is drawn as its own page would draw it, its tabs under /@alias.
const ActorByHandle = () => {
  const { handle = '', '*': rest = '' } = useParams();
  const isHandle = handle.startsWith('@') && handle.length > 1;
  const alias = isHandle ? handle.slice(1) : '';
  const [found, setFound] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!alias) {
      return undefined;
    }
    let current = true;
    setFound(null);
    setMissing(false);
    api.handles.read(alias).then((result) => {
      if (current) {
        setFound(result.data);
      }
    }).catch(() => {
      if (current) {
        setMissing(true);
      }
    });
    return () => {
      current = false;
    };
  }, [alias]);

  if (!isHandle || missing) {
    return <NotFoundPage />;
  }
  if (!found || !READS[found.kind]) {
    return <Progress />;
  }

  // The alias as it is spelled, wherever it was typed in other capitals.
  if (found.alias && found.alias !== alias) {
    return <Navigate to={`/@${found.alias}${rest ? `/${rest}` : ''}`} replace />;
  }

  const [tab, subtab] = rest.split('/').filter(Boolean);
  const Read = READS[found.kind];

  return (
    <Read
      key={`${found.kind}-${found.id}`}
      routeId={found.kind === 'people' ? found.alias : String(found.id)}
      routeTab={tab}
      routeSubtab={subtab}
      basePath={`/@${found.alias}`}
    />
  );
};

export default ActorByHandle;
