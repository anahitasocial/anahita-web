/* eslint-env jest */
import sendOnEnter from '../sendOnEnter';

describe('sendOnEnter', () => {
  it('sends on Enter', () => {
    expect(sendOnEnter({ key: 'Enter' })).toBe(true);
  });

  it('leaves Shift and Enter for a new line', () => {
    expect(sendOnEnter({ key: 'Enter', shiftKey: true })).toBe(false);
  });

  it('sends on Enter on a touch screen too, where there is no send button', () => {
    expect(sendOnEnter({ key: 'Enter' })).toBe(true);
  });

  it('sends nothing while a word is being composed', () => {
    expect(sendOnEnter({ key: 'Enter', isComposing: true })).toBe(false);
    expect(sendOnEnter({ key: 'Enter', nativeEvent: { isComposing: true } })).toBe(false);
  });

  it('ignores other keys', () => {
    expect(sendOnEnter({ key: 'a' })).toBe(false);
  });
});
