'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'font-mono border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white',
      secondary: 'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
      danger: 'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600',
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
