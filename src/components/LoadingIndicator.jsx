import React from 'react';

/**
 * Loading indicator component with different sizes and variants
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size of the spinner (sm, md, lg)
 * @param {string} [props.variant='primary'] - Color variant (primary, accent, white)
 * @param {string} [props.text] - Optional loading text
 * @param {boolean} [props.fullPage=false] - Whether to display as a full page overlay
 * @returns {JSX.Element} Loading indicator component
 */
export const LoadingIndicator = ({ 
  size = 'md', 
  variant = 'primary',
  text,
  fullPage = false
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'border-primary/30 border-t-primary',
    accent: 'border-accent/30 border-t-accent',
    white: 'border-white/30 border-t-white'
  };
  
  // Spinner element
  const spinner = (
    <div className={`
      ${sizeClasses[size] || sizeClasses.md}
      ${variantClasses[variant] || variantClasses.primary}
      rounded-full animate-spin
    `} />
  );
  
  // If full page, render with overlay
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        {spinner}
        {text && (
          <p className="mt-4 text-textSecondary">{text}</p>
        )}
      </div>
    );
  }
  
  // Otherwise, render inline
  return (
    <div className="flex flex-col items-center justify-center">
      {spinner}
      {text && (
        <p className="mt-2 text-sm text-textSecondary">{text}</p>
      )}
    </div>
  );
};

export default LoadingIndicator;

