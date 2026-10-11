import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CopyIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import PinIcon from '@mui/icons-material/AddHomeOutlined';
import UnpinIcon from '@mui/icons-material/HomeOutlined';

import FeedCustomBrowse from '../feed/Custom';
import useFeed from './useFeed';
import { ShareButton } from '../controls/Share';
import DialogConfirm from '../../components/DialogConfirm';
import CustomFeedIcon from '../../components/CustomFeedIcon';
import Progress from '../../components/Progress';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import utils from '../../utils';
import PageColumn from '../../components/PageColumn';

const { getActorName, getURL } = utils.node;

// A custom feed's own page: what it is called, whose it is, what it shows in
// a sentence, and then the posts.
//
// Anybody who can see the feed can add it to their home page and copy it.
// Its owner can change and delete it. The posts are the reader's own view of
// it: a feed of somebody else's shows only what the reader could see anyway.
const CustomFeedRead = ({
  viewer,
  alertSuccess,
  alertError,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { feed, isMissing, reload } = useFeed(id);
  const [waiting, setWaiting] = useState(false);

  if (isMissing) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        {i18n.t('customFeeds:read.notFound')}
      </Typography>
    );
  }

  if (!feed) {
    return <Progress />;
  }

  const authorized = feed.authorized || {};
  const isOwn = Boolean(feed.owner) && feed.owner.id === viewer.id;

  const failed = (response) => {
    const data = (response.response && response.response.data) || {};
    const reason = data.error || '';

    alertError(i18n.t(i18n.exists(`customFeeds:form.errors.${reason}`) ?
      `customFeeds:form.errors.${reason}` :
      'customFeeds:prompts.failed'));
  };

  const handlePin = () => {
    setWaiting(true);
    api.customFeeds.setPinned(feed, !feed.isPinned).then(() => {
      alertSuccess(i18n.t(feed.isPinned ? 'customFeeds:prompts.unpinned' : 'customFeeds:prompts.pinned'));
      return reload();
    }).catch(failed).finally(() => {
      setWaiting(false);
    });
  };

  const handleCopy = () => {
    setWaiting(true);
    const name = i18n.t('customFeeds:copyOf', { name: feed.name }).slice(0, 100);

    api.customFeeds.copy(feed, name).then((result) => {
      alertSuccess(i18n.t('customFeeds:prompts.copied'));
      navigate(`${customFeeds.urlOf(result.data)}/edit`);
    }).catch(failed).finally(() => {
      setWaiting(false);
    });
  };

  const handleDelete = () => {
    setWaiting(true);
    api.customFeeds.remove(feed).then(() => {
      alertSuccess(i18n.t('customFeeds:prompts.deleted'));
      navigate('/feeds');
    }).catch((response) => {
      failed(response);
      setWaiting(false);
    });
  };

  return (
    <>
      <Helmet>
        <title>{feed.name}</title>
      </Helmet>
      <PageColumn>
        <Card sx={{ mb: 2 }}>
          <CardHeader
            avatar={
              <Avatar>
                <CustomFeedIcon name={feed.icon} />
              </Avatar>
              }
            title={feed.name}
            subheader={feed.owner &&
            <>
              {`${i18n.t('customFeeds:list.by', { name: '' }).trim()} `}
              <Link component={RouterLink} to={getURL(feed.owner)} underline="hover">
                {getActorName(feed.owner)}
              </Link>
              {` · ${i18n.t(`customFeeds:access.${feed.access}`)}`}
              {customFeeds.madeOn(feed, i18n.language) &&
                ` · ${i18n.t('customFeeds:made', { date: customFeeds.madeOn(feed, i18n.language) })}`}
            </>}
            action={customFeeds.isShared(feed) && <ShareButton what={customFeeds.toShare(feed)} />}
            slotProps={{ title: { variant: 'h5', component: 'h1' } }}
          />
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={2}>
              {feed.body &&
              <Typography variant="body1">
                {feed.body}
              </Typography>}
              <Typography variant="body2" color="textSecondary">
                {customFeeds.summary(feed.definition, i18n.t.bind(i18n), {
                  names: customFeeds.namesOf(feed.references),
                  isOwn,
                })}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {authorized.pin &&
                <Button
                  variant={feed.isPinned ? 'outlined' : 'contained'}
                  startIcon={feed.isPinned ? <UnpinIcon /> : <PinIcon />}
                  disabled={waiting}
                  onClick={handlePin}
                >
                  {i18n.t(feed.isPinned ? 'customFeeds:actions.unpin' : 'customFeeds:actions.pin')}
                </Button>}
                {authorized.copy &&
                <Button
                  color="inherit"
                  startIcon={<CopyIcon />}
                  disabled={waiting}
                  onClick={handleCopy}
                >
                  {i18n.t('customFeeds:actions.copy')}
                </Button>}
                {authorized.edit &&
                <Button
                  color="inherit"
                  startIcon={<EditIcon />}
                  component={RouterLink}
                  to={`${customFeeds.urlOf(feed)}/edit`}
                >
                  {i18n.t('customFeeds:actions.edit')}
                </Button>}
                {authorized.delete &&
                <DialogConfirm
                  title={i18n.t('customFeeds:delete.title')}
                  message={i18n.t('customFeeds:delete.message')}
                  confirm={i18n.t('customFeeds:delete.confirm')}
                  dismiss={i18n.t('customFeeds:delete.dismiss')}
                >
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    disabled={waiting}
                    onClick={handleDelete}
                  >
                    {i18n.t('customFeeds:actions.delete')}
                  </Button>
                </DialogConfirm>}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
        <FeedCustomBrowse feed={feed} />
      </PageColumn>
    </>
  );
};

CustomFeedRead.propTypes = {
  viewer: PropTypes.object.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomFeedRead);
