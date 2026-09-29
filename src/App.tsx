import React, { useState, useEffect } from 'react';
import { TabType } from './types/chat';
import { ChatScreen } from './screens/ChatScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { initTheme } from './utils/theme';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('chat');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    // Initialize ChatGPT-style Theme Manager (System, Light, Dark)
    initTheme();
  }, []);

  const handleClearAllChats = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="w-full min-h-[100dvh] h-[100dvh] bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col overflow-hidden antialiased transition-colors duration-200">
      {/* Centered responsive container (edge-to-edge on mobile, max-w-2xl on desktop) */}
      <div className="w-full max-w-2xl mx-auto h-full flex flex-col sm:border-x sm:border-[var(--border-color)]/50 bg-[var(--bg-app)] overflow-hidden transition-colors">
        {/* Main Content View */}
        <main className="flex-1 overflow-hidden relative">
          {currentTab === 'chat' ? (
            <ChatScreen key={refreshKey} />
          ) : (
            <SettingsScreen onClearAllChats={handleClearAllChats} />
          )}
        </main>

        {/* Minimal 2-Item Bottom Navigation */}
        <BottomNavigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
        />
      </div>
    </div>
  );
}
