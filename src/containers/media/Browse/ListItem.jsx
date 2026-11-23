import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Typography from '@mui/material/Typography';

import ControlLike from '../../likes/controls/Like';
import LikesStats from '../../likes';
import MediumCard from '../../../components/MediumCard';
import ControlEditAccess from '../../controls/medium/Access';

import PersonType from '../../../proptypes/Person';
import MediumType from '../../../proptypes/Medium';

import MediumMenu from '../MediaMenu';
import { ShareAction, ofNode } from '../../controls/Share';
import ControlRepost from '../../controls/Repost';
import FeedReplyButton from '../../feed/components/ReplyButton';
import utils from '../../../utils';
import perms from '../../../permissions';
import postCounts from '../../../components/PostCounts';
import i18n from '../../../languages';

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

  // Put up from the article editor, in its author's own list only (roadmap
  // row 178): said so beside its time, and with nothing to like, answer,
  // repost or share here, which nobody else could see.
  if (medium.libraryOnly) {
    return (
      <MediumCard
        medium={medium}
        handleView={handleView}
        menu={<MediumMenu medium={medium} viewer={viewer} inline />}
        access={
          <Typography component="span" variant="body2" color="textSecondary">
            {` · ${i18n.t('composer:library.only')}`}
          </Typography>
        }
        actions={[]}
      />
    );
  }

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
      // The same as a post in a feed: Download only on the post's own page.
      actions={!isAuthenticated ? postCounts(medium) : [
        <Like node={medium} key={`medium-like-${medium.id}`} />,
        <FeedReplyButton post={medium} key={`medium-reply-${medium.id}`} />,
        <ControlRepost parent={medium} key={`medium-repost-${medium.id}`} />,
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
