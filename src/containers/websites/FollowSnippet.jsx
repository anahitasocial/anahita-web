import React from 'react';

import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import CopyValue from '../../components/CopyValue';
import ActorType from '../../proptypes/Actor';
import utils from '../../utils';
import i18n from '../../languages';

// "Follow our website on the Fediverse": a few lines of HTML a site pastes in
// to lead its readers to its website here, where they follow it, or follow it
// from their own server by its handle.
const WebsiteFollowSnippet = ({ actor }) => {
  if (!actor || !actor.alias) {
    return null;
  }

  const handle = utils.federation.siteHandle(actor.alias);
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
