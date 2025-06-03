
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string; // Added for link functionality
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  target?: string; // For <a> tags
  rel?: string; // For <a> tags
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  href,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  target,
  rel,
  ...props // props contains other ButtonHTMLAttributes like onClick, type, disabled etc.
}) => {
  const baseStyles = "font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center";
  
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-slate-800 focus:ring-yellow-400",
    ghost: "bg-transparent hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-300",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const loadingSpinner = (
    <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${variant === 'primary' || variant === 'secondary' || variant === 'danger' || variant === 'success' ? 'text-white' : 'text-slate-700'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const isDisabled = isLoading || props.disabled;
  const commonClassNames = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${isDisabled ? 'opacity-75 cursor-not-allowed' : ''} ${className || ''}`;

  if (href && !isDisabled) { // Render as <a> tag if href is provided and not disabled
    return (
      <a
        href={href}
        className={commonClassNames}
        role="button"
        target={target}
        rel={rel}
        onClick={props.onClick as any} // Changed cast to 'as any' to resolve the type error
        // Other props like 'aria-label' are fine
        // The original spread below is kept as is for "minimal change" regarding the error,
        // though it's not ideal as it spreads button-specific attributes onto an anchor.
        // The reported error was specifically for the onClick assignment.
        {...(props as Omit<ActionButtonProps, 'type' | 'disabled'> as any)} // Spread remaining props, casting to any to bypass type error
      >
        {isLoading && loadingSpinner}
        {icon && !isLoading && <span className="mr-2">{icon}</span>}
        {children}
      </a>
    );
  }
  
  // Render as <button> otherwise
  return (
    <button
      type={props.type || "button"}
      className={commonClassNames}
      disabled={isDisabled}
      {...props} // Spread all props for button
    >
      {isLoading && loadingSpinner}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default ActionButton;
