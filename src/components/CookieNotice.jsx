import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import i18n from '../languages';

const KEY = 'anahita-cookie-notice';

const seen = () => {
  try {
    return window.localStorage.getItem(KEY) === 'ok';
  } catch {
    return false;
  }
};

// Says, once, that the site's cookies are only for signing in, and that
// without them nobody can sign in. There is nothing to decline, so OK is
// the one button (the user, 2026-10-28). The reading of
// it is kept in this browser; where it cannot be, it is shown again.
const CookieNotice = () => {
  const [open, setOpen] = useState(() => { return !seen(); });

  if (!open) {
    return null;
  }

  const close = () => {
    try {
      window.localStorage.setItem(KEY, 'ok');
    } catch {
      // Shown again next time, which is all.
    }
    setOpen(false);
  };

  return (
    <Paper
      role="region"
      aria-label={i18n.t('legal:cookies.label')}
      elevation={6}
      sx={{
        position: 'fixed',
        zIndex: (theme) => { return theme.zIndex.snackbar; },
        // At the top on a phone, under the bar, where it covers nothing a
        // thumb wants: at the foot it lay over the + button (roadmap row
        // 112). At the foot on a wider screen, where the + is to its side.
        top: { xs: 72, sm: 'auto' },
        bottom: { xs: 'auto', sm: 16 },
        left: { xs: 16, sm: '50%' },
        right: { xs: 16, sm: 'auto' },
        transform: { sm: 'translateX(-50%)' },
        width: { sm: 560 },
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1,
        borderRadius: 2,
      }}
    >
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
        {i18n.t('legal:cookies.notice')}
        {' '}
        <Link component={RouterLink} to="/legal/privacy" underline="always" color="inherit">
          {i18n.t('legal:privacy')}
        </Link>
      </Typography>
      <Button variant="contained" onClick={close} sx={{ flexShrink: 0 }}>
        {i18n.t('legal:cookies.ok')}
      </Button>
    </Paper>
  );
};

export default CookieNotice;
