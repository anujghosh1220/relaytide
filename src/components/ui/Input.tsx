import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const field =
  'w-full rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-subtle-foreground focus:border-primary focus:outline-none';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, icon, id, ...props }, ref) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');
    const hasIcon = Boolean(icon);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {hasIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle-foreground">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`${field} ${hasIcon ? 'pl-9' : ''} ${error ? 'border-danger' : ''} ${className}`}
            {...props}
          />
        </div>
        {hint && !error && <p className="mt-1.5 text-xs text-subtle-foreground">{hint}</p>}
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
