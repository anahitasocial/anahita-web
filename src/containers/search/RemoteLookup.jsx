import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import api from '../../api';
import i18n from '../../languages';
import federation from '../../utils/federation';
import utils from '../../utils';

// Somebody on another server, found from the search page.
//
// When what was searched for is a handle with a server in it
// (@alice@mastodon.example), a handle on Bluesky (alice.bsky.social) or
// the address of a profile, the ordinary search has nothing to find: they
// are not here yet. This offers to ask their own server, or Bluesky, and
// then opens them as anybody else is opened.
//
// It asks only when the button is pressed. Looking somebody up tells
// another server that this site asked, and that is for the person
// searching to decide, not for a page to do as it loads.
//
// Drawn for nothing else, and nothing is drawn on an installation without
// the service that would be asked: the first press says so and the card
// goes, for that network and not for the other.
const RemoteLookup = ({ query = '' }) => {
  const navigate = useNavigate();
  const [isLooking, setIsLooking] = useState(false);
  const [error, setError] = useState('');
  // The networks this installation turned out to have no service for.
  const [absent, setAbsent] = useState({});

  // A new search starts clean.
  useEffect(() => {
    setError('');
    setIsLooking(false);
  }, [query]);

  const kind = federation.lookupKind(query);

  if (!kind || absent[kind]) {
    return null;
  }

  const asked = query.trim();
  const onBluesky = kind === federation.ATPROTO;
  let domain = asked.startsWith('https://') ? asked.split('/')[2] : asked.slice(asked.lastIndexOf('@') + 1);
  if (onBluesky) {
    domain = i18n.t('federation:lookup.bluesky');
  }

  const handleLookup = () => {
    setIsLooking(true);
    setError('');

    api.federation.lookup(asked).then((result) => {
      navigate(utils.node.getURL(result.data));
    }).catch((failure) => {
      const reason = federation.reasonOf(failure);
      // No reason given, and no service to give one: this network is
      // not read here, and there is nothing to offer.
      if (!reason && federation.isAbsent(failure)) {
        setAbsent((known) => {
          return { ...known, [kind]: true };
        });
        return;
      }
      setError(i18n.exists(`federation:lookup.errors.${reason}`) ? reason : 'failed');
    }).finally(() => {
      setIsLooking(false);
    });
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader title={i18n.t('federation:lookup.title')} />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body1">
          {isLooking ?
            i18n.t('federation:lookup.looking', { domain }) :
            i18n.t(onBluesky ? 'federation:lookup.promptBluesky' : 'federation:lookup.prompt', { query: asked })}
        </Typography>
        {error &&
          <Alert severity="warning" sx={{ mt: 2 }}>
            {i18n.t(`federation:lookup.errors.${error}`)}
          </Alert>}
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          onClick={handleLookup}
          disabled={isLooking}
        >
          {i18n.t('federation:lookup.button')}
        </Button>
      </CardActions>
    </Card>
  );
};

RemoteLookup.propTypes = {
  query: PropTypes.string,
};

export default RemoteLookup;
