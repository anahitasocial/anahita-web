import { isOn, withKind, hasText } from '../kindsOfPost';

const features = [
  {
    service: 'socialgraph-service', nodeTypes: [], composers: [], enabled: false, addPermissions: [], ordering: 1,
  },
  {
    service: 'text-service',
    nodeTypes: ['note'],
    composers: ['note'],
    enabled: true,
    addPermissions: [{ entity: 'note', access: 'admins' }],
    ordering: 2,
  },
];

describe('kindsOfPost', () => {
  it('reads a kind as on only when text-service lists it', () => {
    expect(hasText(features)).toBe(true);
    expect(isOn(features, 'note')).toBe(true);
    expect(isOn(features, 'article')).toBe(false);
  });

  it('turns a kind on with its composer, the rest as they were', () => {
    const saved = withKind(features, 'article', true);
    const text = saved.find((f) => { return f.service === 'text-service'; });
    expect(text.nodeTypes).toEqual(['note', 'article']);
    expect(text.composers).toEqual(['note', 'article']);
    expect(text.addPermissions).toEqual([{ entity: 'note', access: 'admins' }]);
    expect(saved[0]).toEqual(expect.objectContaining({ service: 'socialgraph-service', enabled: false }));
  });

  it('turns a kind off again', () => {
    const on = withKind(features, 'topic', true);
    const off = withKind(on, 'topic', false);
    const text = off.find((f) => { return f.service === 'text-service'; });
    expect(text.nodeTypes).toEqual(['note']);
    expect(text.composers).toEqual(['note']);
  });
});
