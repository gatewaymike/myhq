import { Capacitor } from '@capacitor/core';

/** True inside the Google Play / App Store app; false in a browser or the installed web app. */
export const IS_NATIVE = Capacitor.isNativePlatform();

/**
 * The public address of MyHQ. Email links (confirmation, password reset) must point here:
 * inside the store app the page's own origin is a local one that no email can open.
 */
export const PUBLIC_APP_URL = 'https://h2tracker.gatewayh2.com';

/** Base for links in auth emails: the live site from the store app, this origin in a browser. */
export function authRedirectBase(): string {
  return IS_NATIVE ? PUBLIC_APP_URL : window.location.origin;
}
