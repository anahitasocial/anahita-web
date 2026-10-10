import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ControlFollow from '../../controls/Follow';
import ControlFollowRequest from '../../controls/FollowRequest';
import LimitedActorCard from '../../../components/LimitedActorCard';
import EventCard from '../../events/Card';
import events from '../../../utils/events';
import ActorCard from '../../../components/ActorCard';
import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';
import permissions from '../../../permissions/actor';

const ActorsCard = (props) => {
  const {
    actor,
    viewer,
    isAuthenticated,
  } = props;

  // An event has its own card wherever an actor's would be drawn, as in
  // search results: its cover when it has one, when it is, how many are
  // going. The general card gives every actor a tall cover, pictured or
  // not, and a Follow button, and an event is answered, not followed.
  if (events.isEvent(actor)) {
    return <EventCard actor={actor} />;
  }

  // One the viewer may not see, listed because it may be asked. The
  // server sends its name and picture and nothing else.
  if (actor.restricted) {
    return (
      <LimitedActorCard
        actor={actor}
        action={isAuthenticated && actor.allowFollowRequest &&
          <ControlFollowRequest actor={actor} />}
      />
    );
  }

  const showFollow = isAuthenticated && permissions.canFollow(actor, viewer);

  return (
    <ActorCard
      actor={actor}
      viewer={viewer}
      action={[
        showFollow && <ControlFollow
          actor={actor}
          key={`actor-action-follow-${actor.id}`}
        />,
        // No delete on a browse card. One click and one generic dialog, on a
        // list where the cards look alike — the easiest place in the app to
        // destroy the wrong profile, and it bypassed every disclosure in the
        // Danger zone. Admins delete from settings, where the tier decides
        // how much ceremony the account warrants.
      ]}
    />
  );
};

ActorsCard.propTypes = {
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  const {
    viewer,
    isAuthenticated,
  } = state.session;

  return {
    viewer,
    isAuthenticated,
  };
};

export default connect(mapStateToProps)(ActorsCard);
