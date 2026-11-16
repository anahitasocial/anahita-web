import contentChoices from '../contentChoices';

describe('contentChoices.of', () => {
  it('is Warn for a kind not chosen, and for what is not a choice', () => {
    expect(contentChoices.of({}, 'graphic')).toBe('warn');
    expect(contentChoices.of(null, 'graphic')).toBe('warn');
    expect(contentChoices.of({ graphic: 'blur' }, 'graphic')).toBe('warn');
  });

  it('is the reader\'s own choice', () => {
    expect(contentChoices.of({ graphic: 'hide' }, 'graphic')).toBe('hide');
    expect(contentChoices.of({ nudity: 'show' }, 'nudity')).toBe('show');
  });
});

describe('contentChoices.coverOf', () => {
  it('shows a post with no warning as any other', () => {
    expect(contentChoices.coverOf({ graphic: 'hide' }, '')).toEqual({ hidden: false, collapsed: false });
  });

  it('puts a post behind its warning at Warn', () => {
    expect(contentChoices.coverOf({}, 'adult')).toEqual({ hidden: true, collapsed: false });
  });

  it('shows a post of a kind the reader chose to see', () => {
    expect(contentChoices.coverOf({ adult: 'show' }, 'adult')).toEqual({ hidden: false, collapsed: false });
  });

  it('makes a post of a kind the reader chose to hide one line, until it is opened', () => {
    expect(contentChoices.coverOf({ graphic: 'hide' }, 'graphic')).toEqual({ hidden: true, collapsed: true });
    expect(contentChoices.coverOf({ graphic: 'hide' }, 'graphic', true)).toEqual({ hidden: false, collapsed: false });
  });
});
