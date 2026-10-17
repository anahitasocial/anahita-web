import React, { useEffect, useState } from 'react';

import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import CopyValue from '../../components/CopyValue';
import api from '../../api';
import ActorType from '../../proptypes/Actor';
import utils from '../../utils';
import i18n from '../../languages';

// "Follow our website on the Fediverse": a few lines of HTML a site pastes in
// to lead its readers to its website here, where they follow it, or follow it
// from their own server by its handle.
//
// The handle is the one the fediverse service gives, whose domain is where
// other servers find it; the web app's own address may differ (localhost in
// development). Until it answers, or where there is none, the handle is made
// from this address.
const WebsiteFollowSnippet = ({ actor }) => {
  const [served, setServed] = useState('');

  useEffect(() => {
    if (!actor || !actor.id) {
      return;
    }
    api.federation.settings(actor).then((result) => {
      setServed(result.data && result.data.handle ? `@${result.data.handle}` : '');
    }).catch(() => {
      setServed('');
    });
  }, [actor && actor.id]);

  if (!actor || !actor.alias) {
    return null;
  }

  const handle = served || utils.federation.siteHandle(actor.alias);
  const page = `${window.location.origin}/@${actor.alias}`;
  const snippet = `<a href="${page}" rel="me">\n  ${i18n.t('websites:settings.snippetLabel')}: ${handle}\n</a>`;

  return (
    <CardContent>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {i18n.t('websites:settings.websiteIntro')}
      </Typography>
      <CopyValue value={snippet} multiline />
    </CardContent>
  );
};

WebsiteFollowSnippet.propTypes = {
  actor: ActorType.isRequired,
};

export default WebsiteFollowSnippet;
