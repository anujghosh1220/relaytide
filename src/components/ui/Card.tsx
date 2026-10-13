import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

const surface = 'rounded-card border border-border bg-surface';

export const Card = ({ className = '', children, ...props }: CardProps) => (
  <div className={`${surface} ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className = '', children, ...props }: CardProps) => (
  <div className={`flex flex-col gap-1.5 p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-base font-semibold tracking-tight text-foreground ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className = '', children, ...props }: CardProps) => (
  <div className={`p-5 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }: CardProps) => (
  <div className={`flex items-center p-5 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardToolbar = ({ className = '', children, ...props }: CardProps) => (
  <div className={`flex items-center gap-2 ${className}`} {...props}>
    {children}
  </div>
);

export type { CardProps };
