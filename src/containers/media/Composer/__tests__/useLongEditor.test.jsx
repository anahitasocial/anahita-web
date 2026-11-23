import { act } from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import useLongEditor, { MIN_HEIGHT } from '../useLongEditor';
import { drawHook } from './drawHook';

vi.mock('../../../../api', async (importOriginal) => {
  const real = await importOriginal();
  return {
    default: {
      ...real.default,
      hashtags: { suggest: vi.fn(() => { return Promise.resolve({ data: [] }); }) },
    },
  };
});

describe('useLongEditor', () => {
  let hook;
  let onChange;

  const draw = (props = {}) => {
    hook.draw({
      value: '',
      onChange,
      label: 'Content',
      placeholder: '',
      disabled: false,
      dir: 'ltr',
      minHeight: 184,
      mobile: false,
      ...props,
    });
    return hook.result.current;
  };

  beforeEach(() => {
    onChange = vi.fn();
    hook = drawHook(useLongEditor);
  });

  afterEach(() => {
    hook.unmount();
  });

  it('reads the text as Markdown, and says it back as it is written', () => {
    const { editor } = draw({ value: 'Some **bold** words' });
    expect(editor.getMarkdown()).toBe('Some **bold** words');
    act(() => { editor.commands.insertContent(' and more'); });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)[0]).toContain('and more');
  });

  it('puts in a value from outside without saying it back', () => {
    const { editor } = draw({ value: 'First' });
    onChange.mockClear();
    draw({ value: '## A draft' });
    expect(editor.getMarkdown().trim()).toBe('## A draft');
    expect(onChange).not.toHaveBeenCalled();
  });

  // A picture put in was left selected, and what came next took its place
  // (the user, 2026-11-23, on a mobile).
  const kinds = (editor) => {
    const found = [];
    editor.state.doc.forEach((node) => { found.push(node.type.name); });
    return found;
  };

  it('puts the caret under a picture put in, so what is written next goes after it', () => {
    const { editor } = draw({ value: '' });
    act(() => { hook.result.current.library.pick(`${window.location.origin}/photos/7`); });
    act(() => { editor.commands.insertContent('RIP Coffee Grinder'); });

    expect(kinds(editor)).toEqual(['embed', 'paragraph']);
    expect(editor.getText()).toContain('RIP Coffee Grinder');

    // And it stays when a hashtag is added from the chips under it.
    draw({ value: `${onChange.mock.calls.at(-1)[0]}\n\n#coffee` });
    expect(kinds(editor)).toContain('embed');
  });

  it('never writes over a picture that is selected', () => {
    const { editor } = draw({ value: '' });
    act(() => { hook.result.current.library.pick(`${window.location.origin}/photos/7`); });
    expect(kinds(editor)[0]).toBe('embed');
    act(() => { editor.commands.setNodeSelection(0); });

    act(() => {
      const { view } = editor;
      const { from, to } = view.state.selection;
      view.someProp('handleTextInput', (handle) => { return handle(view, from, to, '#'); });
    });

    expect(kinds(editor)[0]).toBe('embed');
    expect(editor.getText()).toContain('#');
  });

  it('is not written in while disabled', () => {
    const { editor } = draw({ disabled: true });
    expect(editor.isEditable).toBe(false);
    draw({ disabled: false });
    expect(editor.isEditable).toBe(true);
  });

  it('says which buttons are on where the caret is', () => {
    const { editor } = draw({ value: '**All bold**' });
    act(() => { editor.commands.selectAll(); });
    expect(hook.result.current.on.bold).toBe(true);
    expect(hook.result.current.on.italic).toBe(false);
  });

  it('puts a link in, and takes it off when its address is emptied', () => {
    const { editor } = draw({ value: 'Linked' });
    act(() => {
      editor.commands.selectAll();
      hook.result.current.link.open({ currentTarget: document.body });
    });
    expect(hook.result.current.link.anchor).toBe(document.body);
    act(() => { hook.result.current.link.setAddress(' https://example.org '); });
    act(() => { hook.result.current.link.apply(); });
    expect(editor.getMarkdown()).toBe('[Linked](https://example.org)');
    expect(hook.result.current.link.anchor).toBe(null);
    act(() => { editor.commands.selectAll(); });
    act(() => { hook.result.current.link.remove(); });
    expect(editor.getMarkdown()).toBe('Linked');
  });

  it('opens the library as it is asked to', () => {
    draw();
    act(() => { hook.result.current.library.open({ tab: 'upload' }); });
    expect(hook.result.current.library).toMatchObject({ isOpen: true, start: { tab: 'upload' } });
    act(() => { hook.result.current.library.close(); });
    expect(hook.result.current.library.isOpen).toBe(false);
  });

  it('is dragged taller or shorter, never under a few lines', () => {
    draw();
    expect(hook.result.current.height).toBe(184);
    const handle = { setPointerCapture: () => {} };
    act(() => {
      hook.result.current.resize.onPointerDown({
        preventDefault: () => {}, currentTarget: handle, pointerId: 1, clientY: 100,
      });
    });
    act(() => { hook.result.current.resize.onPointerMove({ clientY: 150 }); });
    expect(hook.result.current.height).toBe(234);
    act(() => { hook.result.current.resize.onPointerMove({ clientY: -500 }); });
    expect(hook.result.current.height).toBe(MIN_HEIGHT);
    act(() => { hook.result.current.resize.onPointerUp(); });
    act(() => { hook.result.current.resize.onPointerMove({ clientY: 400 }); });
    expect(hook.result.current.height).toBe(MIN_HEIGHT);
  });
});
