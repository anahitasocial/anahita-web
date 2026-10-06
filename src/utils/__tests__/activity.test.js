import activity from '../activity';

describe('activity', () => {
  const post = {
    likesCount: 9,
    repostCount: 0,
    quoteCount: 2,
    commentCount: 4,
  };

  it('reads the number on each tab from the post', () => {
    expect(activity.counts(post)).toEqual({
      likes: 9, reposts: 0, quotes: 2, replies: 4,
    });
    expect(activity.total(post)).toBe(15);
    expect(activity.total({})).toBe(0);
    expect(activity.total(undefined)).toBe(0);
  });

  it('opens on the tab asked for, or the first with something in it', () => {
    expect(activity.startOn(post, 'quotes')).toBe('quotes');
    expect(activity.startOn(post, 'reposts')).toBe('likes');
    expect(activity.startOn({ commentCount: 1 }, 'likes')).toBe('replies');
    expect(activity.startOn({}, 'quotes')).toBe('likes');
  });

  it('lists people, leaving out what is not one', () => {
    expect(activity.peopleRows([{ id: 1 }, null, {}, { id: 2 }]).map((row) => {
      return row.actor.id;
    })).toEqual([1, 2]);
    expect(activity.peopleRows(undefined)).toEqual([]);
  });

  it('lists quotes and replies by who said them, not the removed or hidden', () => {
    const rows = activity.noteRows([
      { id: 10, author: { id: 1 }, body: '  hello\n\nthere  ' },
      { id: 11, author: { id: 2 }, body: 'gone', deleted: true },
      { id: 12, author: { id: 3 }, body: 'hidden', hidden: true },
      { id: 13, body: 'nobody' },
      { id: 14, author: { id: 4 }, body: 'x'.repeat(300) },
    ]);

    expect(rows.map((row) => {
      return row.note.id;
    })).toEqual([10, 14]);
    expect(rows[0].excerpt).toBe('hello there');
    expect(rows[1].excerpt.length).toBe(141);
  });
});
