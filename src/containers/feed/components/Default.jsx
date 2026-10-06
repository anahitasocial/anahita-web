import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import ReadMore from '../../../components/ReadMore';
import ActorAvatar from '../../../components/ActorAvatar';
import NodeType from '../../../proptypes/Node';
import CardOwner from '../../../components/MediumOwnerCardHeader';
import PhotoSlides from '../../../components/PhotoSlides';
import PinnedLabel from '../../../components/PinnedLabel';
import QuoteEmbed from '../../../components/QuoteEmbed';
import Player from '../../../components/Player';
import utils from '../../../utils';
import photoFiles from '../../../utils/photoFiles';

const {
  getURL,
  getPortraitURL,
  getCoverURL,
  getPersonName,
} = utils.node;

const styles = (theme) => {
  return {
    root: {
      marginBottom: theme.spacing(2),
    },
    cover: {
      height: 0,
      paddingTop: '30%',
    },
    media: {
      height: 0,
      paddingTop: '100%',
    },
    title: {
      textTransform: 'capitalize',
      marginBottom: theme.spacing(2),
    },
    authorName: {
      fontSize: 16,
    },
    ownerName: {
      fontSize: 14,
    },
  };
};

const FeedCardDefault = ({
  classes,
  node,
  stats = null,
  actions = null,
  menu,
  showOwner = false,
  context = null,
}) => {
  const navigate = useNavigate();
  const authorName = getPersonName(node.author);
  const portrait = getPortraitURL(node, 'medium');
  const cover = getCoverURL(node, 'medium');
  const { title, body } = node;
  const url = getURL(node);
  const createdAt = moment.utc(node.createdAt).local().format('LLL').toString();
  const creationTimeFromNow = moment.utc(node.createdAt).fromNow();

  return (
    <Card
      className={classes.root}
      component="article"
    >
      <PinnedLabel show={Boolean(node.pinned)} />
      {showOwner && node.owner && <CardOwner owner={node.owner} />}
      {context}
      <CardHeader
        avatar={
          <ActorAvatar
            actor={node.author}
            linked={node.author.id > 0}
          />
        }
        title={node.author.id > 0 ? (
          <Link href={getURL(node.author)}>
            {authorName}
          </Link>
        ) : authorName}
        subheader={
          <Link
            href={url}
            title={createdAt}
          >
            {creationTimeFromNow}
          </Link>
        }
        action={menu}
      />
      {cover &&
        <Link href={url}>
          <CardMedia
            className={classes.cover}
            image={cover}
            title={title}
            src="picture"
          />
        </Link>}
      {photoFiles.hasSeveral(node) &&
        <PhotoSlides
          medium={node}
          onOpen={() => {
            navigate(url);
          }}
        />}
      {!photoFiles.hasSeveral(node) && portrait &&
        <Link href={url}>
          <CardMedia
            component="img"
            title={title}
            alt={photoFiles.altOf(node)}
            image={portrait}
          />
        </Link>}
      {body && <Player text={body} />}
      <CardContent>
        {title &&
          <Typography
            variant="h6"
            className={classes.title}
          >
            <Link href={url}>
              {title}
            </Link>
          </Typography>}
        {body &&
          <ReadMore contentFilter>
            {body}
          </ReadMore>}
        <QuoteEmbed quote={node.quote} />
      </CardContent>
      {stats &&
        <CardActions>
          {stats}
        </CardActions>}
      {actions &&
        <CardActions>
          {actions}
        </CardActions>}
    </Card>
  );
};

FeedCardDefault.propTypes = {
  // Above a reply: what it is a reply to.
  context: PropTypes.node,
  classes: PropTypes.object.isRequired,
  stats: PropTypes.node,
  actions: PropTypes.node,
  menu: PropTypes.node,
  node: NodeType.isRequired,
  showOwner: PropTypes.bool,
};

export default withStyles(FeedCardDefault, styles);
