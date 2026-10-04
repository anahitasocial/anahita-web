import React from 'react';
import { useParams } from 'react-router-dom';

import HeaderMeta from '../../../components/HeaderMeta';
import i18n from '../../../languages';

import ReportsCase from './Case';
import ReportsList from './List';

const SITE_NAME = process.env.REACT_APP_NAME;

// The Reports tab of the administration area: the list of cases at
// /admin/reports, one case at /admin/reports/<id>.
const Reports = () => {
  const { id } = useParams();

  return (
    <>
      <HeaderMeta title={`${i18n.t('abuseReports:cTitle')} - ${SITE_NAME}`} />
      {id ? <ReportsCase id={id} /> : <ReportsList />}
    </>
  );
};

export default Reports;
