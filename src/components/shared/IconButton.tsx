import React from 'react';
import clsx from 'clsx';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Size of the square button. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Rounded corner style. */
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  /** Optional color variant. */
  variant?: 'default' | 'danger' | 'primary' | 'secondary' | 'success';
}

const sizeMap: Record<NonNullable<IconButtonProps['size']>, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
};

const roundedMap: Record<NonNullable<IconButtonProps['rounded']>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

const variantMap: Record<NonNullable<IconButtonProps['variant']>, string> = {
  default: 'text-slate-400 hover:bg-slate-100 hover:text-slate-600',
  danger: 'text-red-400 hover:bg-red-50 hover:text-red-500',
  primary: 'text-primary-600 hover:bg-primary-50',
  secondary: 'text-slate-400 hover:bg-slate-100',
  success: 'text-emerald-500 hover:bg-emerald-50',
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = 'md',
      rounded = 'md',
      variant = 'default',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = clsx(
      'flex items-center justify-center transition-colors',
      sizeMap[size],
      roundedMap[rounded],
      variantMap[variant],
      className
    );

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
