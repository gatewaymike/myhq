import { describe, expect, it } from 'vitest';
import { StorageRefused } from '../store/localStore';
import { failKey } from './failKey';

describe('failKey', () => {
  it('names the device when the device refused the write', () => {
    expect(failKey(new StorageRefused())).toBe('log.errorDevice');
  });
  it('falls back to the general save message for any other failure', () => {
    expect(failKey(new Error('network'))).toBe('log.errorSave');
    expect(failKey(undefined)).toBe('log.errorSave');
  });
});
