import React from 'react';
import clsx from 'clsx';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'link';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. */
  variant?: ButtonVariant;
  /** Make the button take the full width of its container. */
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  success: 'btn-success',
  // `link` isn't defined in the stylesheet so we provide a small utility class here.
  link: 'bg-transparent text-primary-600 hover:underline p-0',
};

const Button: React.FC<ButtonProps> = React.forwardRef(
  (
    {
      variant = 'primary',
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const classes = clsx(
      variantClasses[variant],
      fullWidth && 'w-full',
      className
    );

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
