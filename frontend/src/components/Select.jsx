import { forwardRef } from 'react';

// Stessa API/stile di Input, ma per <select>: { value, label }[] in options.
const Select = forwardRef(function Select(
  { label, error, id, options, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-dark">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={`rounded-md border bg-white px-3 py-2 text-sm text-text-dark
          focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary
          ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

export default Select;
