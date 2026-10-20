import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import useSite, { textIn } from '../site/useSite';
import { listProps } from '../../utils/lists';
import i18n from '../../languages';

// The site's rules, read where somebody is, without leaving it (the user,
// 2026-10-19): from a group's or an event's Rules tab, which says they apply
// there too.
const SiteRulesDialog = ({ open, onClose }) => {
  const site = useSite();
  const items = (site && site.rules && site.rules.items) || [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="site-rules-title">
      <DialogTitle id="site-rules-title">
        {i18n.t('agreements:rules.title')}
      </DialogTitle>
      <DialogContent>
        {items.length === 0 &&
          <Typography variant="body2" color="textSecondary">
            {i18n.t('agreements:rules.none')}
          </Typography>}
        <Stack spacing={2} {...listProps(items)}>
          {items.map((item, index) => {
            const body = textIn(item.body, i18n.language);
            return (
              // eslint-disable-next-line react/no-array-index-key
              <li key={`site-rule-${index}`}>
                <Typography variant="subtitle1">
                  {textIn(item.title, i18n.language)}
                </Typography>
                {body &&
                  <Typography variant="body2" color="textSecondary">
                    {body}
                  </Typography>}
              </li>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {i18n.t('commons:close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SiteRulesDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SiteRulesDialog;
