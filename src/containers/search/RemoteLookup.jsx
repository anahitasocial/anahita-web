import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

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

// Somebody on another server, found from the search page.
//
// When what was searched for is a handle with a server in it
// (@alice@mastodon.example), a handle on Bluesky (alice.bsky.social) or
// the address of a profile, the ordinary search has nothing to find: they
// are not here yet. This offers to ask their own server, or Bluesky, and
// then hands who was found to the search page (`onFound`), which draws
// them first among the results, as anybody found by a search is.
//
// It asks when the button is pressed, or at once when `now` says that
// the person typed an unmistakable handle into the search box and pressed
// Enter, which is the same decision made one step earlier. Looking
// somebody up tells another server that this site asked, and that is for
// the person searching to decide, not for a page to do as it loads: a
// link to a search for a handle waits for the button, or a link could
// make this site call any server just by being opened.
//
// Drawn for nothing else, and nothing is drawn on an installation without
// the service that would be asked: the first press says so and the card
// goes, for that network and not for the other.
//
// A lookup that fails says what happened and what to try, naming the server
// (the user, 2026-10-19: lookups are part of searching and following, and
// should be pleasant). An answer (nobody by that name, not a profile, a
// server this site does not connect to) is said, and the button goes; a
// failure that may pass (the server did not answer, too many lookups) offers
// Try again.
const RemoteLookup = ({ query = '', now = false, onFound }) => {
  const [isLooking, setIsLooking] = useState(false);
  const [found, setFound] = useState(null);
  const [error, setError] = useState('');
  // The networks this installation turned out to have no service for.
  const [absent, setAbsent] = useState({});

  // A new search starts clean.
  useEffect(() => {
    setError('');
    setIsLooking(false);
    setFound(null);
  }, [query]);

  const kind = federation.lookupKind(query);
  const asked = (query || '').trim();
  const onBluesky = kind === federation.ATPROTO;
  let domain = asked.startsWith('https://') ? asked.split('/')[2] : asked.slice(asked.lastIndexOf('@') + 1);
  if (onBluesky) {
    domain = i18n.t('federation:lookup.bluesky');
  }

  const handleLookup = () => {
    setIsLooking(true);
    setError('');

    // The lookup answers with who they are and not with their pictures,
    // so they are then read as their profile is; if that fails, the card
    // is drawn from what the lookup said.
    api.federation.lookup(asked).then((result) => {
      const person = result.data;
      return api.people.read(person.alias || person.id).then((full) => {
        setFound(full.data);
        onFound(full.data);
      }).catch(() => {
        setFound(person);
        onFound(person);
      });
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

  useEffect(() => {
    if (now && kind) {
      handleLookup();
    }
  }, [now, query]);

  if (!kind || absent[kind]) {
    return null;
  }

  // Drawn by the search page, among the results.
  if (found) {
    return null;
  }

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
          <Alert
            severity={federation.isRetryable(error) ? 'warning' : 'info'}
            sx={{ mt: 2 }}
          >
            {i18n.t(`federation:lookup.errors.${error}`, { domain })}
          </Alert>}
      </CardContent>
      {(!error || federation.isRetryable(error)) &&
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={() => {
              handleLookup();
            }}
            disabled={isLooking}
          >
            {error ?
              i18n.t('federation:lookup.retry') :
              i18n.t('federation:lookup.button')}
          </Button>
        </CardActions>}
    </Card>
  );
};

RemoteLookup.propTypes = {
  query: PropTypes.string,
  // Look them up at once, without waiting for the button.
  now: PropTypes.bool,
  // Given who was found.
  onFound: PropTypes.func.isRequired,
};

export default RemoteLookup;
