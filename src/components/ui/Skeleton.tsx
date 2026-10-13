import type { HTMLAttributes } from 'react';

const base = 'animate-pulse rounded-md bg-muted';

export const Skeleton = ({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`${base} ${className}`} {...props} />
);

export const Spinner = ({ className = '' }: { className?: string }) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block size-5 animate-spin rounded-full border-2 border-border-strong border-t-primary ${className}`}
  />
);

export default Skeleton;
