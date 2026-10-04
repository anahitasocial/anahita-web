/* eslint-env jest */
import report from '../report';

const ada = { id: 1, personType: 'registered' };
const guest = { id: 0, personType: 'guest' };

const person = (id) => {
  return { id, type: 'node.actor.person-service.person.v1' };
};

const note = (authorId) => {
  return {
    id: 100,
    type: 'node.medium.text-service.note.v1',
    author: { id: authorId },
  };
};

describe('who is offered Report', () => {
  it('offers it on somebody else and on what somebody else wrote', () => {
    expect(report.canAdd(ada, person(2))).toBe(true);
    expect(report.canAdd(ada, note(2))).toBe(true);
  });

  it('does not offer it on yourself or what you wrote', () => {
    expect(report.canAdd(ada, person(1))).toBe(false);
    expect(report.canAdd(ada, note(1))).toBe(false);
  });

  it('offers it on things nobody answers for', () => {
    const hashtag = { id: 30, type: 'node.tag.hashtag-service.hashtag.v1' };
    expect(report.canAdd(ada, hashtag)).toBe(true);
  });

  it('does not offer it to somebody signed out', () => {
    expect(report.canAdd(guest, note(2))).toBe(false);
    expect(report.canAdd(undefined, note(2))).toBe(false);
  });

  it('does not offer it on nothing', () => {
    expect(report.canAdd(ada, null)).toBe(false);
    expect(report.canAdd(ada, {})).toBe(false);
  });
});
