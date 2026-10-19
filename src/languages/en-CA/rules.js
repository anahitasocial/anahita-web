// A group's and an event's rules (roadmap row 102, part 5).
export default {
  editor: {
    intro: 'People tick each rule before they follow or answer. When you change them, everybody who agreed is asked again.',
    title: 'Rule',
    body: 'A line more (optional)',
    up: 'Move up',
    down: 'Move down',
    remove: 'Remove',
    add: 'Add a rule',
    full: '{{max}} rules at most',
    suggestions: 'Suggestions',
    siteRules: "The site's rules apply here too.",
    siteRulesLink: 'Read them',
  },
  // Before joining a group or an event with rules.
  join: {
    title: "{{name}}'s rules",
    intro: 'Tick each one to agree to it before you join.',
    introChanged: 'The rules have changed since you agreed. Tick each one again.',
    introPost: 'Tick each one to agree to it before you post.',
    agree: 'I agree',
  },
  prompts: {
    notAgreed: 'Your agreement could not be recorded. Please try again.',
    saved: 'Rules saved. Everybody who agreed will be asked again.',
    notSaved: 'The rules could not be saved.',
  },
  about: {
    title: 'Rules',
  },
};
