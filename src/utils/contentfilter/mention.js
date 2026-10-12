const baseURL = window.location.origin.toString();

// Somebody here, named as the server reads a name: at the start of the text
// or after a space, so the address in "write to ana@example.org" names
// nobody.
//
// A name followed by a second @ and a host, @alice@mastodon.social, is
// somebody on another server and is left as written: whoever is called
// alice here is not them. The look ahead refuses the whole name, not just
// its last letter, when that is what follows.
const regex = /(^|\s)@([\w-]+)(?![\w-]|@[A-Za-z0-9])/g;

const contentfilterMention = (text) => {
  return text.replace(regex, (match, before, name) => {
    return `${before}[@${name}](${baseURL}/people/${name.toLowerCase()}/)`;
  });
};

export default contentfilterMention;
