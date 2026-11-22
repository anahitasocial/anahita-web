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

// The site's own corners, in pixels, for whoever has not chosen theirs: the
// app's own to say, set when it is built (the user, 2026-11-21: a matter of
// how it looks, not of the server). REACT_APP_CORNER_RADIUS on a wider
// screen, sm unless set; REACT_APP_CORNER_RADIUS_MOBILE below 600 pixels,
// md unless set. A name it does not know is the default.
const named = (value, fallback) => {
  const name = String(value || '').trim().toLowerCase();
  return Object.hasOwn(CORNER_RADII, name) ? CORNER_RADII[name] : CORNER_RADII[fallback];
};

export const siteCorners = (narrow) => {
  return narrow ?
    named(process.env.REACT_APP_CORNER_RADIUS_MOBILE, 'md') :
    named(process.env.REACT_APP_CORNER_RADIUS, 'sm');
};

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
