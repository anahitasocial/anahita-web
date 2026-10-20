import utils from '../../../utils';
import i18n from '../../../languages';

const {
  getURL,
  isActor,
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

  return target.name || target.title || excerpt(target.content || target.body) || `#${target.id}`;
};

// The text of what was reported, when it has any beyond its title.
const body = (item) => {
  const { target } = item;

  if (!target || !target.content || isActor(target)) {
    return '';
  }
  // A note has no title, so its opening is the title already.
  if (!target.name && !target.title) {
    return '';
  }

  return excerpt(target.content);
};

// Where to go to look at it, or '' when there is nowhere: it is gone.
const url = (item) => {
  const { target } = item;

  if (!target) {
    return '';
  }

  return getURL(target);
};

// What a reason given is called. "Breaks a rule" is not on the
// installation's list, so the server has no words for it (roadmap row 102,
// part 6).
const reasonLabel = (given) => {
  return given.key === 'rule' ? i18n.t('abuseReports:dialog.rule') : given.label;
};

// One report's reason: with a rule, which, and whose.
const reasonOf = (report) => {
  if (report.reasonKey !== 'rule') {
    return report.reasonLabel;
  }
  if (report.ruleProfileId) {
    return i18n.t('abuseReports:case.profileRule', {
      name: (report.ruleProfile && report.ruleProfile.name) || `#${report.ruleProfileId}`,
      rule: report.rule,
    });
  }
  return i18n.t('abuseReports:case.siteRule', { rule: report.rule });
};

export default {
  kind,
  title,
  body,
  url,
  reasonLabel,
  reasonOf,
};
