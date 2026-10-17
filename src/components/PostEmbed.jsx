import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import LinkIcon from '@mui/icons-material/Link';
import OutboundIcon from '@mui/icons-material/OpenInNew';
import slugify from 'slugify';

import ActorAvatar from './ActorAvatar';
import ActorHandle from './ActorHandle';
import LinkPreviewCard from './LinkPreviewCard';
import PhotoSlides from './PhotoSlides';
import SmartLink from './SmartLink';
import VideoPlayer from './VideoPlayer';
import api from '../api';
import embeds from '../utils/embeds';
import linkPreviews from '../utils/linkPreviews';
import plainText from '../utils/plainText';
import utils from '../utils';
import i18n from '../languages';

const {
  getAuthor,
  getActorName,
  getURL,
  getCoverURL,
} = utils.node;

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

// The lines a text is cut to, with an ellipsis.
const clamp = (lines) => {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };
};

// What goes under an embedded photo or video, as a caption: its title, a
// link to the post; what it says of itself, in grey, three lines of it at
// most, the rest on the post; and who it is by: a tiny avatar, their name
// black and their handle grey (the user, 2026-10-16). `&&&` because the
// text around it colours every link as one, in the editor by a rule of two
// classes and a tag.
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
      <Byline author={author} />
    </Box>
  );
};

Caption.propTypes = {
  post: PropTypes.object.isRequired,
};

// Who it is by: a tiny avatar, their name black and their handle grey.
const Byline = ({ author }) => {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', columnGap: 1, flexWrap: 'wrap', mt: 0.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          '& .MuiAvatar-root': {
            width: 20, height: 20, fontSize: 10,
          },
        }}
      >
        <ActorAvatar actor={author} linked={Boolean(author.id)} size="small" />
      </Box>
      <Typography variant="body2" component="span" dir="auto">
        <Link
          component={RouterLink}
          to={getURL(author)}
          underline="hover"
          sx={{ '&&&': { color: 'text.primary' } }}
        >
          {getActorName(author)}
        </Link>
      </Typography>
      <ActorHandle actor={author} />
    </Box>
  );
};

Byline.propTypes = {
  author: PropTypes.object.isRequired,
};

// Who someone is, small: a tiny avatar, their name black, their handle grey.
const Who = ({ actor, size = 24 }) => {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', columnGap: 1, flexWrap: 'wrap', minWidth: 0,
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'flex',
          '& .MuiAvatar-root': {
            width: size, height: size, fontSize: size / 2,
          },
        }}
      >
        <ActorAvatar actor={actor} linked={Boolean(actor.id)} size="small" />
      </Box>
      <Typography variant="body2" component="span" dir="auto" sx={{ fontWeight: 500 }}>
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
};

// An embedded post that is words, a note, an article or a topic: framed
// as a page's card is, a light border and slightly rounded corners (the
// user, 2026-10-16). Who wrote it, and the group it was posted in; an
// article's cover; its title, a link; its opening; and Read more, which
// opens it in a tab of its own so the article being read stays open.
const Words = ({ post }) => {
  const cover = getCoverURL(post, 'medium');
  const text = excerptOf(post.content);
  const author = getAuthor(post);
  const { owner } = post;
  const elsewhere = owner && owner.id && owner.id !== author.id;
  const url = getURL(post);
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
      </Box>
    </Box>
  );
};

Words.propTypes = {
  post: PropTypes.object.isRequired,
};

// A post of this installation, read as the reader: one they may not see,
// or that is gone, is the link and nothing else.
// Each post read once, for its block and its line in the citations alike.
// A post that could not be read is asked again the next time.
const reads = new Map();
const readPost = (at) => {
  const key = `${at.namespace}/${at.id}`;
  if (!reads.has(key)) {
    const reading = api[at.namespace].read(at.id).then((result) => {
      return result.data;
    }).catch((error) => {
      reads.delete(key);
      throw error;
    });
    reads.set(key, reading);
  }
  return reads.get(key);
};

// Each profile read once, by its alias: which kind it is, then itself.
const profiles = new Map();
const readProfile = (alias) => {
  if (!profiles.has(alias)) {
    const reading = api.handles.read(alias).then((result) => {
      const { kind, id } = result.data;
      return api[kind].read(id);
    }).then((result) => {
      return result.data;
    }).catch((error) => {
      profiles.delete(alias);
      throw error;
    });
    profiles.set(alias, reading);
  }
  return profiles.get(alias);
};

