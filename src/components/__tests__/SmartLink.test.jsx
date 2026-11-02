/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

import SmartLink from '../SmartLink';

describe('SmartLink', () => {
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

  const draw = (href) => {
    act(() => {
      root.render(
        <MemoryRouter>
          <SmartLink href={href}>Memory Alpha</SmartLink>
        </MemoryRouter>,
      );
    });
    return box.querySelector('a');
  };

  it('opens another site in a tab of its own', () => {
    const link = draw('https://memory-alpha.example/wiki/Enterprise');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('goes to a path here in the same tab', () => {
    const link = draw('/notes/1701/');
    expect(link.getAttribute('href')).toBe('/notes/1701/');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('shows the words of an address no browser can read, and does not fail', () => {
    ['https://', 'https://memory alpha.example/', 'http://[bajor'].forEach((href) => {
      const link = draw(href);
      expect(link).toBeNull();
      expect(box.textContent).toBe('Memory Alpha');
    });
  });
});
