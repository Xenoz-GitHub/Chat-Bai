import React from 'react';
import { MessageSquare, Compass, BookOpen, Settings } from 'lucide-react';
import { TabType } from '../types/chat';
import { sound } from '../utils/sound';

interface MobileBottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs = [
    {
      id: 'chat' as TabType,
      label: 'Pakig-estorya',
      icon: MessageSquare,
    },
    {
      id: 'topics' as TabType,
      label: 'Mga Topiko',
      icon: Compass,
    },
    {
      id: 'dictionary' as TabType,
      label: 'Diksiyonaryo',
      icon: BookOpen,
    },
    {
      id: 'settings' as TabType,
      label: 'Mga Setting',
      icon: Settings,
    },
  ];

  const handleTabClick = (tabId: TabType) => {
    sound.playTap();
    sound.triggerHaptic(10);
    onSelectTab(tabId);
  };

  return (
    <nav
      role="navigation"
      aria-label="Pangulong Nabigasyon"
      className="shrink-0 z-20 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-lg px-2"
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center relative py-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[72px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Home indicator bar */}
      <div className="w-28 h-1 bg-slate-700/60 rounded-full mx-auto mb-1.5" />
    </nav>
  );
};
