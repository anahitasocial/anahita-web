import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import slugify from 'slugify';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import LinkIcon from '@mui/icons-material/Link';
import OutboundIcon from '@mui/icons-material/OpenInNew';

import ActorAvatar from './ActorAvatar';
import { clamp, excerptOf } from './EmbedParts';
import { usePost, useProfile } from './useEmbedded';
import embeds from '../utils/embeds';
import linkPreviews from '../utils/linkPreviews';
import utils from '../utils';
import i18n from '../languages';

const {
  getAuthor,
  getActorName,
  getURL,
} = utils.node;

// What an article or a topic cites, at its end, and the rows the posts
// that cite a post are listed with (Read/CitedByTab).

// What a citation shows: a picture, a line saying what it is and one
// saying whose or where, and where it goes.
const CitationRow = ({
  url,
  to = '',
  avatar,
  primary,
  secondary = '',
  loading = false,
}) => {
  const outbound = !to;
  // The whole row is the link, an easy target for a finger (the user,
  // 2026-10-17): within Anahita by the app's router, elsewhere in a new
  // tab, marked, telling that site nothing of where it came from.
  const link = outbound ?
    {
      component: 'a',
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
      title: i18n.t('media:embed.opensNewTab'),
    } :
    { component: RouterLink, to };

  return (
    <ListItem disablePadding>
      <ListItemButton {...link} alignItems="flex-start" sx={{ borderRadius: 1 }}>
        <ListItemAvatar>
          {loading ? <Skeleton variant="circular" width={40} height={40} /> : avatar}
        </ListItemAvatar>
        <ListItemText
          primary={loading ? <Skeleton width="70%" /> : primary}
          secondary={loading ? <Skeleton width="40%" /> : secondary}
          slotProps={{
            primary: { dir: 'auto', sx: { ...clamp(2), overflowWrap: 'anywhere' } },
            secondary: { dir: 'auto', noWrap: true },
          }}
        />
        {outbound && !loading &&
          <OutboundIcon fontSize="small" sx={{ color: 'text.secondary', mt: 1.5, ml: 1 }} />}
      </ListItemButton>
    </ListItem>
  );
};

CitationRow.propTypes = {
  // Where it is.
  url: PropTypes.string.isRequired,
  // Its path here, for one within Anahita; none for a page elsewhere.
  to: PropTypes.string,
  avatar: PropTypes.node,
  primary: PropTypes.node,
  secondary: PropTypes.node,
  // Still being read: its place is kept, the same height.
  loading: PropTypes.bool,
};

// Who somebody is, in a word: their name and their handle.
const whoIs = (actor) => {
  const handle = utils.federation.displayHandle(actor, slugify);
  return handle ? `${getActorName(actor)} ${handle}` : getActorName(actor);
};

// The site a page elsewhere is on: as its card names it, or else its
// address's host, without "www.".
const siteOf = (card, url) => {
  const site = card ? linkPreviews.siteOf(card) : '';
  if (site) {
    return site;
  }
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
};

// One of the citations: a post here, by what it is called or opens with
// and who wrote it; a profile here, by who it is; a page elsewhere, by its
// title and its site. Read where it can be; as its address where not.
const Citation = ({ url, cards }) => {
  const at = embeds.isOurs(url) ? embeds.postAt(url) : null;
  const profileAt = embeds.isOurs(url) && !at ? embeds.profileAt(url) : null;
  const read = usePost(at);
  const who = useProfile(profileAt ? profileAt.alias : '');

  if (profileAt && !who.failed) {
    const { actor } = who;
    return (
      <CitationRow
        url={url}
        to={actor ? getURL(actor) : `/@${profileAt.alias}`}
        loading={!actor}
        avatar={actor && <ActorAvatar actor={actor} />}
        primary={actor && getActorName(actor)}
        secondary={actor && utils.federation.displayHandle(actor, slugify)}
      />
    );
  }

  if (at && !read.failed) {
    const { post } = read;
    const author = post && getAuthor(post);
    return (
      <CitationRow
        url={url}
        to={post ? getURL(post) : new URL(url).pathname}
        loading={!post}
        avatar={author && <ActorAvatar actor={author} />}
        primary={post && (post.title || excerptOf(post.content, 160) || url)}
        secondary={author && whoIs(author)}
      />
    );
  }

  const card = !at && !profileAt && (cards || []).find((each) => {
    return embeds.samePage(each.url, url);
  });
  const image = card && linkPreviews.imageOf(card);
  return (
    <CitationRow
      url={url}
      to={embeds.isOurs(url) ? new URL(url).pathname : ''}
      avatar={
        <Avatar variant="rounded" src={image || undefined} alt="">
          <LinkIcon />
        </Avatar>
      }
      primary={(card && card.title) || url}
      secondary={siteOf(card, url)}
    />
  );
};

Citation.propTypes = {
  url: PropTypes.string.isRequired,
  cards: PropTypes.arrayOf(PropTypes.object),
};

// A post here as a row: what it is called or opens with, and who wrote it.
const PostRow = ({ post }) => {
  const author = getAuthor(post);
  return (
    <CitationRow
      url={getURL(post)}
      to={getURL(post)}
      avatar={author && <ActorAvatar actor={author} />}
      primary={post.title || excerptOf(post.content, 160)}
      secondary={author && whoIs(author)}
    />
  );
};

PostRow.propTypes = {
  post: PropTypes.object.isRequired,
};

// The addresses a text cites, each once, in the order they come: every
// address on a line of its own.
const citedIn = (text = '') => {
  const addresses = [];
  String(text).split('\n').forEach((line) => {
    const address = embeds.alone(line);
    // A profile shown is named, a mention, and not a citation (the user,
    // 2026-10-17): its card is in the text, and it is not listed here.
    const isProfile = address && embeds.isOurs(address) && embeds.profileAt(address);
    if (address && !isProfile && !addresses.includes(address)) {
      addresses.push(address);
    }
  });
  return addresses;
};

// What an article or a topic cites, at its end, in the order it comes:
// every address on a line of its own, a post here or a page elsewhere (the
// user, 2026-10-16). The posts here are its citations in the graph too.
// A list of rows, each the whole of its width to tap.
const Citations = ({ text = '', cards = [] }) => {
  const addresses = citedIn(text);

  if (addresses.length === 0) {
    return null;
  }

  return (
    <Box component="section" sx={{ mt: 4 }}>
      {/* A heading of its own, with a line under it, as the end of an
          article sets its references apart (the user, 2026-10-16). */}
      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontWeight: 600,
          pb: 1,
          mb: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {i18n.t('media:embed.citations')}
      </Typography>
      {/* In the order cited, as a numbered list is to a screen reader;
          the rows show no numbers. Flush with the text above. */}
      <List component="ol" disablePadding sx={{ mx: -2 }}>
        {addresses.map((address) => {
          return <Citation key={address} url={address} cards={cards} />;
        })}
      </List>
    </Box>
  );
};

Citations.propTypes = {
  text: PropTypes.string,
  cards: PropTypes.arrayOf(PropTypes.object),
};

export { PostRow, citedIn, siteOf };
export default Citations;
