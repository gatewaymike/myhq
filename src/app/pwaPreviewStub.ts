// Stands in for virtual:pwa-register/react in the single-file parity preview, which has no service worker.
// Open the preview with #update in the URL to see the update line.
export function useRegisterSW(_opts?: unknown) {
  const show = typeof window !== 'undefined' && window.location.hash === '#update';
  return {
    needRefresh: [show, () => {}] as const,
    offlineReady: [false, () => {}] as const,
    updateServiceWorker: async (_reload?: boolean) => {},
  };
}
