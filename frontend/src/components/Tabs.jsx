// Navigazione a tab riutilizzabile. tabs: [{ key, label }]
export default function Tabs({ tabs, activeKey, onChange }) {
  return (
    <div className="mb-4 flex shrink-0 gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
            activeKey === tab.key
              ? 'border-primary text-primary-600'
              : 'border-transparent text-text hover:text-text-dark'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
