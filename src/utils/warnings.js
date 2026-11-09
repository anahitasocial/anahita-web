import React from 'react';

import AdultIcon from '@mui/icons-material/NoAdultContentOutlined';
import SuggestiveIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import GraphicIcon from '@mui/icons-material/HeartBrokenOutlined';
import NudityIcon from '@mui/icons-material/AccessibilityNewOutlined';
import OtherIcon from '@mui/icons-material/InfoOutlined';
import WarningIcon from '@mui/icons-material/ReportGmailerrorredOutlined';

import photoFiles from './photoFiles';
import videoElsewhere from './videoElsewhere';

// A post's content warning (anahita-services row 122): its kind, and for
// Other the author's words. The server sends it as `warning: { kind, text,
// byModerator }`, or none; it takes `warning` and `warning_text`.

const KINDS = ['adult', 'suggestive', 'graphic', 'nudity', 'other'];
const OTHER = 'other';
const TEXT_MAX = 100;

// No warning.
const NONE = { kind: '', text: '' };

const ICONS = {
  adult: AdultIcon,
  suggestive: SuggestiveIcon,
  graphic: GraphicIcon,
  nudity: NudityIcon,
  other: OtherIcon,
};

// The icon of a kind, or of a warning in general.
const iconOf = (kind, props = {}) => {
  // Made without JSX: this is a .js file, which Vite reads as plain
  // JavaScript.
  return React.createElement(ICONS[kind] || WarningIcon, props);
};

// What a post's warning is, from the post; NONE when it has none.
const of = (post) => {
  const warning = post && post.warning;
  if (!warning || !KINDS.includes(warning.kind)) {
    return NONE;
  }
  return {
    kind: warning.kind,
    text: warning.text || '',
    byModerator: Boolean(warning.byModerator),
  };
};

const has = (warning) => {
  return Boolean(warning && warning.kind);
};

// Whether a warning can be sent: none, a kind, or Other with words.
const isComplete = (warning) => {
  if (!has(warning)) {
    return true;
  }
  if (warning.kind !== OTHER) {
    return true;
  }
  const text = (warning.text || '').trim();
  return text.length > 0 && Array.from(text).length <= TEXT_MAX;
};

// What it says, in the reader's language: the kind's name, or the author's
// own words for Other.
const say = (warning, t) => {
  if (!has(warning)) {
    return '';
  }
  if (warning.kind === OTHER && warning.text) {
    return warning.text;
  }
  return t(`warnings:kinds.${warning.kind}`);
};

// As a request takes it.
const toRequest = (warning) => {
  if (!has(warning)) {
    return {};
  }
  return {
    warning: warning.kind,
    ...(warning.kind === OTHER ? { warning_text: warning.text.trim() } : {}),
  };
};

// Whether a post's warning lies over its pictures alone: a post with a
// photo, a GIF, a video or a sound shows its words, and only what it shows
// besides them is behind the warning, as Bluesky and Mastodon do (the user,
// 2026-11-09). An article or a topic, whose words may hold pictures, and a
// post of words alone, are behind it whole.
const hasMedia = (post) => {
  if (!post || /\.(article|topic)\.v1$/.test(post.type || '')) {
    return false;
  }
  return Boolean(photoFiles.countOf(post) > 0 || post.video || post.audio
    || post.mediaRemoved || videoElsewhere.of(post));
};

export default {
  KINDS,
  OTHER,
  TEXT_MAX,
  NONE,
  iconOf,
  of,
  has,
  isComplete,
  say,
  toRequest,
  hasMedia,
};
