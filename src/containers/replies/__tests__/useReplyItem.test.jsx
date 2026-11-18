/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import useReplyItem from '../useReplyItem';

// What the reply's menu borrows from elsewhere, each with its own tests:
// reporting, muting, the reader's own content choices and the networks the
// viewer is on. Here they say no, unless a test says otherwise.
const borrowed = { canMute: false, canReport: false };
vi.mock('../../reports/useReport', () => {
  return { default: () => { return { canReport: borrowed.canReport }; } };
});
vi.mock('../../controls/useMute', () => {
  return { default: () => { return { canMute: borrowed.canMute }; } };
});
vi.mock('../../media/Composer/useOnFediverse', () => {
  return {
    useOnBluesky: () => { return false; },
    useReplyStaysHere: () => { return ''; },
  };
});
vi.mock('../../../components/WarningCover', () => {
  return {
    useWarning: () => { return { hidden: true, collapsed: true }; },
  };
});

const writer = { id: 1, name: 'Rose Tyler' };
const viewer = { id: 3, name: 'Martha Jones' };

describe('useReplyItem', () => {
  let box;
  let root;
  let result;

  const Item = (props) => {
    result = useReplyItem(props);
    return null;
  };

  const draw = (props) => {
    act(() => {
      root.render(<Item viewer={viewer} onReply={vi.fn()} onEdit={vi.fn()} {...props} />);
    });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    borrowed.canMute = false;
    borrowed.canReport = false;
    box = document.createElement('div');
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('offers no menu where the viewer may do nothing with a reply', () => {
    draw({ reply: { id: 5, author: writer } });

    expect(result.hasMenu).toBeFalsy();
    expect(result.canWarn).toBe(false);
    expect(result.canBlockFromOwner).toBe(false);
  });

  it('offers a menu for what the server says the viewer may do', () => {
    draw({ reply: { id: 5, author: writer, authorized: { delete: true } } });
    expect(result.hasMenu).toBeTruthy();

    borrowed.canReport = true;
    draw({ reply: { id: 6, author: writer } });
    expect(result.hasMenu).toBeTruthy();
  });

  it('lets its writer change its warning, but not one the administrators gave', () => {
    const onWarning = vi.fn();
    draw({ reply: { id: 5, author: viewer, authorized: { edit: true } }, onWarning });
    expect(result.canWarn).toBe(true);

    draw({
      reply: {
        id: 5,
        author: viewer,
        authorized: { edit: true },
        warning: { kind: 'graphic', byModerator: true },
      },
      onWarning,
    });
    expect(result.canWarn).toBe(false);
  });

  it('blocks from the group only where the thread gives the way to', () => {
    const reply = { id: 5, author: writer, authorized: { blockFromOwner: true } };
    draw({ reply });
    expect(result.canBlockFromOwner).toBe(false);

    draw({ reply, onBlockFromOwner: vi.fn() });
    expect(result.canBlockFromOwner).toBe(true);
  });

  it('says beside the post\'s writer that they wrote it', () => {
    draw({ reply: { id: 5, author: writer }, writerId: 1 });
    expect(result.isWriter).toBe(true);

    draw({ reply: { id: 5, author: writer }, writerId: 0 });
    expect(result.isWriter).toBe(false);
  });

  it('takes its warning off while it is being changed', () => {
    draw({ reply: { id: 5, author: writer } });
    expect(result.warned.collapsed).toBe(true);

    act(() => { result.startEditing(); });

    expect(result.isEditing).toBe(true);
    expect(result.warned).toMatchObject({ hidden: false, collapsed: false });
  });

  it('closes the form once an edit is saved, and keeps it open when it is not', async () => {
    const reply = { id: 5, author: writer };
    const onEdit = vi.fn().mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('no'));
    draw({ reply, onEdit });

    act(() => { result.startEditing(); });
    await act(async () => { await result.saveEdit('New', {}); });
    expect(onEdit).toHaveBeenCalledWith(reply, 'New', {});
    expect(result.isEditing).toBe(false);

    act(() => { result.startEditing(); });
    await act(async () => { await result.saveEdit('Again', {}).catch(() => {}); });
    expect(result.isEditing).toBe(true);
  });

  it('closes the box once an answer is in', async () => {
    const reply = { id: 5, author: writer };
    const onReply = vi.fn().mockResolvedValue({});
    draw({ reply, onReply });

    act(() => { result.toggleReplying(); });
    expect(result.isReplying).toBe(true);
    await act(async () => { await result.sendReply('Hi', {}, {}); });

    expect(onReply).toHaveBeenCalledWith(reply, 'Hi', {}, {});
    expect(result.isReplying).toBe(false);
  });

  it('keeps the warning\'s dialog open when the thread could not save it', async () => {
    const reply = { id: 5, author: viewer, authorized: { edit: true } };
    const onWarning = vi.fn().mockRejectedValue(new Error('no'));
    draw({ reply, onWarning });

    act(() => { result.startWarning(); });
    await act(async () => { result.saveWarning({ kind: 'graphic', text: '' }); });

    expect(result.isWarning).toBe(true);
    expect(result.isSavingWarning).toBe(false);
  });
});
