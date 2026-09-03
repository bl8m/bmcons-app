const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-600 focus-visible:ring-primary-300',
  secondary:
    'bg-white text-text border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-300',
  danger: 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-300',
};

export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium
        transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
