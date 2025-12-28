import { ButtonHTMLAttributes } from 'react';

// Props interface extending HTML button attributes
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
}

// Reusable button component
export default function Button({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base styles for all buttons
  const baseStyles =
    'px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  // Variant-specific styles
  const variantStyles = {
    primary: 'bg-primary text-black hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/50',
    secondary:
      'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
