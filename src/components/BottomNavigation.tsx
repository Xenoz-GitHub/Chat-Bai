import React from 'react';
import { MessageSquare, Settings } from 'lucide-react';
import { TabType } from '../types/chat';
import { sound } from '../utils/sound';

interface BottomNavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs = [
    {
      id: 'chat' as TabType,
      label: 'Chat',
      icon: MessageSquare,
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleTabClick = (tabId: TabType) => {
    sound.hapticLight();
    onSelectTab(tabId);
  };

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation"
      className="shrink-0 z-20 border-t border-[var(--border-color,#263143)] bg-[var(--bg-app,#0B0F17)]/95 backdrop-blur-md px-6 pt-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-colors"
    >
      <div className="grid grid-cols-2 max-w-sm mx-auto h-12 items-center">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center relative py-1 rounded-xl transition-colors duration-150 cursor-pointer ${
                isActive
                  ? 'text-[#F59E0B] font-medium'
                  : 'text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#F8FAFC)]'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[11px] tracking-tight mt-0.5">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#F59E0B]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
