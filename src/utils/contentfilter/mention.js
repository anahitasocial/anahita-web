const baseURL = window.location.origin.toString();

// Somebody here, named as the server reads a name: at the start of the text
// or after a space, so the address in "write to ana@example.org" names
// nobody.
//
// It links to /@name/, which finds whichever kind of profile the name is,
// a person, a group, an event or a channel (containers/actors/ByHandle.jsx):
// /people/name/ led a channel's or a group's name to a person's page that
// is not there (the user, 2026-11-16).
//
// A name followed by a second @ and a host, @alice@mastodon.social, is
// somebody on another server and is left as written: whoever is called
// alice here is not them. The look ahead refuses the whole name, not just
// its last letter, when that is what follows.
const regex = /(^|\s)@([\w-]+)(?![\w-]|@[A-Za-z0-9])/g;

const contentfilterMention = (text) => {
  return text.replace(regex, (match, before, name) => {
    return `${before}[@${name}](${baseURL}/@${name.toLowerCase()}/)`;
  });
};

export default contentfilterMention;
