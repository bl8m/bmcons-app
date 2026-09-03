import { forwardRef } from 'react';

const Checkbox = forwardRef(function Checkbox({ label, id, className = '', ...props }, ref) {
  return (
    <label htmlFor={id} className={`flex items-center gap-2 text-sm text-text-dark ${className}`}>
      <input
        id={id}
        ref={ref}
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary-200"
        {...props}
      />
      {label}
    </label>
  );
});

export default Checkbox;
