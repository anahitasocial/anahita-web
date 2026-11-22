// How round corners are, by Material UI's names for its shape tokens
// (borderRadiusSm and the others, on its Shape page), in pixels: what
// CORNER_RADIUS takes in anahita-services, and the five steps somebody may
// choose for themselves under Customize (roadmap row 168).
export const CORNER_RADII = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
};

// The most a corner is rounded, in pixels: xl.
export const MAX_CORNER = CORNER_RADII.xl;

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
