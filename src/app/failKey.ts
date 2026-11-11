import type { StringKey } from '../i18n/strings';
import { StorageRefused } from '../store/localStore';

/** The message for a failed write: this device refused it (guest mode), or the save could not be completed. */
export function failKey(e: unknown): StringKey {
  return e instanceof StorageRefused ? 'log.errorDevice' : 'log.errorSave';
}
