import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import actions from '../../../actions';
import i18n from '../../../languages';
import permissions from '../../../permissions';
import HashtagDefault from '../../../proptypes/HashtagDefault';
import HashtagsType from '../../../proptypes/Hashtags';
import PersonType from '../../../proptypes/Person';

import HashtagMenu from '../Menu';
import Progress from '../../../components/Progress';
import Inbounds from '../../inbounds';
import FollowHashtag from '../../feeds/FollowHashtag';
import customFeeds from '../../../utils/customFeeds';

const HashtagsRead = (props) => {
  const {
    readHashtag,
    hashtags: {
      current: hashtag = { ...HashtagDefault },
    },
    inboundsCount,
    isFetching,
    error,
    viewer,
    isAuthenticated,
  } = props;
  const { alias: aliasParam } = useParams();

  useEffect(() => {
    readHashtag(aliasParam);
  }, [aliasParam]);

  if (isFetching) {
    return (
      <Progress />
    );
  }

  if (error !== '') {
    return (
      <Navigate to="/404/" replace />
    );
  }

  const canAdminister = permissions.node.canAdminister(viewer);

  return (
    <>
      <Card>
        <CardHeader
          avatar={
            <Avatar>
              #
            </Avatar>
          }
          title={
            <Typography variant="h6">
              {hashtag.name}
            </Typography>
          }
          subheader={i18n.t('inbounds:count', {
            count: inboundsCount,
          })}
          action={(canAdminister || permissions.report.canAdd(viewer, hashtag)) &&
            <HashtagMenu
              hashtag={hashtag}
              viewer={viewer}
              canAdminister={Boolean(canAdminister)}
            />}
        />
        {/* Following a hashtag is keeping a feed of it on the home page. */}
        {isAuthenticated && hashtag.id > 0 &&
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <FollowHashtag tag={customFeeds.cleanHashtag(hashtag.alias || hashtag.name)} />
          </CardActions>}
      </Card>
      {hashtag.id > 0 && <Inbounds tag={hashtag} />}
    </>
  );
};

const mapStateToProps = (state) => {
  const {
    hashtags,
    error,
    isFetching,
  } = state.hashtags;

  const {
    total,
  } = state.inbounds;

  const inboundsCount = total;

  const { viewer, isAuthenticated } = state.session;

  return {
    hashtags,
    inboundsCount,
    error,
    isFetching,
    viewer,
    isAuthenticated,
  };
};

HashtagsRead.propTypes = {
  readHashtag: PropTypes.func.isRequired,
  hashtags: HashtagsType.isRequired,
  inboundsCount: PropTypes.number.isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    readHashtag: (alias) => {
      return dispatch(actions.hashtags.read(alias));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HashtagsRead);
