import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Open dialogs, topmost last: only the topmost one answers Escape and Tab.
const stack: symbol[] = [];

/**
 * Dialog behavior in one place (finding F16): Escape closes, Tab stays inside, and focus goes back
 * to whatever opened the dialog. Focus moves into the dialog on open unless something inside already has it.
 */
export function useDialog(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const id = Symbol('dialog');
    stack.push(id);
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const box = ref.current;
    if (box && !box.contains(document.activeElement)) {
      (box.querySelector<HTMLElement>(FOCUSABLE) ?? box).focus({ preventScroll: true });
    }

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!ref.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || active === ref.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const at = stack.indexOf(id);
      if (at >= 0) stack.splice(at, 1);
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [ref]);
}
