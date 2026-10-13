import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ControlLike from '../../likes/controls/Like';
import LikesStats from '../../likes';
import MediumCard from '../../../components/MediumCard';
import ControlEditAccess from '../../controls/medium/Access';

import PersonType from '../../../proptypes/Person';
import MediumType from '../../../proptypes/Medium';

import MediumMenu from '../MediaMenu';
import { ShareAction, ofNode } from '../../controls/Share';
import utils from '../../../utils';
import perms from '../../../permissions';

const { getNamespace } = utils.node;

const MediaListItem = ({
  medium,
  viewer,
  isAuthenticated,
  handleView = null,
}) => {
  const namespace = getNamespace(medium);

  const Like = useMemo(() => {
    return ControlLike(namespace);
  }, [namespace]);

  const Access = useMemo(() => {
    return ControlEditAccess(namespace);
  }, [namespace]);

  const canEditMedium = perms.medium.canEdit(viewer, medium);

  return (
    <MediumCard
      medium={medium}
      handleView={handleView}
      menu={isAuthenticated &&
        <MediumMenu
          medium={medium}
          viewer={viewer}
          inline
        />}
      access={canEditMedium && medium.access && <Access medium={medium} />}
      stats={
        <LikesStats node={medium} />
      }
      actions={isAuthenticated && [
        <Like node={medium} key={`medium-like-${medium.id}`} />,
        <ShareAction what={ofNode(medium)} key={`medium-share-${medium.id}`} />,
      ]}
    />
  );
};

MediaListItem.propTypes = {
  medium: MediumType.isRequired,
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  handleView: PropTypes.func,
};

const mapStateToProps = (state) => {
  const { viewer, isAuthenticated } = state.session;

  return {
    viewer,
    isAuthenticated,
  };
};

export default connect(mapStateToProps)(MediaListItem);
