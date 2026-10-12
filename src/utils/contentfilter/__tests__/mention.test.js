/* eslint-env jest */
import mention from '../mention';

const origin = window.location.origin.toString();
const link = (name) => {
  return `[@${name}](${origin}/people/${name.toLowerCase()}/)`;
};

describe('the mention filter', () => {
  it('links somebody here', () => {
    expect(mention('@ana hello')).toBe(`${link('ana')} hello`);
    expect(mention('hello @Ana, and @bob-b.')).toBe(`hello ${link('Ana')}, and ${link('bob-b')}.`);
    expect(mention('one\n@ana')).toBe(`one\n${link('ana')}`);
  });

  it('leaves somebody on another server as written', () => {
    expect(mention('cc @alice@mastodon.social.')).toBe('cc @alice@mastodon.social.');
    expect(mention('@alice@mastodon.social and @ana')).toBe(`@alice@mastodon.social and ${link('ana')}`);
  });

  it('names nobody in an email address or a link', () => {
    expect(mention('write to ana@example.org')).toBe('write to ana@example.org');
    expect(mention('[her page](https://mastodon.social/@alice)')).toBe('[her page](https://mastodon.social/@alice)');
  });
});
