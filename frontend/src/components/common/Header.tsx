import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    goHome, 
    theme, 
    toggleTheme
  } = useApp();

  return (
    <header className={`sticky top-0 z-40 backdrop-blur border-b px-5 lg:px-8 py-2.5 w-full transition-colors shadow-sm ${
      theme === 'light'
        ? 'bg-white/98 border-slate-200 text-slate-900'
        : 'bg-[#0B120F]/98 border-[#25352E] text-slate-100'
    }`}>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 w-full">
        
        {/* Left: Brand & Wordmark & Back Button */}
        <div className="flex items-center gap-3">
          <img 
            src="/assets/nivara_logo.png" 
            alt="NIVARA Logo" 
            onClick={goHome}
            className="w-10 h-10 rounded-full object-contain cursor-pointer shadow-md hover:scale-105 transition-transform shrink-0 border border-emerald-500/30" 
            title="Go to NIVARA Home"
          />
          <div>
            <div className="flex items-center gap-2">
              <span 
                onClick={goHome}
                className={`font-serif text-xl sm:text-2xl font-bold tracking-tight cursor-pointer transition-colors ${
                  theme === 'light' ? 'text-slate-900 hover:text-emerald-700' : 'text-white hover:text-emerald-300'
                }`}
              >
                NIVARA
              </span>
            </div>
            <p className={`text-xs font-sans hidden sm:block ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Multi-Hazard Risk & Smart Relocation Decision Support System
            </p>
          </div>
        </div>

        {/* Right: Theme Switcher & User Profile */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">

          {/* Theme Switcher Button (Sun in Dark Mode -> Light Theme; Moon in Light Mode -> Dark Theme) */}

          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer shadow-sm ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-[#121C18] hover:bg-[#1A2E24] border-amber-500/40 text-amber-300'
            }`}
            title={theme === 'light' ? 'Switch to Dark Theme (Click Moon)' : 'Switch to Light Theme (Click Sun)'}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 fill-indigo-500/20" />
                <span className="hidden sm:inline">DARK THEME</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">LIGHT THEME</span>
              </>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
