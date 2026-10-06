import React from 'react';
import PropTypes from 'prop-types';
import Link from '@mui/material/Link';

import PersonType from '../../../proptypes/Person';
import MediumType from '../../../proptypes/Medium';

import Article from './Article';
import Default from './Default';
import ReplyStats from '../../../components/ReplyStats';
import HeaderMeta from '../../../components/HeaderMeta';
import Likes from '../../likes';
import LocationsGadget from '../../locations/Gadget';
import RepliesThread from '../../replies/Thread';
import ReplyContext from '../../replies/ReplyContext';
import Cover from '../../cover';
import ControlDownload from '../../controls/medium/Download';
import MediumMenu from '../MediaMenu';
import MediumForm from '../EditForm';

import i18n from '../../../languages';
import utils from '../../../utils';

const { getPortraitURL, getCoverURL } = utils.node;

const MediaReadView = ({
  medium,
  current,
  namespace,
  viewer,
  isAuthenticated,
  isEditing,
  isFetching,
  fields,
  Like,
  Access,
  canEdit,
  handleView,
  handleEdit,
  handleCancel,
  handleOnChange,
  handleOnSubmit,
}) => {
  const portrait = getPortraitURL(medium, 'large');
  const cover = getCoverURL(medium, 'large');

  // A reply opened on its own page. It is shown as the post, with what it
  // answers above it and what was said under it below. The thread it is in
  // is the root's; a reply the viewer was not sent the root of has none to
  // show.
  const isReply = Boolean(medium.rootId);
  const replyThread = isReply && medium.root ? (
    <RepliesThread
      root={medium.root}
      under={medium}
      key={`replies-${medium.id}`}
    />
  ) : null;

  const mediumProps = {
    medium,
    handleView: portrait ? handleView : null,
    access: canEdit && medium.access && <Access medium={medium} />,
    editing: isEditing,
    cover: (
      <Cover
        node={medium}
        canEdit={canEdit}
      />
    ),
    form: (
      <MediumForm
        medium={current}
        fields={fields}
        handleOnChange={handleOnChange}
        handleOnSubmit={handleOnSubmit}
        handleCancel={handleCancel}
        isFetching={isFetching}
      />
    ),
    menu: isAuthenticated && (
      <MediumMenu
        medium={medium}
        viewer={viewer}
        handleEdit={handleEdit}
      />
    ),
    actions: [
      isAuthenticated && <Like node={medium} key={`medium-like-${medium.id}`} />,
      namespace === 'documents' && (
        <ControlDownload
          node={medium}
          key={`medium-download-${medium.id}`}
        />
      ),
    ],
    stats: (
      <>
        <Likes node={medium} />
        <ReplyStats node={medium} />
      </>
    ),
    // Every kind of post is answered with replies: notes, threaded, each
    // liked and removed like any post. What used to be comments are replies
    // now, made directly to the post. Keyed by the post, so a thread is not
    // carried from one post to the next.
    replies: medium.id && !isReply ? (
      <RepliesThread root={medium} key={`replies-${medium.id}`} />
    ) : replyThread,
    // Above a reply shown on its own: what it is a reply to.
    context: isReply && medium.root ? (
      <ReplyContext answered={medium.root} owner={medium.root.owner}>
        {medium.parentId !== medium.rootId &&
          <Link
            href={`/notes/${medium.parentId}/`}
            variant="caption"
            color="textSecondary"
          >
            {i18n.t('replies:context.answered')}
          </Link>}
      </ReplyContext>
    ) : null,
    locations: (
      <LocationsGadget
        node={medium}
        viewer={viewer}
      />
    ),
  };

  return (
    <>
      <HeaderMeta
        title={medium.name || medium.body}
        description={medium.body}
        image={portrait || cover}
      />
      {medium.type === 'node.medium.article-service.article.v1'
        ? <Article {...mediumProps} />
        : <Default {...mediumProps} />}
    </>
  );
};

MediaReadView.propTypes = {
  medium: MediumType.isRequired,
  current: PropTypes.object.isRequired,
  namespace: PropTypes.string.isRequired,
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  fields: PropTypes.object.isRequired,
  Like: PropTypes.elementType.isRequired,
  Access: PropTypes.elementType.isRequired,
  canEdit: PropTypes.bool.isRequired,
  handleView: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
};

export default MediaReadView;
