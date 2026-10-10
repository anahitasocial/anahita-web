/**
 * @jest-environment node
 */
/* eslint-env jest */
import upload from '../upload';

describe('why an image was refused', () => {
  it('reads the server\'s word for it', () => {
    expect(upload.refusalKey({ response: { status: 413, data: { error: 'file_too_large' } } }))
      .toBe('media:image.tooLarge');
    expect(upload.refusalKey({ response: { status: 415, data: { error: 'file_unsupported' } } }))
      .toBe('media:image.unsupported');
    expect(upload.refusalKey({ response: { status: 400, data: { error: 'file_unreadable' } } }))
      .toBe('media:image.unreadable');
  });

  // A file over the gateway's limit never reaches the service that has the
  // words: the answer is a status and nothing else.
  it('takes a bare 413 to mean too large', () => {
    expect(upload.refusalKey({ response: { status: 413, data: {} } })).toBe('media:image.tooLarge');
    expect(upload.refusalKey({ response: { status: 413 } })).toBe('media:image.tooLarge');
  });

  it('says it failed when it does not know why', () => {
    expect(upload.refusalKey({ response: { status: 500 } })).toBe('media:image.failed');
    expect(upload.refusalKey(new Error('offline'))).toBe('media:image.failed');
    expect(upload.refusalKey(undefined)).toBe('media:image.failed');
  });
});
