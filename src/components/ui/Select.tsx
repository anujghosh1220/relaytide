import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const field =
  'w-full appearance-none rounded-lg border border-border-strong bg-background bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat py-2 pl-3 pr-9 text-sm text-foreground transition-colors focus:border-primary focus:outline-none';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, children, id, ...props }, ref) => {
    const selectId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={`${field} ${error ? 'border-danger' : ''} ${className}`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2393a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
