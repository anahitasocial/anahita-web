import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

import PageColumn from '../../../components/PageColumn';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';
import audience from '../../../utils/audience';
import { Actor as ACTOR } from '../../../constants';

const { getURL } = utils.node;
const { NAME, BODY } = ACTOR.FIELDS;

// Making a group, laid out as making an event is: its name, what it is
// about, one link, and who can see it, each with a line saying what it is
// for, then Cancel and Create side by side. Only the name is needed.
//
// Who can see it is asked here, and sent with the rest, so a group is never
// for a moment seen by more people than chosen. Afterwards it is under the
// group's settings. Where the installation allows nothing new to be public,
// Anyone is not offered (`minContentAccess` in NodeInfo); the server refuses
// it either way.
const GroupAdd = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  const { minContentAccess } = (nodeInfo && nodeInfo.metadata) || {};
  const levels = audience.newGroupLevels(minContentAccess);

  const [values, setValues] = useState({
    name: '',
    body: '',
    websiteUrl: '',
    access: levels[0],
  });
  const [isSaving, setIsSaving] = useState(false);

  const set = (name) => {
    return (event) => {
      setValues({ ...values, [name]: event.target.value });
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!values.name.trim() || isSaving) {
      return;
    }

    setIsSaving(true);
    api.groups.add({
      name: values.name.trim(),
      body: values.body.trim(),
      websiteUrl: values.websiteUrl.trim(),
      access: values.access,
    }).then((result) => {
      navigate(getURL(result.data));
    }).catch(() => {
      dispatch(actions.app.alert.error(i18n.t('groups:add.failed')));
      setIsSaving(false);
    });
  };

  return (
    <>
      <Helmet>
        <title>{i18n.t('groups:add.cTitle')}</title>
      </Helmet>
      <PageColumn>
        <Card component="form" onSubmit={handleSubmit} noValidate>
          <CardHeader
            avatar={<GroupAddIcon color="action" />}
            title={i18n.t('groups:add.cTitle')}
            subheader={i18n.t('groups:add.subheader')}
            slotProps={{ title: { variant: 'h6', component: 'h1' } }}
          />
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                autoFocus
                label={i18n.t('actor:name')}
                helperText={i18n.t('groups:add.nameHelp')}
                value={values.name}
                onChange={set('name')}
                disabled={isSaving}
                slotProps={{ htmlInput: { dir: 'auto', maxLength: NAME.MAX_LENGTH } }}
              />
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={i18n.t('actor:body')}
                helperText={i18n.t('groups:add.bodyHelp')}
                value={values.body}
                onChange={set('body')}
                disabled={isSaving}
                slotProps={{ htmlInput: { dir: 'auto', maxLength: BODY.MAX_LENGTH } }}
              />
              <TextField
                fullWidth
                label={i18n.t('actor:website')}
                helperText={i18n.t('groups:add.websiteHelp')}
                placeholder="example.com"
                value={values.websiteUrl}
                onChange={set('websiteUrl')}
                disabled={isSaving}
                // Not type="url", which would refuse a bare example.com that
                // the server takes as https. inputMode still gives the
                // keyboard for an address on a phone.
                slotProps={{ htmlInput: { maxLength: 255, inputMode: 'url' } }}
              />
              <FormControl disabled={isSaving}>
                <FormLabel id="group-access">
                  {i18n.t('groups:add.access')}
                </FormLabel>
                <RadioGroup
                  aria-labelledby="group-access"
                  name="group-access"
                  value={values.access}
                  onChange={set('access')}
                >
                  {levels.map((level) => {
                    return (
                      <FormControlLabel
                        key={level}
                        value={level}
                        control={<Radio />}
                        label={i18n.t(`groups:add.accessOptions.${level}`)}
                      />
                    );
                  })}
                </RadioGroup>
                <FormHelperText sx={{ mx: 0 }}>
                  {i18n.t('groups:add.accessHelp')}
                </FormHelperText>
              </FormControl>
            </Stack>
          </CardContent>
          {/* Side by side, each half the width: Cancel, then the one that
              does it. */}
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button
              fullWidth
              disabled={isSaving}
              onClick={() => {
                navigate('/groups/');
              }}
            >
              {i18n.t('actions:cancel')}
            </Button>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSaving || !values.name.trim()}
            >
              {isSaving ? <CircularProgress size={24} /> : i18n.t('actions:create')}
            </Button>
          </CardActions>
        </Card>
      </PageColumn>
    </>
  );
};

export default GroupAdd;
