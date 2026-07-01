import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../store/useTheme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5 transition-colors ${className}`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
