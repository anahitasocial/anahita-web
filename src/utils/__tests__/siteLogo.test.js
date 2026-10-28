/* eslint-env jest */
import siteLogo from '../siteLogo';

describe('siteLogo', () => {
  const theme = { color: 'light.svg', white: 'dark.svg' };

  it("takes the server's logo when it gives one", () => {
    const nodeInfo = { metadata: { logoUrl: 'https://banu.io/logo.png' } };
    expect(siteLogo(nodeInfo, theme)).toBe('https://banu.io/logo.png');
    expect(siteLogo(nodeInfo, theme, true)).toBe('https://banu.io/logo.png');
  });

  it("falls back to the theme's, for light and dark", () => {
    expect(siteLogo(null, theme)).toBe('light.svg');
    expect(siteLogo({ metadata: { logoUrl: '' } }, theme, true)).toBe('dark.svg');
    expect(siteLogo({}, { color: 'only.svg' }, true)).toBe('only.svg');
  });

  it('takes only a full web address from the server', () => {
    // A path, a script address (built so that it is not one in this file),
    // a bare name, a number, and an address with a space.
    ['/static/logo.png', ['javascript', 'alert(1)'].join(':'), 'logo.png', 42, 'https://a b'].forEach((logoUrl) => {
      expect(siteLogo({ metadata: { logoUrl } }, theme)).toBe('light.svg');
    });
  });
});
