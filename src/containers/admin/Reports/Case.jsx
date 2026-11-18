import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

import BackIcon from '@mui/icons-material/ArrowBack';

import actions from '../../../actions';
import i18n from '../../../languages';

import ResolveDialog from './ResolveDialog';
import ContentWarningDialog from '../../../components/ContentWarningDialog';
import warnings from '../../../utils/warnings';
import CaseTarget from './CaseTarget';
import { CaseDecision, CaseReports } from './CaseRecord';
import useCase from './useCase';

// One case: what was reported, who reported it and why, what was decided,
// and the earlier cases the same thing has had.
//
// Nothing here deletes or disables anything. "View" goes to the thing
// itself, where the controls that do that live, with their own
// confirmations and their own rules about who may use them. This page
// records the decision.
//
// The case and every decision on it are useCase.js's; CaseTarget.jsx draws
// what was reported, and CaseRecord.jsx the decision and the reports. This
// file lays them out, with the dialogs that confirm a choice.
const ReportsCase = ({
  id,
  alertError,
  alertSuccess,
  readAdminCounts,
}) => {
  const report = useCase({
    id, alertError, alertSuccess, readAdminCounts,
  });
  const {
    item,
    isFetching,
    notFound,
    resolving,
    submitting,
    reported,
    canWarn,
    warning,
  } = report;

  const back = (
    <Box sx={{ mb: 1 }}>
      <Button component={RouterLink} to="/admin/reports" startIcon={<BackIcon />}>
        {i18n.t('abuseReports:case.back')}
      </Button>
    </Box>
  );

  if (notFound) {
    return (
      <>
        {back}
        <Card>
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('abuseReports:case.notFound')}
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!item) {
    return (
      <>
        {back}
        {isFetching && <LinearProgress />}
      </>
    );
  }

  return (
    <>
      {back}
      {isFetching && <LinearProgress />}

      <CaseTarget report={report} />
      <CaseDecision report={report} />
      <CaseReports item={item} />

      {resolving &&
        <ResolveDialog
          status={resolving}
          submitting={submitting}
          onClose={report.cancel}
          onConfirm={report.resolve}
        />}
      {report.spam.dialog}
      {report.refuse.dialog}
      {canWarn &&
        <ContentWarningDialog
          open={warning.isOpen}
          value={warnings.of(reported)}
          saving={warning.saving}
          moderator
          onClose={warning.close}
          onSave={warning.save}
        />}
    </>
  );
};

ReportsCase.propTypes = {
  id: PropTypes.string.isRequired,
  alertError: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  readAdminCounts: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    readAdminCounts: () => {
      return dispatch(actions.admin.readCounts());
    },
  };
};

export default connect(null, mapDispatchToProps)(ReportsCase);
