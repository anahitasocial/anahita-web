import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';
import warnings from '../../../utils/warnings';
import useRemoveAsSpam from '../../moderation/useRemoveAsSpam';
import useRefuseAccount, { canRefuseAccount } from '../../moderation/useRefuseAccount';

// What the server's refusal of a decision means, in words; the fallback
// when it does not say.
export const resolveError = (err, fallbackKey) => {
  const code = err && err.response && err.response.data && err.response.data.error;

  switch (code) {
    case 'already_decided':
      return i18n.t('abuseReports:adminErrors.alreadyDecided');
    case 'newer_case_open':
      return i18n.t('abuseReports:adminErrors.newerCaseOpen');
    case 'already_open':
      return i18n.t('abuseReports:adminErrors.alreadyOpen');
    default:
      return i18n.t(fallbackKey);
  }
};

const statusOf = (err) => {
  return err && err.response && err.response.status;
};

// One case of the reports, apart from how it is drawn: the case read from the
// server, and every decision that can be made on it from here.
//
// Nothing here deletes or disables anything but the two moderation actions
// that close a case as they act (removing a profile as spam, and refusing an
// account from another network). Everything else is a record of the
// decision; the controls that act on the thing itself are where it is.
//
// It gives:
//
//   item, isFetching, notFound   the case, and whether it is on its way or
//                                there is none
//   resolving, ask(status), cancel()
//                                the decision being confirmed in the dialog
//   submitting, resolve(decision), reopen()
//                                deciding it, or opening it again
//   spam, refuse                 the two moderation actions, with their own
//                                dialogs (moderation/)
//   reported, canWarn, warning   giving a reported post a content warning
//
// After any decision the page is read again, and the number on the menu and
// the tab with it (`readAdminCounts`).
const useCase = ({
  id,
  alertError,
  alertSuccess,
  readAdminCounts,
}) => {
  const [item, setItem] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [resolving, setResolving] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const viewer = useSelector((state) => { return state.session.viewer; });

  // What was reported, while the case is open and the thing is still there.
  const reported = item && item.status === 'open' && !item.targetGone ? item.target : null;

  // A person or a group reported as spam, removed from here at once (roadmap
  // row 102); the case is then closed as removed as spam.
  const spam = useRemoveAsSpam(viewer, reported, () => {
    // eslint-disable-next-line no-use-before-define
    resolve({ status: 'actioned', action: 'removed_as_spam', note: '' });
  });

  // An account from another network, reported or the author of what was
  // reported, refused for the whole site from here; the case is then
  // closed as refused. If the account's going closed it first, it stays
  // as that left it.
  const author = reported && (reported.author || reported.owner);
  const refusee = (canRefuseAccount(viewer, reported) && reported) ||
    (canRefuseAccount(viewer, author) && author) || null;
  const refuse = useRefuseAccount(viewer, refusee, () => {
    api.abuseReports.resolve(id, { status: 'actioned', action: 'refused', note: '' })
      .catch((err) => {
        if (statusOf(err) !== 409) {
          alertError(resolveError(err, 'abuseReports:adminErrors.resolve'));
        }
      })
      // eslint-disable-next-line no-use-before-define
      .then(refresh);
  });

  const fetchCase = useCallback(() => {
    setIsFetching(true);

    return api.abuseReports.readCase(id, i18n.language)
      .then(({ data }) => {
        setItem(data);
      })
      .catch((err) => {
        const status = statusOf(err);
        if (status === 404 || status === 400) {
          setNotFound(true);
          return;
        }
        alertError(i18n.t('abuseReports:case.loadError'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [alertError, id]);

  useEffect(() => {
    setItem(null);
    setNotFound(false);
    fetchCase();
  }, [fetchCase]);

  // After any decision: the page, and the number on the menu and the tab.
  const refresh = () => {
    readAdminCounts();
    return fetchCase();
  };

  const resolve = (decision) => {
    setSubmitting(true);

    api.abuseReports.resolve(id, decision)
      .then(() => {
        setResolving('');
        alertSuccess(decision.status === 'dismissed' ?
          i18n.t('abuseReports:adminAlerts.dismissed') :
          i18n.t('abuseReports:adminAlerts.actioned'));
      })
      .catch((err) => {
        setResolving('');
        alertError(resolveError(err, 'abuseReports:adminErrors.resolve'));
      })
      // Either way the page may be out of date: somebody else may have
      // decided it first.
      .then(refresh)
      .finally(() => {
        setSubmitting(false);
      });
  };

  // A post reported, given a content warning by the administrators (row
  // 122, phase 4): saved on the post, where its author is told, and the
  // case closed as warned. Taking a warning off decides nothing.
  const [isWarning, setIsWarning] = useState(false);
  const [savingWarning, setSavingWarning] = useState(false);
  const canWarn = Boolean(reported && utils.node.isMedium(reported));
  const saveWarning = (warning) => {
    setSavingWarning(true);
    api.warnings.edit(reported, warning).then(() => {
      setIsWarning(false);
      if (warnings.has(warning)) {
        resolve({ status: 'actioned', action: 'warned', note: '' });
        return;
      }
      alertSuccess(i18n.t('warnings:saved'));
      refresh();
    }).catch(() => {
      alertError(i18n.t('warnings:notSaved'));
    }).finally(() => {
      setSavingWarning(false);
    });
  };

  const reopen = () => {
    setSubmitting(true);

    api.abuseReports.reopen(id)
      .then(() => {
        alertSuccess(i18n.t('abuseReports:adminAlerts.reopened'));
      })
      .catch((err) => {
        alertError(resolveError(err, 'abuseReports:adminErrors.reopen'));
      })
      .then(refresh)
      .finally(() => {
        setSubmitting(false);
      });
  };

  return {
    item,
    isFetching,
    notFound,
    resolving,
    ask: setResolving,
    cancel: () => {
      setResolving('');
    },
    submitting,
    resolve,
    reopen,
    spam,
    refuse,
    reported,
    canWarn,
    warning: {
      isOpen: isWarning,
      saving: savingWarning,
      open: () => {
        setIsWarning(true);
      },
      close: () => {
        setIsWarning(false);
      },
      save: saveWarning,
    },
  };
};

export default useCase;
