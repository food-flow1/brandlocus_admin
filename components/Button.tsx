import React from 'react';

export type ButtonVariant = 'default' | 'primary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  text?: React.ReactNode;
  fullWidth?: boolean;
  iconOnly?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  text,
  fullWidth = false,
  iconOnly = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    default: 'bg-white text-[#344054] border border-gray-200 hover:bg-gray-50 focus:ring-gray-400',
    primary: 'bg-[#344054] text-white border border-black hover:bg-gray-900 focus:ring-gray-600',
    danger: 'bg-white text-red-600 border border-gray-200 hover:bg-red-50 focus:ring-red-400',
  };

  const sizeStyles = {
    sm: iconOnly ? 'p-1.5' : 'px-3 py-1.5 text-sm',
    md: iconOnly ? 'p-2' : 'px-4 py-2 text-sm',
    lg: iconOnly ? 'p-3' : 'px-6 py-3 text-base',
  };

  const gapStyles = iconOnly || !text ? '' : 'gap-2';

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${gapStyles} ${disabledStyles} ${widthStyles} ${className}`.trim();

  const hasContent = icon || text;

  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      aria-label={iconOnly && !text ? props['aria-label'] || 'Button' : undefined}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {text && <span className="text-[.95rem] font-medium">{text}</span>}
      {!hasContent && !iconOnly && <span>Button</span>}
    </button>
  );
};

export default Button;

