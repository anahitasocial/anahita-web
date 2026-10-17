/**
 * @jest-environment node
 */
/* eslint-env jest */
import plainText from '../plainText';

describe('a post as plain words', () => {
  it('keeps the words of a link, not its address', () => {
    expect(plainText("@rastin [@julian](https://activitypub.space/user/julian) Don't forget [@rastin.example](https://bsky.brid.gy/ap/did:plc:x)"))
      .toBe("@rastin @julian Don't forget @rastin.example");
  });

  it('drops pictures, emphasis, code marks and headings', () => {
    expect(plainText('# Title\n\nSome **bold** and _quiet_ `code` ![a cat](x.png) here'))
      .toBe('Title Some bold and quiet code a cat here');
  });

  it('keeps a hashtag and an address written out', () => {
    expect(plainText('#garden at https://example.org')).toBe('#garden at https://example.org');
  });

  it('is nothing for nothing', () => {
    expect(plainText(undefined)).toBe('');
  });
});
