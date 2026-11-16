import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';

import AccessDialog from './AccessDialog';
import { accessIconOf } from './accessIcons';
import DetailRow from './DetailRow';
import audience from '../utils/audience';
import i18n from '../languages';
import ActorType from '../proptypes/Actor';
import PersonType from '../proptypes/Person';

// The audience button: who can see a post.
//
// One control for the two places the question comes up: beside the Post
// button while a post is being written, and on a post that exists, for
// somebody who may change who sees it. They used to look different, a
// labelled button in one place and a bare globe or padlock in the other,
// for what is the same choice.
//
// A button that names the current choice, opening the access dialog, the
// one way to choose an access level (roadmap row 155). Not an icon alone:
// the difference between a globe and a padlock is the difference between
// everybody and nobody, and it should not depend on reading a 20-pixel
// glyph.
//
// It only draws. Which options there are and which are disabled is the
// caller's to say: see utils/audience, and the two callers,
// containers/media/Composer and containers/controls/medium/Access.
const AudienceButton = ({
  actor,
  viewer,
  options,
  value,
  onChange,
  disabled = false,
  row = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Whose profile it is decides the wording: "people who follow you" on
  // your own, "people who follow Ada" on hers or on a group's.
  const place = audience.placeOf(actor, viewer);

  const nameOf = (level) => {
    return audience.nameOf(level, i18n.t);
  };

  const describe = (level) => {
    return audience.describe(level, place, actor.name, i18n.t);
  };

  const Icon = accessIconOf(value);

  const open = () => {
    setIsOpen(true);
  };

  return (
    <>
      {row &&
        <DetailRow
          icon={<Icon />}
          label={i18n.t('composer:details.audience')}
          value={nameOf(value)}
          aria-haspopup="dialog"
          disabled={disabled}
          onClick={open}
        />}
      {!row &&
      <Button
        size="small"
        color="inherit"
        startIcon={<Icon fontSize="small" />}
        aria-haspopup="dialog"
        aria-label={i18n.t('access:audience.label', { name: nameOf(value) })}
        title={describe(value)}
        disabled={disabled}
        onClick={open}
        // Stays one line beside a full-width Post button.
        sx={{ flexShrink: 0, whiteSpace: 'nowrap', textTransform: 'none' }}
      >
        {nameOf(value)}
      </Button>}
      <AccessDialog
        open={isOpen}
        title={i18n.t('composer:details.audience')}
        value={value}
        options={options.map((option) => {
          return {
            value: option.level,
            name: nameOf(option.level),
            description: describe(option.level),
            disabled: option.disabled,
            // A disabled one says why, where the others say whom.
            reason: i18n.t('access:audience.capped', { name: actor.name }),
          };
        })}
        onClose={() => {
          setIsOpen(false);
        }}
        onChoose={(level) => {
          setIsOpen(false);
          onChange(level);
        }}
      />
    </>
  );
};

AudienceButton.propTypes = {
  // The profile the post is on.
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    level: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  })).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  // A row of a post's Details page, in place of the small button.
  row: PropTypes.bool,
};

export default AudienceButton;
