/* global globalThis, Element */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import EmptyList from '../EmptyList';
import Masonry, { FixedColumns } from '../BreakpointMasonry';
import { useTabbedList } from '../SideTabs';
import useFeedView, {
  COLUMNS, STREAM, PROFILES,
} from '../../containers/feeds/useFeedView';

describe('the views of a feed', () => {
  let box;
  let root;

  const draw = (element) => {
    act(() => {
      root.render(<ThemeProvider theme={createTheme()}>{element}</ThemeProvider>);
    });
  };

  // A window as wide as the test asks.
  const wide = (isWide) => {
    window.matchMedia = () => {
      return {
        matches: isWide,
        media: '',
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    };
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    window.localStorage.clear();
    box = document.createElement('div');
    document.body.appendChild(box);
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    box.remove();
    delete window.matchMedia;
    vi.restoreAllMocks();
  });

  describe('useFeedView', () => {
    let seen;
    const Probe = () => {
      seen = useFeedView();
      return null;
    };

    it('reads one post under another, with the tabs beside them, at first', () => {
      wide(true);
      draw(<Probe />);
      expect(seen.view).toBe(STREAM);
      expect(seen.sideTabs).toBe(true);
      expect(seen.columns).toBe(false);
    });

    it('keeps the choice for next time', () => {
      wide(true);
      draw(<Probe />);
      act(() => { seen.chooseView(COLUMNS); });
      expect(seen.columns).toBe(true);
      expect(seen.sideTabs).toBe(false);

      act(() => { root.unmount(); });
      root = createRoot(box);
      draw(<Probe />);
      expect(seen.columns).toBe(true);
    });

    it('keeps the feeds\' choice apart from the profiles\'', () => {
      wide(true);
      let profile;
      const Profile = () => {
        profile = useFeedView(PROFILES);
        return null;
      };
      const both = (
        <>
          <Probe />
          <Profile />
        </>
      );
      draw(both);
      act(() => { seen.chooseView(COLUMNS); });
      expect(seen.columns).toBe(true);
      expect(profile.columns).toBe(false);

      act(() => { root.unmount(); });
      root = createRoot(box);
      draw(both);
      expect(seen.columns).toBe(true);
      expect(profile.view).toBe(STREAM);
    });

    it('has neither on a narrow screen, whatever was chosen', () => {
      wide(false);
      window.localStorage.setItem('home.feedView', COLUMNS);
      draw(<Probe />);
      expect(seen.columns).toBe(false);
      expect(seen.sideTabs).toBe(false);
    });
  });

  describe('FixedColumns', () => {
    const cards = ['Picard', 'Riker', 'Troi', 'Data'].map((name) => {
      return <div key={name}>{name}</div>;
    });

    const columns = () => {
      return box.firstChild.children.length;
    };

    it('holds a list to the columns it is given, however wide the window', () => {
      draw(<FixedColumns count={2}><Masonry>{cards}</Masonry></FixedColumns>);
      expect(columns()).toBe(2);
    });

    it('holds a list to one', () => {
      draw(<FixedColumns count={1}><Masonry>{cards}</Masonry></FixedColumns>);
      expect(columns()).toBe(1);
      expect(box.textContent).toBe('PicardRikerTroiData');
    });
  });

  describe('useTabbedList', () => {
    let startList;
    const Probe = () => {
      const [listRef, start] = useTabbedList();
      startList = start;
      return <div ref={listRef} />;
    };

    // The list at `top` in the window, with the page scrolled by `scrollY`.
    const placed = (top, scrollY) => {
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(scrollY);
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top });
      window.scrollTo = vi.fn();
    };

    it('moves nothing while the list starts on the screen', () => {
      draw(<Probe />);
      placed(300, 200);
      startList();
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('starts the next list under the top bar from further down', () => {
      draw(<Probe />);
      placed(-1000, 1600);
      startList();
      expect(window.scrollTo).toHaveBeenCalledWith(0, 520);
    });
  });

  describe('EmptyList', () => {
    it('says there is nothing to show', () => {
      draw(<EmptyList />);
      expect(box.textContent).toBe('Nothing to show yet');
    });

    it('says what it is told to instead', () => {
      draw(<EmptyList>No events</EmptyList>);
      expect(box.textContent).toBe('No events');
    });

    it('draws the list\'s icon', () => {
      draw(<EmptyList icon={<svg data-testid="icon" />} />);
      expect(box.querySelector('[data-testid="icon"]')).not.toBeNull();
    });
  });
});
