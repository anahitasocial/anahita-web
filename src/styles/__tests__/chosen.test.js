/* eslint-env jest */
import styles from '..';
import palettes from '../palettes';

// A theme with colours of its own, as banu.io's is.
jest.mock('../../assets', () => {
  return {
    styles: {
      global: () => {
        return { palette: { primary: { main: '#0F5257' }, secondary: { main: '#B87333' } } };
      },
    },
  };
});

const bauhaus = palettes.find((palette) => { return palette.id === 'bauhaus-blue-yellow'; });

describe('a palette chosen', () => {
  it('goes over the theme\'s colours, in light mode and dark', () => {
    expect(styles(false, bauhaus).palette.primary.main).toBe(bauhaus.light.primary);
    expect(styles(false, bauhaus).palette.secondary.main).toBe(bauhaus.light.secondary);
    expect(styles(true, bauhaus).palette.primary.main).toBe(bauhaus.dark.primary);
  });

  it('leaves the theme\'s own when there is none', () => {
    expect(styles(false, undefined).palette.primary.main).toBe('#0F5257');
    expect(styles(false, undefined).palette.secondary.main).toBe('#B87333');
  });
});
