import utils from '../../../utils';
import i18n from '../../../languages';

const {
  getURL,
  getCommentURL,
  isActor,
  isComment,
} = utils.node;

// What kind of thing was reported, in words. From the case's own record of
// the type, so it still reads after the thing itself is gone.
//
// node.<family>.<service>.<entity>.v1  ->  the entity
const kind = (type = '') => {
  const entity = type.split('.')[3] || '';
  const key = `abuseReports:kinds.${entity}`;

  return i18n.exists(key) ? i18n.t(key) : i18n.t('abuseReports:kinds.other');
};

const EXCERPT_LENGTH = 200;

const excerpt = (text = '') => {
  const flat = String(text).replace(/\s+/g, ' ').trim();

  return flat.length > EXCERPT_LENGTH ?
    `${flat.slice(0, EXCERPT_LENGTH).trimEnd()}…` :
    flat;
};

// A line that says what was reported: a person's or group's name, a post's
// title, or the opening of its text.
const title = (item) => {
  const { target } = item;

  if (!target) {
    return i18n.t('abuseReports:case.targetGone');
  }

  return target.name || excerpt(target.body) || `#${target.id}`;
};

// The text of what was reported, when it has any beyond its title.
const body = (item) => {
  const { target } = item;

  if (!target || !target.body || isActor(target)) {
    return '';
  }

  return excerpt(target.body);
};

// Where to go to look at it, or '' when there is nowhere: it is gone, or
// it is a comment whose post is not known.
const url = (item) => {
  const { target } = item;

  if (!target) {
    return '';
  }

  if (isComment(target)) {
    return getCommentURL(target);
  }

  return getURL(target);
};

export default {
  kind,
  title,
  body,
  url,
};
