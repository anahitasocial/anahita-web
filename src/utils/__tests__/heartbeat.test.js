/* eslint-env jest */
import heartbeat from '../heartbeat';

// The page is looked at throughout.
const never = () => { return false; };

// Lets an answer that has come back be dealt with, and the next wait set.
const flush = async () => {
  for (let turn = 0; turn < 10; turn += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

describe('asking now and then whether there is anything new', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('asks less and less often, and stops when nothing comes', async () => {
    const beat = jest.fn(() => { return Promise.resolve(false); });
    const beats = heartbeat.createHeartbeat({ beat, waits: [10, 20, 40], isHidden: never });

    beats.start();
    jest.advanceTimersByTime(9);
    expect(beat).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(1);
    await flush();
    expect(beat).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(19);
    expect(beat).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1);
    await flush();
    expect(beat).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(40);
    await flush();
    expect(beat).toHaveBeenCalledTimes(3);
    expect(beats.isRunning()).toBe(false);

    jest.advanceTimersByTime(100000);
    await flush();
    expect(beat).toHaveBeenCalledTimes(3);
  });

  it('begins again from the start when something is found', async () => {
    const answers = [false, true, false];
    const beat = jest.fn(() => { return Promise.resolve(answers.shift() || false); });
    const beats = heartbeat.createHeartbeat({ beat, waits: [10, 20, 40], isHidden: never });

    beats.start();
    jest.advanceTimersByTime(10);
    await flush();
    jest.advanceTimersByTime(20);
    await flush();
    expect(beat).toHaveBeenCalledTimes(2);

    // Found: the next is asked as soon as the first was.
    jest.advanceTimersByTime(10);
    await flush();
    expect(beat).toHaveBeenCalledTimes(3);
    expect(beats.isRunning()).toBe(true);
  });

  it('asks nothing while the page is not looked at, and at once when it is again', async () => {
    let hidden = true;
    const beat = jest.fn(() => { return Promise.resolve(false); });
    const beats = heartbeat.createHeartbeat({
      beat, waits: [10, 20], isHidden: () => { return hidden; },
    });

    beats.start();
    jest.advanceTimersByTime(1000);
    await flush();
    expect(beat).toHaveBeenCalledTimes(0);
    expect(beats.isRunning()).toBe(false);

    hidden = false;
    beats.wake();
    await flush();
    expect(beat).toHaveBeenCalledTimes(1);
    expect(beats.isRunning()).toBe(true);
  });

  it('takes a failure for nothing new, and stops when told to', async () => {
    const beat = jest.fn(() => { return Promise.reject(new Error('away')); });
    const beats = heartbeat.createHeartbeat({ beat, waits: [10, 20], isHidden: never });

    beats.start();
    jest.advanceTimersByTime(10);
    await flush();
    expect(beat).toHaveBeenCalledTimes(1);
    expect(beats.isRunning()).toBe(true);

    beats.stop();
    jest.advanceTimersByTime(1000);
    await flush();
    expect(beat).toHaveBeenCalledTimes(1);
  });

  it('keeps asking at the longest wait when told to hold it', async () => {
    const beat = jest.fn(() => { return Promise.resolve(false); });
    const beats = heartbeat.createHeartbeat({
      beat, waits: [10, 20], holdLast: true, isHidden: never,
    });

    beats.start();
    jest.advanceTimersByTime(10);
    await flush();
    jest.advanceTimersByTime(20);
    await flush();
    expect(beat).toHaveBeenCalledTimes(2);

    // Past the last wait: on at the longest, not stopped.
    for (let more = 3; more <= 5; more += 1) {
      jest.advanceTimersByTime(20);
      // eslint-disable-next-line no-await-in-loop
      await flush();
      expect(beat).toHaveBeenCalledTimes(more);
    }
    expect(beats.isRunning()).toBe(true);
    beats.stop();
  });

  it('spreads each wait by up to its share, either way', async () => {
    const beat = jest.fn(() => { return Promise.resolve(false); });
    // The longest it may be: a fifth more.
    const beats = heartbeat.createHeartbeat({
      beat, waits: [100], spread: 0.2, random: () => { return 1; }, isHidden: never,
    });

    beats.start();
    jest.advanceTimersByTime(119);
    expect(beat).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(1);
    await flush();
    expect(beat).toHaveBeenCalledTimes(1);
  });
});
