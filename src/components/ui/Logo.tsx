import type { FC } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: FC<LogoProps> = ({ className = '', showText = false }) => {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img 
        src="/logo.png" 
        alt="RelayTide" 
        className="h-8 w-auto" 
      />
      {showText && <span className="text-xl font-bold text-foreground">RelayTide</span>}
    </span>
  );
};

export default Logo;