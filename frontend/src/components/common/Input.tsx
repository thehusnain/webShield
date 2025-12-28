import { InputHTMLAttributes, ReactNode } from 'react';

// Props interface
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

// Reusable input component
export default function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Icon if provided */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">{icon}</div>
        )}

        {/* Input field */}
        <input
          className={`
            input-field
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
