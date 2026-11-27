// Step 25: haptics, store app only (design direction section 7). Nothing happens on the web.
// Never on scroll or typing. A phone that cannot vibrate must not break the action, so errors are ignored.
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { IS_NATIVE } from './platform';

function run(effect: () => Promise<unknown>): void {
  if (!IS_NATIVE) return;
  void effect().catch(() => {});
}

export const haptic = {
  /** Chips, route and view switches, range changes, chart day selected. */
  select: () =>
    // The Android plugin only ticks between selectionStart and selectionEnd.
    run(() => Promise.all([Haptics.selectionStart(), Haptics.selectionChanged(), Haptics.selectionEnd()])),
  /** Timer start, undo, delete. */
  light: () => run(() => Haptics.impact({ style: ImpactStyle.Light })),
  /** Timer stop. */
  medium: () => run(() => Haptics.impact({ style: ImpactStyle.Medium })),
  /** Entry saved. */
  success: () => run(() => Haptics.notification({ type: NotificationType.Success })),
  /** Save refused. */
  error: () => run(() => Haptics.notification({ type: NotificationType.Error })),
};
