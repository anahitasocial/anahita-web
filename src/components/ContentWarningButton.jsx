import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import ContentWarningDialog from './ContentWarningDialog';
import DetailRow from './DetailRow';
import i18n from '../languages';
import warnings from '../utils/warnings';

// The content warning of a post being written (anahita-services row 122),
// beside its audience: a row on the short composer's Details page, or,
// in the long composer and the reply form, an icon alone until a kind is
// chosen, and then the kind beside it. Each opens the same dialog.
const ContentWarningButton = ({
  value,
  onChange,
  disabled = false,
  row = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const chosen = warnings.has(value);
  const said = warnings.say(value, i18n.t.bind(i18n));
  const open = () => {
    setIsOpen(true);
  };

  let button;
  if (row) {
    button = (
      <DetailRow
        icon={warnings.iconOf(chosen ? value.kind : '')}
        label={i18n.t('warnings:label')}
        value={chosen ? said : i18n.t('warnings:none')}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={open}
      />
    );
  } else if (!chosen) {
    button = (
      <Tooltip title={i18n.t('warnings:label')}>
        <span>
          <IconButton
            size="small"
            aria-label={i18n.t('warnings:label')}
            aria-haspopup="dialog"
            disabled={disabled}
            onClick={open}
          >
            {warnings.iconOf('', { fontSize: 'small' })}
          </IconButton>
        </span>
      </Tooltip>
    );
  } else {
    button = (
      <Button
        size="small"
        color="primary"
        startIcon={warnings.iconOf(value.kind, { fontSize: 'small' })}
        aria-haspopup="dialog"
        aria-label={i18n.t('warnings:label')}
        title={i18n.t('warnings:label')}
        disabled={disabled}
        onClick={open}
        sx={{
          flexShrink: 1, whiteSpace: 'nowrap', minWidth: 0, maxWidth: 200,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {said}
        </span>
      </Button>
    );
  }

  return (
    <>
      {button}
      <ContentWarningDialog
        open={isOpen}
        value={value}
        onClose={() => {
          setIsOpen(false);
        }}
        onSave={(warning) => {
          onChange(warning);
          setIsOpen(false);
        }}
      />
    </>
  );
};

ContentWarningButton.propTypes = {
  // { kind, text }: kind '' for none.
  value: PropTypes.shape({
    kind: PropTypes.string,
    text: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  // A row of a post's Details page.
  row: PropTypes.bool,
};

export default ContentWarningButton;
