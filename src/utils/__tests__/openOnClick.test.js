/* eslint-env jest */
import openOnClick from '../openOnClick';

const click = (target, extra = {}) => {
  return {
    target, button: 0, defaultPrevented: false, ...extra,
  };
};

describe('opening a post by clicking its text', () => {
  afterEach(() => {
    window.getSelection().removeAllRanges();
    document.body.innerHTML = '';
  });

  it('opens on a plain click in the text', () => {
    document.body.innerHTML = '<div id="text"><p id="p">Some words</p></div>';
    expect(openOnClick.shouldOpen(click(document.getElementById('p')))).toBe(true);
  });

  it('leaves a link, a hashtag or a button in the text to do its own thing', () => {
    document.body.innerHTML = '<p>See <a id="a" href="/hashtags/x"><span id="s">#x</span></a> <button id="b">x</button></p>';
    expect(openOnClick.shouldOpen(click(document.getElementById('s')))).toBe(false);
    expect(openOnClick.shouldOpen(click(document.getElementById('b')))).toBe(false);
  });

  it('does not open when text is being selected, so it can be copied', () => {
    document.body.innerHTML = '<p id="p">Some words to copy</p>';
    const p = document.getElementById('p');
    const range = document.createRange();
    range.selectNodeContents(p);
    window.getSelection().addRange(range);
    expect(openOnClick.shouldOpen(click(p))).toBe(false);
  });

  it('does not open what something before it took, nor a right click', () => {
    document.body.innerHTML = '<p id="p">x</p>';
    const p = document.getElementById('p');
    expect(openOnClick.shouldOpen(click(p, { defaultPrevented: true }))).toBe(false);
    expect(openOnClick.shouldOpen(click(p, { button: 2 }))).toBe(false);
  });

  it('opens in a new tab with ctrl, ⌘ or the middle button', () => {
    expect(openOnClick.inNewTab({ metaKey: true })).toBe(true);
    expect(openOnClick.inNewTab({ ctrlKey: true })).toBe(true);
    expect(openOnClick.inNewTab({ button: 1 })).toBe(true);
    expect(openOnClick.inNewTab({ button: 0 })).toBe(false);
  });

  it('adds nothing where there is nowhere to go', () => {
    expect(openOnClick.handlersFor('', () => {})).toEqual({});
  });
});
