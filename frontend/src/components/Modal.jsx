const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// Modal generico e riutilizzabile: gestisce solo overlay/pannello/chiusura,
// il contenuto (form, conferme, ecc.) viene passato come children.
// size: 'sm' | 'md' (default) | 'lg' | 'xl' — usare 'lg'/'xl' per contenuti
// più ricchi (es. form con tab, tabelle incorporate).
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[90vh] w-full flex-col rounded-lg bg-white p-6 shadow-lg ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 className="text-lg font-semibold text-text-dark">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="text-text-light hover:text-text-dark"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
