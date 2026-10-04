/* eslint-env jest */
import tabs from '../tabs';

const viewer = (personType) => {
  return { id: 7, personType };
};

const keys = (list) => {
  return list.map((tab) => {
    return tab.key;
  });
};

describe('administration tabs', () => {
  it('shows administrators and super administrators the same tabs', () => {
    expect(keys(tabs.visibleTabs(viewer('administrator'))))
      .toEqual(['signup-requests', 'invites']);
    expect(keys(tabs.visibleTabs(viewer('super-administrator'))))
      .toEqual(['signup-requests', 'invites']);
  });

  // Site settings are a page of their own, for super administrators.
  it('has no settings tab', () => {
    expect(keys(tabs.TABS)).not.toContain('settings');
  });

  it('shows a member, and a guest, nothing', () => {
    expect(tabs.visibleTabs(viewer('registered'))).toEqual([]);
    expect(tabs.visibleTabs(viewer('guest'))).toEqual([]);
    expect(tabs.canBrowse(viewer('registered'))).toBe(false);
    expect(tabs.canBrowse(viewer('administrator'))).toBe(true);
  });

  it('counts what is waiting on the tabs the viewer may see', () => {
    const counts = { signupRequests: 3 };

    expect(tabs.waitingCount(viewer('administrator'), counts)).toBe(3);
    expect(tabs.waitingCount(viewer('registered'), counts)).toBe(0);
  });

  it('counts nothing before the counts have loaded', () => {
    expect(tabs.waitingCount(viewer('administrator'))).toBe(0);
    expect(tabs.waitingCount(viewer('administrator'), { signupRequests: undefined })).toBe(0);
  });
});
