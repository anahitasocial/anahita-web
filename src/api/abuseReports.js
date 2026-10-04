import axios from 'axios';

// Abuse reports: reporting something, and the cases administrators decide.
// See anahita-services docs/abuse-reports.md.

// The reasons that can be given for reporting a node of this type, in the
// given language. With no type, every reason: the administrators' filter.
const reasons = (type, lang) => {
  return axios.get('/abuse-reports/reasons', {
    params: { type, lang },
  });
};

// Report a node. 201 reported, 200 the viewer's earlier report was
// updated, 400 the reason does not fit or needs an explanation, 404 no
// such node the viewer can see, 429 too many reports.
const add = ({ targetId, reasonKey, details = '' }) => {
  return axios.post('/abuse-reports', { targetId, reasonKey, details });
};

// --- administrators ---

// `reason` is optional: with it, only the cases in which somebody gave
// that reason.
const browseCases = (params = {}) => {
  const {
    status = 'open',
    reason = '',
    limit = 20,
    offset = 0,
    lang,
  } = params;

  return axios.get('/abuse-reports/cases', {
    params: {
      status,
      // Left out altogether when there is no filter.
      reason: reason || undefined,
      limit,
      offset,
      lang,
    },
  });
};

// { open: n }, for the number on the Administration menu.
const summary = () => {
  return axios.get('/abuse-reports/cases/summary');
};

const readCase = (id, lang) => {
  return axios.get(`/abuse-reports/cases/${id}`, { params: { lang } });
};

// Records a decision. It does not carry one out: delete or disable the
// thing through its own service first, then say here what was done.
const resolve = (id, decision) => {
  const { status, action = '', note = '' } = decision;
  return axios.post(`/abuse-reports/cases/${id}/resolve`, {
    status,
    action,
    note,
  });
};

const reopen = (id) => {
  return axios.post(`/abuse-reports/cases/${id}/reopen`);
};

export default {
  reasons,
  add,
  browseCases,
  summary,
  readCase,
  resolve,
  reopen,
};
