/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import LinkPreviewCard from '../LinkPreviewCard';

const preview = {
  url: 'https://memory-alpha.example/enterprise',
  title: 'USS Enterprise',
  description: 'NCC-1701-D',
  image: '/link-previews/image/enterprise.jpg',
};

describe('LinkPreviewCard', () => {
  let box;
  let root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    box = document.createElement('div');
    document.body.appendChild(box);
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    box.remove();
  });

  const draw = (card) => {
    act(() => { root.render(<LinkPreviewCard preview={card} />); });
  };

  it('shows its picture', () => {
    draw(preview);
    expect(box.querySelector('img').getAttribute('src')).toContain('enterprise.jpg');
  });

  // Not the mark for a broken picture: the card, with its words.
  it('leaves out a picture that will not load', () => {
    draw(preview);
    act(() => { box.querySelector('img').dispatchEvent(new Event('error')); });
    expect(box.querySelector('img')).toBeNull();
    expect(box.textContent).toContain('USS Enterprise');
  });

  // A card can be given another link while it is on the screen, in the
  // composer.
  it('tries the picture of another link', () => {
    draw(preview);
    act(() => { box.querySelector('img').dispatchEvent(new Event('error')); });
    draw({ ...preview, image: '/link-previews/image/voyager.jpg' });
    expect(box.querySelector('img').getAttribute('src')).toContain('voyager.jpg');
  });
});
