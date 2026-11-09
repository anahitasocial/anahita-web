import { describe, expect, it } from 'vitest';

import { recordingFile } from '../useVoiceRecorder';
import audioFiles from '../../../../utils/audio';

// A sound recorded here is a file as one chosen would be, of a type the
// services take, named for when it was made.
describe('recordingFile', () => {
  const at = new Date(2026, 10, 8, 23, 41);

  it('is an M4A from Safari and a WebM from Chrome, without the codec', () => {
    const safari = recordingFile(new Blob(['x']), 'audio/mp4', at);
    expect(safari.name).toBe('voice-2026-11-08-2341.m4a');
    expect(safari.type).toBe('audio/mp4');
    const chrome = recordingFile(new Blob(['x']), 'audio/webm;codecs=opus', at);
    expect(chrome.name).toBe('voice-2026-11-08-2341.webm');
    expect(chrome.type).toBe('audio/webm');
  });

  it('is taken as a sound', () => {
    ['audio/mp4', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus'].forEach((kind) => {
      expect(audioFiles.isAudioType(recordingFile(new Blob(['x']), kind, at))).toBe(true);
    });
  });
});
