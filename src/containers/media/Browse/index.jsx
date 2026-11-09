import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import actions from '../../../actions';

import MediumStepper from '../Stepper';
import MediaList from './List';
import useBrowse from '../../browse/useBrowse';

// A profile's notes, photos, articles or topics, by `namespace`: the list
// through useBrowse, drawn by MediaList, and a post opened over it in the
// stepper.
//
// No alert on an error: the list stays as it was, and does not call itself
// empty (`isEmpty` below).
const MediaBrowse = ({ namespace, queryFilters, tab = '' }) => {
  const viewer = useSelector((state) => { return state.session.viewer; });
  const error = useSelector((state) => { return state[namespace].error || ''; });

  const list = useMemo(() => {
    return {
      browse: (params) => { return actions[namespace].browse(params, namespace); },
      reset: () => { return actions[namespace].reset(namespace); },
      select: (state) => {
        const { total, isFetching } = state[namespace];
        return { items: state[namespace][namespace], total, isFetching };
      },
    };
  }, [namespace]);

  // The filters by what they say, not by the object, which the page makes
  // anew each time it draws.
  const queryKey = JSON.stringify(queryFilters);
  const {
    items, total, answered, next,
  } = useBrowse({
    ...list,
    params: queryFilters,
    queryKey,
  });

  const [currentId, setCurrentId] = useState(null);
  const [stepperOpen, setStepperOpen] = useState(false);

  const Stepper = useMemo(() => {
    return MediumStepper(namespace);
  }, [namespace]);

  const handleClose = () => {
    setStepperOpen(false);
    setCurrentId(null);
  };

  const handleView = (mediumId) => {
    setCurrentId(mediumId);
    setStepperOpen(true);
  };

  return (
    <>
      {stepperOpen && currentId && (
        <Stepper
          mediumId={currentId}
          open={stepperOpen}
          handleClose={handleClose}
        />
      )}
      <MediaList
        items={items}
        namespace={namespace}
        tab={tab}
        viewer={viewer}
        total={total}
        fetchList={next}
        handleView={handleView}
        isEmpty={answered && !error && total === 0}
      />
    </>
  );
};

MediaBrowse.propTypes = {
  namespace: PropTypes.string.isRequired,
  // oid is the profile whose posts are listed. It is required: the server
  // has no list of every post of a type.
  queryFilters: PropTypes.shape({
    oid: PropTypes.number.isRequired,
    // `audio`: a profile's audio posts, from its videos' address.
    type: PropTypes.string,
  }).isRequired,
  // The profile's tab it is listed in, where it is not the namespace's:
  // `audio`, in `videos`.
  tab: PropTypes.string,
};

// One component for each namespace, made once: callers ask for it while
// drawing, and a new component each time would empty and read the list again
// on every unrelated redraw of the page.
const byNamespace = {};

export default (namespace) => {
  if (!byNamespace[namespace]) {
    const ForNamespace = (props) => {
      return <MediaBrowse {...props} namespace={namespace} />;
    };
    byNamespace[namespace] = ForNamespace;
  }

  return byNamespace[namespace];
};
