import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import useMediaQuery from '@mui/material/useMediaQuery';

import Progress from '../../components/Progress';
import { textIn, useRules } from '../site/useSite';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';

// How long after a tick the next rule comes forward.
const PAUSE = 600;

// One rule: its title, and a line more if it has one.
const Words = ({ item }) => {
  const title = textIn(item.title, i18n.language);
  const body = textIn(item.body, i18n.language);
  return (
    <span>
      <Typography component="span" variant="subtitle1" sx={{ display: 'block' }}>
        {title}
      </Typography>
      {body &&
        <Typography component="span" variant="body2" color="textSecondary">
          {body}
        </Typography>}
    </span>
  );
};

Words.propTypes = {
  item: PropTypes.object.isRequired,
};

// The site's rules, on a page of their own (roadmap row 102), after the Terms
// of Service and the Privacy Policy: the documents first, then what people
// hold themselves to.
//
// Somebody who has to agree ticks them one at a time (the user, 2026-10-19:
// "we really want them to abide by them out of personal responsibility"):
// only the first is there, and ticking one brings the next forward, a moment
// later, zooming in. The keyboard follows each as it comes. Zoom keeps to
// the theme's reduced motion, and the pause is left out for whoever asked
// their system for less.
//
// Anybody else, signed in or not, reads them as a list.
const Rules = ({
  refreshSession,
  alertError,
}) => {
  const navigate = useNavigate();
  const { site, known, outdated } = useRules();
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [ticked, setTicked] = useState({});
  const [shown, setShown] = useState(1);
  const [sending, setSending] = useState(false);
  const boxes = useRef([]);

  const items = (site && site.rules && site.rules.items) || [];
  const all = items.length > 0 && items.every((item, index) => { return ticked[index]; });

  // The last one shown ticked: the next comes forward.
  useEffect(() => {
    if (!outdated || shown >= items.length || !ticked[shown - 1]) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setShown(shown + 1);
    }, still ? 0 : PAUSE);
    return () => {
      clearTimeout(timer);
    };
  }, [ticked, shown, items.length, outdated]);

  const agree = () => {
    setSending(true);
    api.agreements.editRules(site.rules.version)
      .then(() => { return refreshSession(); })
      .then(() => { navigate('/', { replace: true }); })
      .catch(() => { alertError(i18n.t('agreements:prompts.error')); })
      .then(() => { setSending(false); });
  };

  if (!known) {
    return <Progress />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <div>
          <Typography variant="h5" component="h1" gutterBottom>
            {i18n.t('agreements:rules.title')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {outdated ? i18n.t('agreements:rules.intro') : i18n.t('agreements:rules.read')}
          </Typography>
        </div>

        {items.length === 0 &&
          <Alert severity="info">{i18n.t('agreements:rules.none')}</Alert>}

        {outdated ?
          <Stack spacing={2}>
            {items.slice(0, shown).map((item, index) => {
              return (
                <Zoom
                  // eslint-disable-next-line react/no-array-index-key
                  key={`rule-${index}`}
                  in
                  appear={index > 0}
                  onEntered={() => {
                    if (boxes.current[index]) {
                      boxes.current[index].focus();
                    }
                  }}
                >
                  <Box sx={{
                    p: 2, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper',
                  }}
                  >
                    <FormControlLabel
                      sx={{ alignItems: 'flex-start', m: 0 }}
                      control={
                        <Checkbox
                          checked={Boolean(ticked[index])}
                          disabled={sending}
                          slotProps={{
                            input: { ref: (element) => { boxes.current[index] = element; } },
                          }}
                          onChange={(event) => {
                            setTicked({ ...ticked, [index]: event.target.checked });
                          }}
                          sx={{ mt: -1 }}
                        />
                      }
                      label={<Words item={item} />}
                    />
                  </Box>
                </Zoom>
              );
            })}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={sending || !all}
              onClick={agree}
            >
              {i18n.t('agreements:actions.agreeRules')}
            </Button>
          </Stack> :
          <Stack spacing={2} component="ol" sx={{ pl: 3, m: 0 }}>
            {items.map((item, index) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li key={`rule-${index}`}>
                  <Words item={item} />
                </li>
              );
            })}
          </Stack>}
      </Stack>
    </Container>
  );
};

Rules.propTypes = {
  refreshSession: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    refreshSession: () => { return dispatch(actions.session.read()); },
    alertError: (message) => { return dispatch(actions.app.alert.error(message)); },
  };
};

export default connect(null, mapDispatchToProps)(Rules);
