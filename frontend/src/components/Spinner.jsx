export default function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary" />
    </div>
  );
}
