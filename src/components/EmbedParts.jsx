import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import ActorAvatar from './ActorAvatar';
import ActorHandle from './ActorHandle';
import SmartLink from './SmartLink';
import plainText from '../utils/plainText';
import utils from '../utils';
import i18n from '../languages';

const {
  getAuthor,
  getActorName,
  getURL,
  getCoverURL,
} = utils.node;

// The parts an embed in a post's text is drawn with (PostEmbed): the plain
// link it falls back to, who somebody is, small, the caption under a
// picture, and the card that frames words or a profile.

// How much of an embedded post's words are shown. The rest is a click away.
const EXCERPT = 280;

// Cut at a word, with an ellipsis, where it is longer.
const excerptOf = (text = '', most = EXCERPT) => {
  const plain = plainText(text).replace(/\s+/g, ' ').trim();
  if (plain.length <= most) {
    return plain;
  }
  const cut = plain.slice(0, most);
  const space = cut.lastIndexOf(' ');
  return `${(space > most / 2 ? cut.slice(0, space) : cut).trim()}…`;
};

// The space an embed takes in the text: a paragraph's, so it reads as part
// of what is written around it rather than as something set beside it.
const SPACE = { my: 2 };

// The lines a text is cut to, with an ellipsis.
const clamp = (lines) => {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };
};

// The address as a link, for whatever cannot be shown: a page with no card,
// a post the reader may not see or that is gone.
const PlainLink = ({ url }) => {
  return (
    <Box component="p" sx={SPACE}>
      <SmartLink href={url} sx={{ wordWrap: 'break-word' }}>
        {url}
      </SmartLink>
    </Box>
  );
};

PlainLink.propTypes = {
  url: PropTypes.string.isRequired,
};

// Who someone is, small: a tiny avatar, their name black, their handle
// grey. In a line of its own, under a caption, as a byline: a block of its
// own, and the name not bold. `&&&` because the text around it colours
// every link as one, in the editor by a rule of two classes and a tag.
const Who = ({ actor, size = 24, byline = false }) => {
  const component = byline ? 'div' : 'span';
  return (
    <Box
      component={component}
      sx={{
        display: byline ? 'flex' : 'inline-flex',
        alignItems: 'center',
        columnGap: 1,
        flexWrap: 'wrap',
        ...(byline ? { mt: 0.5 } : { minWidth: 0 }),
      }}
    >
      <Box
        component={component}
        sx={{
          display: 'flex',
          '& .MuiAvatar-root': {
            width: size, height: size, fontSize: size / 2,
          },
        }}
      >
        <ActorAvatar actor={actor} linked={Boolean(actor.id)} size="small" />
      </Box>
      <Typography
        variant="body2"
        component="span"
        dir="auto"
        sx={byline ? undefined : { fontWeight: 500 }}
      >
        <Link
          component={RouterLink}
          to={getURL(actor)}
          underline="hover"
          sx={{ '&&&': { color: 'text.primary' } }}
        >
          {getActorName(actor)}
        </Link>
      </Typography>
      <ActorHandle actor={actor} />
    </Box>
  );
};

Who.propTypes = {
  actor: PropTypes.object.isRequired,
  size: PropTypes.number,
  byline: PropTypes.bool,
};

// What goes under an embedded photo or video, as a caption: its title, a
// link to the post; what it says of itself, in grey, three lines of it at
// most, the rest on the post; and who it is by: a tiny avatar, their name
// black and their handle grey (the user, 2026-10-16).
const Caption = ({ post }) => {
  const author = getAuthor(post);
  const said = plainText(post.content || '').replace(/\s+/g, ' ').trim();
  return (
    <Box sx={{ mt: 1 }}>
      {post.title &&
        <Typography variant="body2" component="div" dir="auto" sx={{ fontWeight: 500 }}>
          <Link
            component={RouterLink}
            to={getURL(post)}
            underline="hover"
            sx={{ '&&&': { color: 'text.primary' } }}
          >
            {post.title}
          </Link>
        </Typography>}
      {said &&
        <Typography variant="body2" color="textSecondary" dir="auto" sx={clamp(3)}>
          {said}
        </Typography>}
      <Who actor={author} size={20} byline />
    </Box>
  );
};

Caption.propTypes = {
  post: PropTypes.object.isRequired,
};

// Framed as a page's card is, a light border and slightly rounded corners
// (the user, 2026-10-16), with a cover across its top where there is one:
// an embedded post of words, or a profile.
const Framed = ({ cover = '', children }) => {
  return (
    <Box
      sx={{
        ...SPACE,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {cover &&
        <Box
          component="img"
          src={cover}
          alt=""
          loading="lazy"
          sx={{
            width: '100%',
            aspectRatio: '3 / 1',
            objectFit: 'cover',
            display: 'block',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        />}
      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

Framed.propTypes = {
  cover: PropTypes.string,
  children: PropTypes.node,
};

// An embedded post that is words, a note, an article or a topic, framed.
// Who wrote it, and the group it was posted in; an article's cover; its
// title, a link; its opening; and Read more.
const Words = ({ post }) => {
  const text = excerptOf(post.content);
  const author = getAuthor(post);
  const { owner } = post;
  const elsewhere = owner && owner.id && owner.id !== author.id;
  const url = getURL(post);
  return (
    <Framed cover={getCoverURL(post, 'medium')}>
      <Box
        sx={{
          display: 'flex', alignItems: 'center', columnGap: 1, rowGap: 0.5, flexWrap: 'wrap', mb: 1,
        }}
      >
        <Who actor={author} />
        {elsewhere &&
          <>
            <Typography variant="body2" color="textSecondary" component="span">
              {i18n.t('media:embed.in')}
            </Typography>
            <Who actor={owner} size={20} />
          </>}
      </Box>
      {post.title &&
        <Typography variant="subtitle1" component="div" dir="auto" sx={{ fontWeight: 600 }}>
          <Link component={RouterLink} to={url} underline="hover">
            {post.title}
          </Link>
        </Typography>}
      {text &&
        <Typography variant="body2" component="div" dir="auto" sx={{ mt: 0.5 }}>
          {text}
        </Typography>}
      <Typography variant="body2" component="div" sx={{ mt: 1 }}>
        {/* Within Anahita: in the same tab (the user, 2026-10-16). */}
        <Link component={RouterLink} to={url} underline="hover">
          {i18n.t('media:embed.readMore')}
        </Link>
      </Typography>
    </Framed>
  );
};

Words.propTypes = {
  post: PropTypes.object.isRequired,
};

export {
  SPACE,
  Caption,
  Framed,
  PlainLink,
  Who,
  Words,
  clamp,
  excerptOf,
};
