/* global globalThis */
import { vi } from 'vitest';

// The tests were written for Jest, whose timers and mocks these are.
globalThis.jest = vi;
