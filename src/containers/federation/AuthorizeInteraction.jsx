import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import api from '../../api';
import i18n from '../../languages';
import utils from '../../utils';
import afterSignIn from '../../utils/afterSignIn';
import PageColumn from '../../components/PageColumn';
import Progress from '../../components/Progress';

const { getURL } = utils.node;

// Where a page of another server sends somebody from here to follow a
// profile, or to answer, like or repost a post (roadmap row 134): Mastodon
// and Pixelfed fill in the address, from the template this site's WebFinger
// gives them. What it names is looked up, kept here, and opened, with its
// buttons at hand. Signed out, they sign in first and are brought back.
//
// `uri` is an address or a handle, `acct:` before it or not.
const AuthorizeInteraction = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => { return state.session.isAuthenticated; });
  const isResolved = useSelector((state) => { return state.session.isResolved; });
  const [failed, setFailed] = useState(false);

  const asked = (params.get('uri') || '').trim().replace(/^acct:/i, '');

  useEffect(() => {
    if (!isResolved) {
      return undefined;
    }
    if (!asked) {
      setFailed(true);
      return undefined;
    }
    // Something of this site: opened as it is.
    try {
      const address = new URL(asked);
      if (address.origin === window.location.origin) {
        navigate(`${address.pathname}${address.search}`, { replace: true });
        return undefined;
      }
    } catch (e) {
      // A handle, not an address.
    }
    if (!isAuthenticated) {
      afterSignIn.keep(`/authorize_interaction?uri=${encodeURIComponent(asked)}`);
      api.session.login();
      return undefined;
    }
    let current = true;
    api.federation.lookup(asked).then((result) => {
      if (current) {
        navigate(getURL(result.data), { replace: true });
      }
    }).catch(() => {
      if (current) {
        setFailed(true);
      }
    });
    return () => {
      current = false;
    };
  }, [asked, isAuthenticated, isResolved]);

  if (!failed) {
    return <Progress />;
  }

  return (
    <PageColumn>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" component="h1">
            {i18n.t('federation:interaction.notFound')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
            {asked}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            fullWidth
            variant="contained"
            component={RouterLink}
            to={`/search?q=${encodeURIComponent(asked)}`}
          >
            {i18n.t('federation:interaction.search')}
          </Button>
        </CardActions>
      </Card>
    </PageColumn>
  );
};

export default AuthorizeInteraction;
