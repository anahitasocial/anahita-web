import React from 'react';

import ArticleIcon from '@mui/icons-material/ArticleOutlined';
import AudioIcon from '@mui/icons-material/HeadphonesOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import FollowersIcon from '@mui/icons-material/PeopleOutlined';
import GroupsIcon from '@mui/icons-material/GroupWorkOutlined';
import NoteIcon from '@mui/icons-material/NotesOutlined';
import PhotoIcon from '@mui/icons-material/PhotoLibraryOutlined';
import PostIcon from '@mui/icons-material/ViewStreamOutlined';
import ReplyIcon from '@mui/icons-material/ModeCommentOutlined';
import RepostIcon from '@mui/icons-material/Repeat';
import TaggedIcon from '@mui/icons-material/LocalOfferOutlined';
import TopicIcon from '@mui/icons-material/ForumOutlined';
import VideoIcon from '@mui/icons-material/VideoLibraryOutlined';

// The icon of each of a profile's tabs, as `getActorFeatureTabs` names them.
// A reply and a repost have the icons their buttons have under a post.
const ICONS = {
  articles: ArticleIcon,
  audio: AudioIcon,
  events: EventIcon,
  feed: PostIcon,
  groups: GroupsIcon,
  notes: NoteIcon,
  people: FollowersIcon,
  photos: PhotoIcon,
  replies: ReplyIcon,
  reposts: RepostIcon,
  tagged: TaggedIcon,
  topics: TopicIcon,
  videos: VideoIcon,
};

// A tab with no icon of its own has none, and is the rest of the row's size.
const tabIcon = (tab) => {
  const Icon = ICONS[tab];
  return Icon ? <Icon fontSize="small" /> : undefined;
};

export default tabIcon;
