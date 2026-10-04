// Scaffold placeholder. Screens arrive one at a time through the parity gate:
// Log, Today, History, Settings, first-run, guest mode.
export default function App() {
  return (
    <main className="min-h-screen grid place-content-center gap-3 px-4 text-center">
      <span className="inline-flex items-baseline justify-center text-4xl">
        <span className="font-display italic font-semibold text-gold">My</span>
        <span className="font-mono font-medium text-mint tracking-tighter">HQ</span>
        <span className="text-mint/70 text-[.45em] align-super">™</span>
      </span>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Rebuild in progress</p>
    </main>
  );
}
