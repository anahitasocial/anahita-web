import React from 'react';
import PropTypes from 'prop-types';

import AudienceButton from '../../../components/AudienceButton';
import audience from '../../../utils/audience';
import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';

// The audience picker for a post being written.
//
// A post used to be public the moment it was sent, and could only be
// narrowed afterwards, by which time it had been in every follower's
// feed. This puts the choice next to the Post button, where it is made
// before anybody sees anything.
//
// The button itself is shared with the control on an existing post; what
// is particular to writing is which options there are.
const ComposerAudience = ({
  actor,
  viewer,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <AudienceButton
      actor={actor}
      viewer={viewer}
      options={audience.optionsFor(actor, viewer)}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

ComposerAudience.propTypes = {
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ComposerAudience;
