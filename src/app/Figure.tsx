/**
 * A figure with fixed-width digits (ruled 2026-11-11: figures are DM Sans with fixed-width digits).
 * DM Sans ships no tabular-figures feature (checked in the bundled files: its "1" is 0.348 em wide and
 * its "0" is 0.698 em), so `font-variant-numeric: tabular-nums` does nothing. Each digit sits in a cell as
 * wide as the widest digit instead, so "1.11" and "8.88" measure the same and a counting figure never jitters.
 * Screen readers get the plain text.
 */
export function Figure({ value, className = '' }: { value: string; className?: string }) {
  return (
    <span className={`num ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {[...value].map((ch, i) =>
          /[0-9]/.test(ch) ? (
            <span key={i} className="fig-d">
              {ch}
            </span>
          ) : (
            ch
          ),
        )}
      </span>
    </span>
  );
}
