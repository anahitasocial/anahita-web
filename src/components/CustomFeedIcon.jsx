import React from 'react';
import PropTypes from 'prop-types';

import ArticleIcon from '@mui/icons-material/ArticleOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import FeedIcon from '@mui/icons-material/DynamicFeedOutlined';
import GroupIcon from '@mui/icons-material/GroupWorkOutlined';
import HashtagIcon from '@mui/icons-material/TagOutlined';
import HeartIcon from '@mui/icons-material/FavoriteBorder';
import KeywordIcon from '@mui/icons-material/SearchOutlined';
import LanguageIcon from '@mui/icons-material/TranslateOutlined';
import NewsIcon from '@mui/icons-material/NewspaperOutlined';
import NoteIcon from '@mui/icons-material/NotesOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import PhotoIcon from '@mui/icons-material/PhotoOutlined';
import PlaceIcon from '@mui/icons-material/PlaceOutlined';
import StarIcon from '@mui/icons-material/StarBorder';
import TopicIcon from '@mui/icons-material/ForumOutlined';
import WorldIcon from '@mui/icons-material/PublicOutlined';

// The pictures a custom feed can have, by the names the server keeps. They
// follow what a feed can be made of: kinds of profile and of post, a
// hashtag, a place, a keyword, a language, and a few for a feed that is none
// of those in particular. The list is the server's (`feeds.Icons`); a name
// this does not know is drawn as the default.
const ICONS = {
  feed: FeedIcon,
  people: PeopleIcon,
  group: GroupIcon,
  event: EventIcon,
  note: NoteIcon,
  article: ArticleIcon,
  topic: TopicIcon,
  photo: PhotoIcon,
  hashtag: HashtagIcon,
  place: PlaceIcon,
  keyword: KeywordIcon,
  language: LanguageIcon,
  star: StarIcon,
  heart: HeartIcon,
  news: NewsIcon,
  world: WorldIcon,
};

const CustomFeedIcon = ({ name = 'feed', ...other }) => {
  const Icon = ICONS[name] || FeedIcon;

  return <Icon {...other} />;
};

CustomFeedIcon.propTypes = {
  name: PropTypes.string,
};

export const FEED_ICONS = Object.keys(ICONS);

export default CustomFeedIcon;
