/* eslint-env jest */
import comment from '../comment';
import like from '../like';
import utils from '../../utils';

// Who may comment, like and post is answered by the server, on the node it
// returns, from the same checks it enforces. The client reads the answer and
// falls back only where a response does not carry one yet.

describe('comment.canAdd', () => {
  it('follows the server', () => {
    expect(comment.canAdd({ id: 1, authorized: { comment: true } })).toBe(true);
    expect(comment.canAdd({ id: 1, authorized: { comment: false } })).toBe(false);
  });

  it('falls back to any saved post when unanswered', () => {
    expect(comment.canAdd({ id: 1, authorized: { edit: false } })).toBe(true);
    expect(comment.canAdd({ id: 1 })).toBe(true);
    expect(comment.canAdd({ id: 0 })).toBe(false);
    expect(comment.canAdd(undefined)).toBe(false);
  });
});

describe('like.canLike', () => {
  it('follows the server', () => {
    expect(like.canLike({ authorized: { like: true } })).toBe(true);
    expect(like.canLike({ authorized: { like: false } })).toBe(false);
  });

  it('offers liking when unanswered', () => {
    expect(like.canLike({ authorized: {} })).toBe(true);
    expect(like.canLike({})).toBe(true);
  });
});

describe('node.getComposers', () => {
  // The old client-side rules offered these from the actor's features; only
  // the server's list counts now.
  const features = [{
    service: 'text-service',
    enabled: true,
    composers: ['note', 'article'],
    addPermissions: [{ entity: 'like', access: 'followers' }],
  }];

  it('is exactly what the server allows', () => {
    expect(utils.node.getComposers({
      features,
      isLeadingViewer: true,
      authorized: { composers: ['note'] },
    })).toEqual(['note']);
  });

  it('is none when the server lists none', () => {
    expect(utils.node.getComposers({
      features,
      isLeadingViewer: true,
      isAdminedByViewer: true,
      authorized: { edit: false },
    })).toEqual([]);
    expect(utils.node.getComposers({})).toEqual([]);
  });
});
