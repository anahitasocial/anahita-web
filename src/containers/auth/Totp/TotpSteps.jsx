import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';

import TOTPIcon from '@mui/icons-material/PhonelinkLock';
import CopyIcon from '@mui/icons-material/FileCopy';
import DownloadIcon from '@mui/icons-material/CloudDownload';

import i18n from '../../../languages';
import { Totp as TOTP } from '../../../constants';

import FormPassword from './FormPassword';
import FormPairing from './FormPairing';
import RecoveryCodes from './RecoveryCodes';

const useStyles = makeStyles()((theme) => {
  return {
    stepper: {
      padding: theme.spacing(2),
    },
  };
});

const { STEPS } = TOTP;

const TotpSteps = ({
  handleOnSubmitPassword,
  handleOnChangePassword,
  handleOnSubmitPasscode,
  handleOnChangePasscode,
  handleDownloadRecoveryCodes,
  handleCopyRecoveryCodes,
  handleEnableTOTP,
  handleDone,
  activeStep = STEPS.PAIR_DEVICE,
  passwordFields,
  pairingFields,
  qrCodeImage = null,
  recoveryCodes = [],
  codesCopySuccess = false,
  enableError = '',
}) => {
  const { classes } = useStyles();

  const steps = {
    [STEPS.PAIR_DEVICE]: i18n.t('auth:totp.steps.pairDevice'),
    [STEPS.DOWNLOAD_RECOVERY_CODES]: i18n.t('auth:totp.steps.downloadRecoveryCodes'),
    [STEPS.ENABLED]: i18n.t('auth:totp.steps.enabled'),
  };

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={
          <Avatar>
            <TOTPIcon />
          </Avatar>
        }
        title={
          <Typography variant="h6">
            {i18n.t('auth:totp.steps.cTitle')}
          </Typography>
        }
      />
      <Stepper
        activeStep={Object.keys(steps).indexOf(activeStep)}
        alternativeLabel
        className={classes.stepper}
      >
        {Object.keys(steps).map((key) => {
          return (
            <Step key={key}>
              <StepLabel>{steps[key]}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {!activeStep &&
        <form onSubmit={handleOnSubmitPassword} noValidate autoComplete="off">
          <CardContent>
            <FormPassword
              fields={passwordFields}
              handleOnChange={handleOnChangePassword}
            />
          </CardContent>
          {/* A way out. Enable 2FA opened this wizard, and without a cancel
              the only exits were finishing it or leaving the page. */}
          <CardActions>
            <Button onClick={handleDone} fullWidth>
              {i18n.t('actions:cancel')}
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              fullWidth
            >
              {i18n.t('actions:continue')}
            </Button>
          </CardActions>
        </form>}
      {activeStep === STEPS.PAIR_DEVICE &&
        <form onSubmit={handleOnSubmitPasscode} noValidate autoComplete="off">
          <CardContent>
            <FormPairing
              fields={pairingFields}
              handleOnChange={handleOnChangePasscode}
              qrCodeImage={qrCodeImage}
            />
          </CardContent>
          {/* A secret exists by this point but 2FA is not enabled, and the
              next enrolment overwrites it — so backing out here costs
              nothing and stranding somebody on a QR code would. */}
          <CardActions>
            <Button onClick={handleDone} fullWidth>
              {i18n.t('actions:cancel')}
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              fullWidth
            >
              {i18n.t('actions:continue')}
            </Button>
          </CardActions>
        </form>}
      {activeStep === STEPS.DOWNLOAD_RECOVERY_CODES &&
        <>
          <CardContent>
            <RecoveryCodes items={recoveryCodes} />
            {enableError !== '' &&
              <Typography variant="body2" color="error">
                {enableError}
              </Typography>}
          </CardContent>
          <CardActions>
            <Button
              startIcon={<CopyIcon />}
              type="submit"
              variant="outlined"
              fullWidth
              onClick={handleCopyRecoveryCodes}
              color={codesCopySuccess ? 'secondary' : 'default'}
            >
              {codesCopySuccess ? i18n.t('auth:totp.recoveryCodes.prompts.copySuccess') : i18n.t('auth:totp.recoveryCodes.prompts.copyCodes')}
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
              fullWidth
              onClick={handleDownloadRecoveryCodes}
            >
              {i18n.t('actions:download')}
            </Button>
          </CardActions>
          <CardActions>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              fullWidth
              onClick={handleEnableTOTP}
            >
              {i18n.t('auth:totp.recoveryCodes.prompts.enableTotp')}
            </Button>
          </CardActions>
        </>}
      {activeStep === STEPS.ENABLED &&
        <>
          <CardContent>
            <Typography variant="h5" align="center">
              {i18n.t('auth:totp.enable.cDesc')}
            </Typography>
          </CardContent>
          {/* Returns to the collapsed card rather than linking to the
              profile. This wizard used to be the whole 2FA settings page, so
              leaving it meant leaving; now it is one card in the Security
              section and navigating away would abandon the page the person
              was working on. */}
          <CardActions>
            <Button
              onClick={handleDone}
              fullWidth
              color="primary"
              variant="contained"
            >
              {i18n.t('actions:done')}
            </Button>
          </CardActions>
        </>}
    </Card>
  );
};

TotpSteps.propTypes = {
  handleOnSubmitPassword: PropTypes.func.isRequired,
  handleOnChangePassword: PropTypes.func.isRequired,
  handleOnSubmitPasscode: PropTypes.func.isRequired,
  handleOnChangePasscode: PropTypes.func.isRequired,
  handleDownloadRecoveryCodes: PropTypes.func.isRequired,
  handleCopyRecoveryCodes: PropTypes.func.isRequired,
  handleEnableTOTP: PropTypes.func.isRequired,
  handleDone: PropTypes.func.isRequired,
  activeStep: PropTypes.oneOf([
    STEPS.PAIR_DEVICE,
    STEPS.DOWNLOAD_RECOVERY_CODES,
    STEPS.ENABLED,
  ]),
  passwordFields: PropTypes.objectOf(PropTypes.any).isRequired,
  pairingFields: PropTypes.objectOf(PropTypes.any).isRequired,
  qrCodeImage: PropTypes.object,
  recoveryCodes: PropTypes.arrayOf(PropTypes.string),
  codesCopySuccess: PropTypes.bool,
  enableError: PropTypes.string,
};

export default TotpSteps;
