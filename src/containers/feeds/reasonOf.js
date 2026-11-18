import i18n from '../../languages';

// Why the server refused something done with a custom feed, as the word it
// sends (`error`), or '' when it sends none.
const reasonOf = (response) => {
  const data = (response && response.response && response.response.data) || {};
  return data.error || '';
};

// Whether the form has words of its own for that reason, under
// `customFeeds:form.errors`.
export const isExplained = (reason) => {
  return i18n.exists(`customFeeds:form.errors.${reason}`);
};

export default reasonOf;
