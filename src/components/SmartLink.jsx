import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Link from '@mui/material/Link';
import OutboundIcon from '@mui/icons-material/OpenInNew';

import i18n from '../languages';

// Whether a link leaves this installation: an address of another site.
// A path, or an address of the web app's own, stays (the user, 2026-10-16).
const isOutbound = (href = '', origin = window.location.origin) => {
  if (!/^https?:\/\//i.test(href)) {
    return false;
  }
  try {
    return new URL(href).origin !== new URL(origin).origin;
  } catch (e) {
    return false;
  }
};

// The small mark after a link that leaves: it opens in a tab of its own.
const OutboundMark = () => {
  return (
    <OutboundIcon
      aria-hidden
      sx={{ fontSize: '0.85em', ml: 0.25, verticalAlign: '-0.1em' }}
    />
  );
};

// A link, as where it leads says: within Anahita it goes there in the same
// tab, by the app's own router; to another site it opens a new tab, marked
// as doing so, and tells that site nothing of where it came from.
const SmartLink = ({ href = '', children, ...rest }) => {
  if (isOutbound(href)) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        title={i18n.t('media:embed.opensNewTab')}
        {...rest}
      >
        {children}
        <OutboundMark />
      </Link>
    );
  }

  let to = href;
  if (/^https?:\/\//i.test(href)) {
    const address = new URL(href);
    to = `${address.pathname}${address.search}${address.hash}`;
  }
  if (!to.startsWith('/')) {
    return <Link href={href} {...rest}>{children}</Link>;
  }
  return (
    <Link component={RouterLink} to={to} {...rest}>
      {children}
    </Link>
  );
};

SmartLink.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node,
};

export { isOutbound, OutboundMark };
export default SmartLink;
