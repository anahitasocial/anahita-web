/* eslint-env jest */
import utils from '../node';

// Every kind of post may be subscribed to and have who may reply set, as
// the services name them (roadmap row 96, part 4).
describe('the kinds of post', () => {
  it('knows every kind the services make', () => {
    [
      'node.medium.text-service.note.v1',
      'node.medium.text-service.article.v1',
      'node.medium.text-service.topic.v1',
      'node.medium.photo-service.photo.v1',
      'node.medium.video-service.video.v1',
    ].forEach((type) => {
      expect(utils.isSubscribable({ type })).toBe(true);
      expect(utils.isCommentable({ type })).toBe(true);
    });
  });

  it('knows a profile is not a post', () => {
    expect(utils.isSubscribable({ type: 'node.actor.person-service.person.v1' })).toBe(false);
  });
});
