import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  onLogout?: () => void;
}

export const Header = ({ title, onLogout }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        
        {onLogout && (
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Sign Out
          </Button>
        )}
      </div>
    </header>
  );
};
