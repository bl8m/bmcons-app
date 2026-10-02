// Evidenzia un singolo valore (un conteggio, una metrica, ...) con una
// piccola etichetta sotto e un link di approfondimento opzionale.
// Il valore viene mostrato così com'è: eventuale formattazione (es. "12,9K")
// resta a carico del chiamante.
export default function StatTile({
  value,
  label,
  linkUrl,
  linkLabel = 'Mostra',
  linkTarget = '_self',
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
      <div className="text-3xl font-semibold text-primary">{value}</div>
      <div className="mt-1 text-sm text-text">{label}</div>

      {linkUrl && (
        <a
          href={linkUrl}
          target={linkTarget}
          rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
          className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary-600"
        >
          {linkLabel}
        </a>
      )}
    </div>
  );
}
