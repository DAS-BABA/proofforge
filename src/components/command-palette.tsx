'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Monitor, Code, User, Settings, Layers, BarChart2, ShieldAlert, X } from 'lucide-react';
import { useTheme, PORTFOLIO_THEMES } from '@/components/theme-provider';
import { storage } from '@/utils/storage';

interface PaletteItem {
  icon: React.ReactNode;
  title: string;
  category: 'Navigation' | 'Themes' | 'Actions';
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { activePortfolioTheme, setPortfolioTheme } = useTheme();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearch('');
    }
  }, [isOpen]);

  const items: PaletteItem[] = [
    // Navigation
    {
      icon: <Monitor className="w-4 h-4 text-forest-accent" />,
      title: 'Go to Landing Page',
      category: 'Navigation',
      action: () => { router.push('/'); setIsOpen(false); }
    },
    {
      icon: <User className="w-4 h-4 text-forest-accent" />,
      title: 'Go to Login / Session settings',
      category: 'Navigation',
      action: () => { router.push('/login'); setIsOpen(false); }
    },
    {
      icon: <Settings className="w-4 h-4 text-forest-accent" />,
      title: 'Go to Dashboard Overview',
      category: 'Navigation',
      action: () => { router.push('/dashboard'); setIsOpen(false); }
    },
    {
      icon: <Layers className="w-4 h-4 text-forest-accent" />,
      title: 'Open Portfolio Live Customizer',
      category: 'Navigation',
      action: () => { router.push('/dashboard/customizer'); setIsOpen(false); }
    },
    {
      icon: <ShieldAlert className="w-4 h-4 text-forest-accent" />,
      title: 'Open Admin Dashboard Panel',
      category: 'Navigation',
      action: () => { router.push('/admin'); setIsOpen(false); }
    },
    // Actions
    {
      icon: <Code className="w-4 h-4 text-forest-accent" />,
      title: 'View Active Demo Portfolio',
      category: 'Actions',
      action: () => { router.push('/portfolio/proof_forge_demo'); setIsOpen(false); }
    },
    // Themes
    ...PORTFOLIO_THEMES.map((theme) => ({
      icon: <div className="w-3 h-3 rounded-full bg-forest-primary" />,
      title: `Switch Portfolio Theme: ${theme.name}`,
      category: 'Themes' as const,
      action: () => {
        setPortfolioTheme(theme.id);
        setIsOpen(false);
      }
    }))
  ];

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-40 bg-charcoal-card border border-charcoal-border hover:border-forest-primary text-charcoal-text-muted hover:text-foreground px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs font-mono transition-all duration-200 glass-panel shadow-2xl cursor-pointer"
    >
      <Search className="w-3.5 h-3.5 text-forest-accent" />
      <span>Cmd + K</span>
    </button>
  );

  // Group items by category
  const categories = Array.from(new Set(filteredItems.map(item => item.category)));

  // Calculate cumulative index for keyboard selection list mapping
  let itemCounter = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal-bg/70 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />

      {/* Palette Container */}
      <div 
        ref={containerRef}
        className="w-full max-w-xl bg-charcoal-card border border-charcoal-border rounded-xl shadow-2xl flex flex-col overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-100 max-h-[50vh]"
      >
        <div className="flex items-center gap-2 px-4 border-b border-charcoal-border py-3">
          <Search className="w-4 h-4 text-forest-accent shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Search commands, navigate or select themes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-0 outline-none text-sm text-foreground placeholder-charcoal-text-muted focus:ring-0 focus:outline-none"
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="text-charcoal-text-muted hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-sm text-charcoal-text-muted">
              No matching commands or actions found.
            </div>
          ) : (
            categories.map((category) => {
              const categoryItems = filteredItems.filter(i => i.category === category);
              return (
                <div key={category} className="mb-2">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-forest-accent px-3 py-1.5 font-bold">
                    {category}
                  </div>
                  <div className="space-y-0.5">
                    {categoryItems.map((item) => {
                      const overallIndex = itemCounter++;
                      const isSelected = overallIndex === selectedIndex;
                      
                      return (
                        <button
                          key={item.title}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(overallIndex)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                            isSelected 
                              ? 'bg-forest-primary/25 border border-forest-primary/40 text-foreground' 
                              : 'border border-transparent text-charcoal-text-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {item.icon}
                            <span>{item.title}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-mono text-forest-accent bg-forest-primary/20 px-1.5 py-0.5 rounded border border-forest-primary/30">
                              Enter
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-charcoal-border px-4 py-2.5 bg-charcoal-light/30 flex items-center justify-between text-[11px] font-mono text-charcoal-text-muted shrink-0">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <div>ESC to close</div>
        </div>
      </div>
    </div>
  );
}
