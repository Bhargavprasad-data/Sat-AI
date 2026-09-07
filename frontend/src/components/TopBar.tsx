import type { FC } from 'react';
import { Sun, Moon } from 'lucide-react';

export type ThemeType = 'dark' | 'light';

interface TopBarProps {
  onGoHome?: () => void;
  onResetDemo?: () => void;
  isBackendConnected?: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  currentTheme: ThemeType;
  onSelectTheme: (theme: ThemeType) => void;
}

export const TopBar: FC<TopBarProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  return (
    <header className="topbar-container" style={{ justifyContent: 'flex-end' }}>
      <div className="topbar-right">
        {/* Dark / Light Mode Toggle Button */}
        <button
          className="theme-mode-toggle-btn"
          onClick={() => onSelectTheme(currentTheme === 'dark' ? 'light' : 'dark')}
          title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark and light mode"
        >
          {currentTheme === 'dark' ? (
            <>
              <Sun size={14} className="theme-toggle-icon sun" />
              <span className="theme-toggle-text">Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={14} className="theme-toggle-icon moon" />
              <span className="theme-toggle-text">Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
