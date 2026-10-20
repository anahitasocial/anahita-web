import { isNumbered, listProps } from '../lists';

describe('lists', () => {
  it('numbers a list of more than three', () => {
    expect(isNumbered([1, 2, 3])).toBe(false);
    expect(isNumbered([1, 2, 3, 4])).toBe(true);
    expect(isNumbered(null)).toBe(false);
  });

  it('holds a short list in a plain <ul>, a long one in an <ol>', () => {
    expect(listProps([1]).component).toBe('ul');
    expect(listProps([1, 2, 3, 4]).component).toBe('ol');
  });
});
