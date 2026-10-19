import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Trans } from 'react-i18next';
import _ from 'lodash';
import utils from '../../../utils';
import i18n from '../../../languages';

const {
  getURL,
  getStorySubject,
  getStoryObjectName,
} = utils.node;

// A link inside the app, which does not load the page again; none, but the
// words, where there is nowhere to go.
const To = ({ url, children }) => {
  if (!url || url === '/') {
    return <span>{children}</span>;
  }
  return (
    <Link component={RouterLink} to={url}>
      {children}
    </Link>
  );
};

To.propTypes = {
  url: PropTypes.string,
  children: PropTypes.node,
};

// What a notification says: who did what, to what, where, in the words for
// its kind (`notifications:replyAdd` for `reply_add`), each a link. A kind
// the app does not know says only who it is from (`notifications:other`).
const NotificationMessage = ({ notification }) => {
  const subject = getStorySubject(notification);
  const subjectName = subject.id ? subject.name : i18n.t('actor:unknown');
  const objectName = getStoryObjectName(notification) || '';
  const object = notification.object || {};
  const target = notification.target || {};
  const targetName = target.id ? (target.name || target.title) : i18n.t('actor:unknown');

  const known = `notifications:${_.camelCase(notification.type)}`;
  const i18nKey = notification.type && i18n.exists(known) ? known : 'notifications:other';

  return (
    <Typography variant="body1" component="span">
      <Trans
        i18nKey={i18nKey}
        values={{
          subject: subjectName,
          object: objectName,
          target: targetName,
        }}
      >
        <To url={subject.id ? getURL(subject) : ''}>
          {subjectName}
        </To>
        <To url={object.id ? getURL(object) : ''}>
          {objectName}
        </To>
        <To url={target.id ? getURL(target) : ''}>
          {targetName}
        </To>
      </Trans>
    </Typography>
  );
};

NotificationMessage.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default NotificationMessage;
