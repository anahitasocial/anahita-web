import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import ReplyIcon from '@mui/icons-material/ForumOutlined';

import ReplyAccessDialog from './ReplyAccessDialog';
import i18n from '../languages';
import replyAccess from '../utils/replyAccess';

// The button for who can reply to a post being written.
//
// It sits beside the audience and language buttons in the composer and
// works the same way: a button naming the current choice. There are more
// combinations than fit a menu, so it opens a dialog.
const ReplyAccessButton = ({
  value,
  onChange,
  quotePolicy = '',
  defaultQuotePolicy = '',
  onQuotePolicyChange = null,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const label = i18n.t('replies:access.label', {
    who: replyAccess.summary(value, i18n.t.bind(i18n)),
  });

  return (
    <>
      <Button
        size="small"
        color="inherit"
        startIcon={<ReplyIcon fontSize="small" />}
        aria-haspopup="dialog"
        aria-label={label}
        title={label}
        disabled={disabled}
        onClick={() => {
          setIsOpen(true);
        }}
        sx={{ flexShrink: 0, whiteSpace: 'nowrap', minWidth: 0 }}
      >
        {i18n.t(replyAccess.labelKey(value))}
      </Button>
      <ReplyAccessDialog
        open={isOpen}
        value={value}
        quotePolicy={quotePolicy}
        defaultQuotePolicy={defaultQuotePolicy}
        onClose={() => {
          setIsOpen(false);
        }}
        onSave={(chosen, whoQuotes) => {
          onChange(chosen);
          if (onQuotePolicyChange) {
            onQuotePolicyChange(whoQuotes);
          }
          setIsOpen(false);
        }}
      />
    </>
  );
};

ReplyAccessButton.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  // Who can quote the post being written: '' while it has not been said.
  quotePolicy: PropTypes.string,
  defaultQuotePolicy: PropTypes.string,
  onQuotePolicyChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default ReplyAccessButton;
