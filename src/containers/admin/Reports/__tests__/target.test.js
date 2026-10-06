/* eslint-env jest */
import target from '../target';

const note = {
  id: 100,
  type: 'node.medium.text-service.note.v1',
  body: 'First line.\n\nSecond   line.',
};

describe('describing what was reported', () => {
  it('names a person by name and links to the profile', () => {
    const item = {
      targetType: 'node.actor.person-service.person.v1',
      target: {
        id: 2, type: 'node.actor.person-service.person.v1', name: 'Grace', alias: 'grace', body: 'A bio.',
      },
    };

    expect(target.title(item)).toBe('Grace');
    expect(target.url(item)).toBe('/people/grace/');
    // A profile's bio is not what was reported.
    expect(target.body(item)).toBe('');
  });

  it('describes an untitled post by the start of its text', () => {
    const item = { targetType: note.type, target: note };

    expect(target.title(item)).toBe('First line. Second line.');
    expect(target.url(item)).toBe('/notes/100/');
  });

  it('cuts long text short', () => {
    const item = { targetType: note.type, target: { ...note, body: 'word '.repeat(100) } };

    expect(target.title(item).length).toBeLessThanOrEqual(201);
    expect(target.title(item).endsWith('…')).toBe(true);
  });


  it('says so when the thing is gone, and links nowhere', () => {
    const item = { targetType: note.type, target: undefined };

    expect(target.title(item)).toBeTruthy();
    expect(target.url(item)).toBe('');
    expect(target.body(item)).toBe('');
  });
});
