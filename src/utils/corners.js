// The most a corner is rounded, in pixels: as far as CORNER_RADIUS goes
// (roadmap row 168).
export const MAX_CORNER = 24;

// A corner a few times rounder than the theme's, for a card that floats
// over the page (the cookie notice, the colour picker), for `sx`. Kept to
// MAX_CORNER: drawn at Material UI's 4 pixels, three times was 12, but at 16
// it would have been 48, and the card a blob.
const rounder = (times) => {
  return (theme) => {
    return `${Math.min(theme.shape.borderRadius * times, MAX_CORNER)}px`;
  };
};

export default rounder;
