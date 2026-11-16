// Content warnings (anahita-services row 122): what a post holds, said by
// its author, so that a reader sees the warning first and chooses to view
// it.
export default {
  // In the composer, the reply form and a post's menu.
  label: 'Content warning',
  none: 'None',
  title: 'Content warning',
  help: 'People will see your content blurred, and behind a warning.',
  kinds: {
    adult: 'Adult content',
    suggestive: 'Sexually suggestive',
    graphic: 'Graphic media',
    nudity: 'Non-sexual nudity',
    other: 'Other',
    ai: 'Made with AI',
  },
  lines: {
    adult: 'Explicit sexual images',
    suggestive: 'Sexual, without nudity',
    graphic: 'Violence, gore or disturbing images',
    nudity: 'Artistic nudes, for example',
    other: 'In your own words: spoilers, grief…',
    ai: 'Pictures or video made or changed by AI',
  },
  words: 'What it holds',
  wordsNeeded: 'Say what the post holds.',
  remove: 'Remove content warning',
  // On a post that has one.
  view: 'View',
  byModerator: 'The administrators gave this post its warning, so it cannot be changed here.',
  // In the dialog, for an administrator giving one as the site's.
  moderatorHelp: 'Given by the administrators: its author is told, and cannot take it off.',
  // A file chosen in the composer says it was made with AI.
  aiFound: 'This file says it was made with AI, so the post is marked Made with AI.',
  saved: 'Content warning saved.',
  notSaved: 'The content warning could not be saved.',
  // A post the reader chose to hide, as one line in a list.
  hidden: 'Hidden: {{ warning }}',
  // What each reader chooses, in their settings (row 122, phase 2).
  choices: {
    title: 'Content warnings',
    help: 'What you see of a post with a warning',
    show: 'Show',
    warn: 'Warn',
    hide: 'Hide',
    // Other's line, for a reader: the kinds' own lines say the rest.
    otherLine: 'In their author\'s words: spoilers, grief…',
  },
};
