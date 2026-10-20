// A list of more than three is numbered, so that an item can be pointed to
// by its number ("that breaks rule 4"); three or fewer read at a glance
// (the user, 2026-10-19).
export const NUMBERED_FROM = 4;

export const isNumbered = (items) => {
  return Boolean(items) && items.length >= NUMBERED_FROM;
};

// The props for a Box or a Stack that holds the list: an <ol> with its
// numbers, or a <ul> with no marks at all.
export const listProps = (items) => {
  return isNumbered(items) ?
    { component: 'ol', sx: { m: 0, pl: 3 } } :
    { component: 'ul', sx: { m: 0, pl: 0, listStyle: 'none' } };
};
