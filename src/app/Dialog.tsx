import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useDialog } from './useDialog';

/** A modal dialog over a scrim: Escape closes, Tab stays inside, focus returns to the opener. */
export function Dialog(props: {
  onClose: () => void;
  labelledBy: string;
  className: string;
  scrimClassName?: string;
  style?: CSSProperties;
  closeOnScrim?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, props.onClose);
  return (
    <div className={props.scrimClassName ?? 'fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center'} onClick={props.closeOnScrim ? props.onClose : undefined}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={props.labelledBy} className={props.className} style={props.style} onClick={(e) => e.stopPropagation()}>
        {props.children}
      </div>
    </div>
  );
}