const useProfile = (alias) => {
  const [actor, setActor] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!alias) {
      return undefined;
    }
    let current = true;
    setActor(null);
    setFailed(false);
    readProfile(alias).then((read) => {
      if (current) {
        setActor(read);
      }
    }).catch(() => {
      if (current) {
        setFailed(true);
      }
    });
    return () => {
      current = false;
    };
  }, [alias]);
  return { actor, failed };
};

// A profile here, a person, a group or an event, framed as a page's card
// is: its cover, who it is, a few lines of what it says of itself, and a
// way to it (the user, 2026-10-16).
const Profile = ({ url, alias }) => {
  const { actor, failed } = useProfile(alias);

  if (failed) {
    return <PlainLink url={url} />;
  }
  if (!actor) {
    return <Skeleton variant="rounded" height={120} sx={SPACE} />;
  }

  const cover = getCoverURL(actor, 'medium');
  const about = excerptOf(actor.body || '', 200);
  const to = getURL(actor);
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
        <Who actor={actor} size={40} />
        {about &&
          <Typography variant="body2" component="div" dir="auto" sx={{ mt: 1, ...clamp(3) }}>
            {about}
          </Typography>}
        <Typography variant="body2" component="div" sx={{ mt: 1 }}>
          <Link component={RouterLink} to={to} underline="hover">
            {i18n.t('media:embed.viewProfile')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

Profile.propTypes = {
  url: PropTypes.string.isRequired,
  alias: PropTypes.string.isRequired,
};

const usePost = (at) => {
  const [post, setPost] = useState(null);
  const [failed, setFailed] = useState(false);
  const namespace = at ? at.namespace : '';
  const id = at ? at.id : 0;

  useEffect(() => {
    if (!namespace || !id) {
      return undefined;
    }
    let current = true;
    setPost(null);
    setFailed(false);
    readPost({ namespace, id }).then((read) => {
      if (current) {
        setPost(read);
      }
    }).catch(() => {
      if (current) {
        setFailed(true);
      }
    });
    return () => {
      current = false;
    };
  }, [namespace, id]);

  return { post, failed };
};

const Post = ({ url, at }) => {
  const { post, failed } = usePost(at);

  if (failed) {
    return <PlainLink url={url} />;
  }

  // Room kept while it is read, so the text under it moves as little as it
  // can when it comes.
  if (!post) {
    return <Skeleton variant="rounded" height={120} sx={SPACE} />;
  }

  if (at.kind === 'photo') {
    return (
      <Box sx={SPACE}>
        <PhotoSlides medium={post} size="large" natural />
        <Caption post={post} />
      </Box>
    );
  }

  if (at.kind === 'video' && post.video) {
    return (
      <Box sx={SPACE}>
        <VideoPlayer video={post.video} title={post.title} />
        <Caption post={post} />
      </Box>
    );
  }

  return <Words post={post} />;
};

Post.propTypes = {
  url: PropTypes.string.isRequired,
  at: PropTypes.shape({
    namespace: PropTypes.string,
    kind: PropTypes.string,
    id: PropTypes.number,
  }).isRequired,
};

// What an address on a line of its own in an article or a topic shows: a
// post of this installation as itself, a page elsewhere by the card kept
// with the post when it was saved (`cards`). See utils/embeds.
const PostEmbed = ({
  url,
  cards = [],
}) => {
  if (embeds.isOurs(url)) {
    const at = embeds.postAt(url);
    if (at) {
      return <Post url={url} at={at} />;
    }
    const profile = embeds.profileAt(url);
    if (profile) {
      return <Profile url={url} alias={profile.alias} />;
    }
    return <PlainLink url={url} />;
  }

  const card = (cards || []).find((each) => {
    return embeds.samePage(each.url, url);
  });
  if (!card) {
    return <PlainLink url={url} />;
  }

  // The card's own top margin, and one below to match.
  return (
    <Box sx={{ mb: 2 }}>
      <LinkPreviewCard preview={card} />
    </Box>
  );
};

PostEmbed.propTypes = {
  url: PropTypes.string.isRequired,
  cards: PropTypes.arrayOf(PropTypes.object),
};

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
  let site = card ? linkPreviews.siteOf(card) : '';
  if (!site) {
    try {
      site = new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
      site = '';
    }
  }
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
      secondary={site}
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

export {
  Citations,
  PostRow,
  usePost,
};
export default PostEmbed;
