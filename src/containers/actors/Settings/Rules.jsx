import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import DownIcon from '@mui/icons-material/ArrowDownward';
import UpIcon from '@mui/icons-material/ArrowUpward';

import Progress from '../../../components/Progress';
import useSite, { textIn } from '../../site/useSite';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import ActorType from '../../../proptypes/Actor';

// At most ten, so that every one is read (the user, 2026-10-19), and the
// lengths the server takes.
const MAX = 10;
const TITLE_MAX = 100;
const BODY_MAX = 300;

const same = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

// A group's or an event's rules, for its administrators (roadmap row 102,
// part 5): each a short title, and a line more if it needs one; in the order
// they choose; picked from the site's suggestions or written. Saving a
// change asks everybody who agreed before to agree again. The site's rules
// apply here as well, said once under them.
const ActorsSettingsRules = ({
  actor,
  alertSuccess,
  alertError,
}) => {
  const site = useSite();
  const [saved, setSaved] = useState(null);
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let current = true;
    api.rules.read(actor).then(({ data }) => {
      if (current) {
        const list = (data.items || []).map((each) => {
          return { title: each.title, body: each.body || '' };
        });
        setSaved(list);
        setItems(list);
      }
    }).catch(() => {
      if (current) {
        setSaved([]);
        setItems([]);
      }
    });
    return () => {
      current = false;
    };
  }, [actor.id]);

  if (saved === null) {
    return <Progress />;
  }

  const change = (index, field, value) => {
    setItems(items.map((each, at) => {
      return at === index ? { ...each, [field]: value } : each;
    }));
  };
  const move = (index, by) => {
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(index + by, 0, moved);
    setItems(next);
  };
  const remove = (index) => {
    setItems(items.filter((each, at) => { return at !== index; }));
  };
  const add = (title = '') => {
    if (items.length < MAX) {
      setItems([...items, { title, body: '' }]);
    }
  };

  const used = items.map((each) => { return each.title.trim().toLowerCase(); });
  const suggestions = ((site && site.rule_suggestions) || [])
    .map((each) => { return textIn(each.title, i18n.language); })
    .filter((title) => { return title && !used.includes(title.toLowerCase()); });

  const cleaned = items
    .map((each) => { return { title: each.title.trim(), body: each.body.trim() }; })
    .filter((each) => { return each.title; });
  const unchanged = same(cleaned, saved);

  const save = () => {
    setIsSaving(true);
    api.rules.set(actor, cleaned).then(({ data }) => {
      const list = (data.items || []).map((each) => {
        return { title: each.title, body: each.body || '' };
      });
      setSaved(list);
      setItems(list);
      alertSuccess(i18n.t('rules:prompts.saved'));
    }).catch(() => {
      alertError(i18n.t('rules:prompts.notSaved'));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  return (
    <>
      <CardContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {i18n.t('rules:editor.intro')}
        </Typography>
        <Stack spacing={2}>
          {items.map((item, index) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Stack key={`rule-${index}`} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <Typography variant="subtitle1" sx={{ pt: 1, minWidth: 24 }}>
                  {`${index + 1}.`}
                </Typography>
                <Stack spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
                  <TextField
                    value={item.title}
                    onChange={(event) => { change(index, 'title', event.target.value); }}
                    label={i18n.t('rules:editor.title')}
                    size="small"
                    fullWidth
                    disabled={isSaving}
                    slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
                  />
                  <TextField
                    value={item.body}
                    onChange={(event) => { change(index, 'body', event.target.value); }}
                    label={i18n.t('rules:editor.body')}
                    size="small"
                    fullWidth
                    multiline
                    disabled={isSaving}
                    slotProps={{ htmlInput: { maxLength: BODY_MAX } }}
                  />
                </Stack>
                <Stack>
                  <IconButton
                    size="small"
                    aria-label={i18n.t('rules:editor.up')}
                    disabled={isSaving || index === 0}
                    onClick={() => { move(index, -1); }}
                  >
                    <UpIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label={i18n.t('rules:editor.down')}
                    disabled={isSaving || index === items.length - 1}
                    onClick={() => { move(index, 1); }}
                  >
                    <DownIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label={i18n.t('rules:editor.remove')}
                    disabled={isSaving}
                    onClick={() => { remove(index); }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={<AddIcon />}
            disabled={isSaving || items.length >= MAX}
            onClick={() => { add(); }}
          >
            {items.length >= MAX ? i18n.t('rules:editor.full', { max: MAX }) : i18n.t('rules:editor.add')}
          </Button>
        </Box>
        {suggestions.length > 0 && items.length < MAX &&
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {i18n.t('rules:editor.suggestions')}
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {suggestions.map((title) => {
                return (
                  <Chip
                    key={title}
                    label={title}
                    icon={<AddIcon />}
                    variant="outlined"
                    disabled={isSaving}
                    onClick={() => { add(title); }}
                  />
                );
              })}
            </Stack>
          </Box>}
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {i18n.t('rules:editor.siteRules')}
          {' '}
          <Link component={RouterLink} to="/rules">
            {i18n.t('rules:editor.siteRulesLink')}
          </Link>
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button
            disabled={isSaving || unchanged}
            onClick={() => { setItems(saved); }}
          >
            {i18n.t('actions:cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={isSaving || unchanged}
            onClick={save}
          >
            {i18n.t('actions:save')}
          </Button>
        </Stack>
      </CardActions>
    </>
  );
};

ActorsSettingsRules.propTypes = {
  actor: ActorType.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => { return dispatch(actions.app.alert.success(message)); },
    alertError: (message) => { return dispatch(actions.app.alert.error(message)); },
  };
};

export default connect(null, mapDispatchToProps)(ActorsSettingsRules);
