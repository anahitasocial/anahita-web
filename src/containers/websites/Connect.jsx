import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import WebsiteIcon from '@mui/icons-material/RssFeed';

import CopyValue from '../../components/CopyValue';
import PageColumn from '../../components/PageColumn';
import actions from '../../actions';
import api from '../../api';
import permissions from '../../permissions';
import utils from '../../utils';
import i18n from '../../languages';
import { Actor as ACTOR } from '../../constants';

const { NAME, BODY } = ACTOR.FIELDS;

const SITE = 0;
const PROOF = 1;
const WEBSITE = 2;

// What a refusal says, as syndication-service names it in `error`.
const refusalOf = (failure) => {
  const response = failure && failure.response;
  if (response && response.status === 429) {
    return i18n.t('websites:connect.errors.tooMany');
  }
  const reason = response && response.data && response.data.error;
  const key = `websites:connect.errors.${reason}`;
  return reason && i18n.exists(key) ? i18n.t(key) : i18n.t('websites:connect.errors.generic');
};

// Connecting a website: "Connect your website", never "create".
// The site's address, to find its feed; the token, put in a DNS record or a
// file on the site, and checked; then the website's name, handle and
// description. Only somebody WEBSITES_FROM allows is offered it.
const WebsiteConnect = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const viewer = useSelector((state) => { return state.session.viewer; });
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  const settings = (nodeInfo && nodeInfo.metadata) || {};

  const [step, setStep] = useState(SITE);
  const [busy, setBusy] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');
  const [siteError, setSiteError] = useState('');
  const [connection, setConnection] = useState(null);
  const [proof, setProof] = useState('');
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [body, setBody] = useState('');
  const [websiteError, setWebsiteError] = useState({ field: '', message: '' });

  if (!permissions.actor.canConnect(viewer, settings)) {
    return null;
  }

  const cancel = () => {
    navigate('/websites/');
  };

  const find = (event) => {
    event.preventDefault();
    if (!siteUrl.trim() || busy) {
      return;
    }
    setBusy(true);
    setSiteError('');
    api.websiteConnect.start(siteUrl.trim()).then((result) => {
      const found = result.data;
      setConnection(found);
      setName(found.suggestedName || '');
      setAlias(found.suggestedAlias || '');
      setBody(found.feedDescription || '');
      setProof('');
      setStep(PROOF);
    }).catch((failure) => {
      setSiteError(refusalOf(failure));
    }).finally(() => {
      setBusy(false);
    });
  };

  const check = () => {
    setBusy(true);
    api.websiteConnect.check(connection).then((result) => {
      const { proved, method } = result.data;
      if (proved) {
        setProof(i18n.t('websites:connect.proof.proved', {
          method: i18n.t(`websites:connect.proof.methods.${method}`),
        }));
        setStep(WEBSITE);
      } else {
        setProof(i18n.t('websites:connect.proof.notYet'));
      }
    }).catch((failure) => {
      setProof(refusalOf(failure));
    }).finally(() => {
      setBusy(false);
    });
  };

  const make = (event) => {
    event.preventDefault();
    if (!name.trim() || !alias.trim() || busy) {
      return;
    }
    setBusy(true);
    setWebsiteError({ field: '', message: '' });
    api.websiteConnect.make(connection, {
      name: name.trim(),
      alias: alias.trim(),
      body: body.trim(),
    }).then((result) => {
      dispatch(actions.app.alert.success(i18n.t('websites:connect.done')));
      navigate(`/@${result.data.alias}/`);
    }).catch((failure) => {
      const { data } = (failure && failure.response) || {};
      const reason = data && data.error;
      setWebsiteError({
        field: reason === 'handle_taken' ? 'alias' : '',
        message: refusalOf(failure),
      });
      setBusy(false);
    });
  };

  // Full width and side by side: Cancel on the left, the step's action on
  // the right.
  const actionsRow = (main) => {
    return (
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button fullWidth onClick={cancel} disabled={busy}>
          {i18n.t('actions:cancel')}
        </Button>
        {main}
      </Stack>
    );
  };

  return (
    <>
      <Helmet>
        <title>{i18n.t('websites:connect.cTitle')}</title>
      </Helmet>
      <PageColumn>
        <Card>
          <CardHeader
            avatar={<WebsiteIcon />}
            title={i18n.t('websites:connect.cTitle')}
            slotProps={{ title: { variant: 'h6', component: 'h1' } }}
          />
          <CardContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {i18n.t('websites:connect.intro')}
            </Typography>
            <Stepper activeStep={step} orientation="vertical">
              <Step>
                <StepLabel
                  optional={connection && step > SITE &&
                    <Typography variant="caption">{connection.feedUrl}</Typography>}
                >
                  {i18n.t('websites:connect.steps.site')}
                </StepLabel>
                <StepContent>
                  <form onSubmit={find} noValidate>
                    <TextField
                      variant="standard"
                      label={i18n.t('websites:connect.site.label')}
                      placeholder={i18n.t('websites:connect.site.placeholder')}
                      value={siteUrl}
                      onChange={(event) => { setSiteUrl(event.target.value); }}
                      error={siteError !== ''}
                      helperText={siteError || i18n.t('websites:connect.site.help')}
                      disabled={busy}
                      fullWidth
                      autoFocus
                      slotProps={{ htmlInput: { inputMode: 'url', maxLength: 2000 } }}
                    />
                    {actionsRow(
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={busy || !siteUrl.trim()}
                      >
                        {i18n.t('websites:connect.site.find')}
                      </Button>,
                    )}
                  </form>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>{i18n.t('websites:connect.steps.proof')}</StepLabel>
                <StepContent>
                  {connection &&
                    <>
                      {connection.feedTitle &&
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {i18n.t('websites:connect.found', { title: connection.feedTitle })}
                        </Typography>}
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {i18n.t('websites:connect.proof.intro', { domain: connection.domain })}
                      </Typography>
                      <CopyValue label={i18n.t('websites:connect.proof.token')} value={connection.token} />
                      <Typography variant="subtitle2">
                        {i18n.t('websites:connect.proof.dnsTitle')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t('websites:connect.proof.dns')}
                      </Typography>
                      <CopyValue value={connection.recordName} />
                      <Typography variant="subtitle2">
                        {i18n.t('websites:connect.proof.fileTitle')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t('websites:connect.proof.file')}
                      </Typography>
                      <CopyValue value={connection.fileUrl} />
                      {/* The line the answer is written on is kept, so the
                          buttons do not move when it is. */}
                      <Typography variant="body2" sx={{ minHeight: 8 * 5 }} role="status">
                        {proof}
                      </Typography>
                      {actionsRow(
                        <Button variant="contained" fullWidth onClick={check} disabled={busy}>
                          {i18n.t('websites:connect.proof.check')}
                        </Button>,
                      )}
                    </>}
                </StepContent>
              </Step>

              <Step>
                <StepLabel>{i18n.t('websites:connect.steps.website')}</StepLabel>
                <StepContent>
                  <form onSubmit={make} noValidate>
                    <Typography variant="body2" color="textSecondary">
                      {proof}
                    </Typography>
                    <TextField
                      variant="standard"
                      label={i18n.t('websites:connect.website.name')}
                      value={name}
                      onChange={(event) => { setName(event.target.value); }}
                      helperText=" "
                      margin="normal"
                      fullWidth
                      required
                      disabled={busy}
                      slotProps={{ htmlInput: { dir: 'auto', maxLength: NAME.MAX_LENGTH } }}
                    />
                    <TextField
                      variant="standard"
                      label={i18n.t('websites:connect.website.alias')}
                      value={alias}
                      onChange={(event) => { setAlias(event.target.value); }}
                      error={websiteError.field === 'alias'}
                      helperText={websiteError.field === 'alias' ?
                        websiteError.message :
                        i18n.t('websites:connect.website.aliasHelp', { handle: utils.federation.siteHandle(alias || 'example') })}
                      margin="normal"
                      fullWidth
                      required
                      disabled={busy}
                      slotProps={{ htmlInput: { maxLength: 30, pattern: '[A-Za-z0-9_-]{3,30}' } }}
                    />
                    <TextField
                      variant="standard"
                      label={i18n.t('websites:connect.website.body')}
                      value={body}
                      onChange={(event) => { setBody(event.target.value); }}
                      helperText={(websiteError.field === '' && websiteError.message) || i18n.t('websites:connect.website.seen')}
                      error={websiteError.field === '' && websiteError.message !== ''}
                      margin="normal"
                      fullWidth
                      multiline
                      disabled={busy}
                      slotProps={{ htmlInput: { dir: 'auto', maxLength: BODY.MAX_LENGTH } }}
                    />
                    {actionsRow(
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={busy || !name.trim() || alias.trim().length < 3}
                      >
                        {i18n.t('websites:connect.website.connect')}
                      </Button>,
                    )}
                  </form>
                </StepContent>
              </Step>
            </Stepper>
          </CardContent>
        </Card>
      </PageColumn>
    </>
  );
};

export default WebsiteConnect;
