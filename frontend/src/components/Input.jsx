import { forwardRef } from 'react';

// forwardRef per essere componibile con react-hook-form (register ritorna un ref).
const Input = forwardRef(function Input({ label, error, id, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-dark">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`rounded-md border px-3 py-2 text-sm text-text-dark placeholder:text-text-light
          focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary
          ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

export default Input;
