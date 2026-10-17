import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';

import i18n from '../languages';

// A value to be put somewhere else, word for word: a token, a record's
// name, a few lines of HTML. Shown whole, selectable, with a button that
// copies it. The clipboard may be refused (it needs a secure context), so
// the button only says it copied when it did; the value is on screen to be
// selected either way.
const CopyValue = ({ label, value, multiline = false }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [value]);

  const canCopy = Boolean(navigator.clipboard && navigator.clipboard.writeText);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
    }).catch(() => {
      setCopied(false);
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      {label &&
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
          {label}
        </Typography>}
      <Box
        sx={{
          display: 'flex',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: 1,
          p: 1,
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}
      >
        <Typography
          component={multiline ? 'pre' : 'span'}
          variant="body2"
          sx={{
            flex: 1,
            m: 0,
            fontFamily: 'monospace',
            overflowWrap: 'anywhere',
            whiteSpace: multiline ? 'pre-wrap' : 'normal',
          }}
        >
          {value}
        </Typography>
        {canCopy &&
          <Tooltip title={i18n.t(copied ? 'websites:connect.copied' : 'websites:connect.copy')}>
            <IconButton
              size="small"
              onClick={copy}
              aria-label={i18n.t('websites:connect.copy')}
            >
              {copied ? <DoneIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>}
      </Box>
    </Box>
  );
};

CopyValue.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  multiline: PropTypes.bool,
};

export default CopyValue;
