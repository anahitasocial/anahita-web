// The palettes the colour picker offers (components/ColourPicker.jsx), on the
// dev server only, while Anahita's colours are tried again (anahita-web's
// docs/plans/colours.md). Each is a primary and a secondary, for light mode
// and dark. Dark mode's are light mode's, lightened until they read on the
// dark page; every primary takes white text at 4.5 to 1 or more.
// The same list is in anahita.io's src/data/palettes.js.
const palettes = [
  // Bauhaus
  {
    id: 'ink-signal-red',
    group: 'Bauhaus',
    name: 'Ink + signal red',
    light: { primary: '#1F2328', secondary: '#D62828' },
    dark: { primary: '#E6E8EB', secondary: '#E57575' },
  },
  {
    id: 'bauhaus-blue-yellow',
    group: 'Bauhaus',
    name: 'Bauhaus blue + yellow',
    light: { primary: '#1E4FA0', secondary: '#E0A100' },
    dark: { primary: '#759FE5', secondary: '#E0A100' },
  },
  {
    id: 'bauhaus-red-blue',
    group: 'Bauhaus',
    name: 'Bauhaus red + blue',
    light: { primary: '#C8102E', secondary: '#1B4F9C' },
    dark: { primary: '#F4788C', secondary: '#5E93E3' },
  },
  {
    id: 'slate-vermilion',
    group: 'Bauhaus',
    name: 'Slate + vermilion',
    light: { primary: '#37474F', secondary: '#E34234' },
    dark: { primary: '#8BA2AE', secondary: '#E96C61' },
  },
  {
    id: 'graphite-yellow',
    group: 'Bauhaus',
    name: 'Graphite + yellow',
    light: { primary: '#2B2B2B', secondary: '#E8B10C' },
    dark: { primary: '#9F9F9F', secondary: '#E8B10C' },
  },
  // Mid-Century
  {
    id: 'atomic-teal-burnt-orange',
    group: 'Mid-Century',
    name: 'Atomic teal + burnt orange',
    light: { primary: '#00707A', secondary: '#D9622B' },
    dark: { primary: '#00AFBF', secondary: '#DE7545' },
  },
  {
    id: 'avocado-harvest-gold',
    group: 'Mid-Century',
    name: 'Avocado + harvest gold',
    light: { primary: '#556B1F', secondary: '#C9A227' },
    dark: { primary: '#89AC32', secondary: '#C9A227' },
  },
  {
    id: 'walnut-mustard',
    group: 'Mid-Century',
    name: 'Walnut + mustard',
    light: { primary: '#6B4226', secondary: '#D4A017' },
    dark: { primary: '#CB926C', secondary: '#D4A017' },
  },
  {
    id: 'eames-orange-charcoal',
    group: 'Mid-Century',
    name: 'Eames orange + charcoal',
    light: { primary: '#C2410C', secondary: '#37474F' },
    dark: { primary: '#F47D4D', secondary: '#7C96A3' },
  },
  {
    id: 'forest-terracotta',
    group: 'Mid-Century',
    name: 'Forest + terracotta',
    light: { primary: '#2F5D50', secondary: '#C8553D' },
    dark: { primary: '#5CAD96', secondary: '#D47A67' },
  },
  // Space Age
  {
    id: 'midnight-tangerine',
    group: 'Space Age',
    name: 'Midnight + tangerine',
    light: { primary: '#1E2A4A', secondary: '#F97316' },
    dark: { primary: '#8C9FD1', secondary: '#F97316' },
  },
  {
    id: 'ultramarine-mint',
    group: 'Space Age',
    name: 'Ultramarine + mint',
    light: { primary: '#3F3FCF', secondary: '#10B981' },
    dark: { primary: '#9797E5', secondary: '#10B981' },
  },
  {
    id: 'graphite-electric-lime',
    group: 'Space Age',
    name: 'Graphite + electric lime',
    light: { primary: '#2B2D42', secondary: '#84CC16' },
    dark: { primary: '#9A9DBD', secondary: '#84CC16' },
  },
  {
    id: 'orbit-violet-cyan',
    group: 'Space Age',
    name: 'Orbit violet + cyan',
    light: { primary: '#5B21B6', secondary: '#06B6D4' },
    dark: { primary: '#B28DEA', secondary: '#06B6D4' },
  },
  {
    id: 'nebula-magenta-teal',
    group: 'Space Age',
    name: 'Nebula magenta + teal',
    light: { primary: '#A21CAF', secondary: '#0D9488' },
    dark: { primary: '#DF76E9', secondary: '#0EA497' },
  },
  // Art Deco
  {
    id: 'gatsby-black-gold',
    group: 'Art Deco',
    name: 'Gatsby black + gold',
    light: { primary: '#1A1A1A', secondary: '#B8860B' },
    dark: { primary: '#9F9F9F', secondary: '#BD8A0B' },
  },
  {
    id: 'emerald-gold',
    group: 'Art Deco',
    name: 'Emerald + gold',
    light: { primary: '#0B5D4B', secondary: '#C5A253' },
    dark: { primary: '#15B491', secondary: '#C5A253' },
  },
  {
    id: 'sapphire-silver',
    group: 'Art Deco',
    name: 'Sapphire + silver',
    light: { primary: '#1F3A93', secondary: '#8E9196' },
    dark: { primary: '#879DE6', secondary: '#8F9297' },
  },
  {
    id: 'oxblood-champagne',
    group: 'Art Deco',
    name: 'Oxblood + champagne',
    light: { primary: '#6E1E2B', secondary: '#D8B76A' },
    dark: { primary: '#DE8593', secondary: '#D8B76A' },
  },
  {
    id: 'peacock-copper',
    group: 'Art Deco',
    name: 'Peacock + copper',
    light: { primary: '#0F5257', secondary: '#B87333' },
    dark: { primary: '#20B0BB', secondary: '#CA8240' },
  },
];

export default palettes;
