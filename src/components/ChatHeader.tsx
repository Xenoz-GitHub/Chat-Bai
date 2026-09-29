import React from 'react';
import { History, Plus, Clock } from 'lucide-react';
import { sound } from '../utils/sound';

interface ChatHeaderProps {
  onOpenHistory: () => void;
  onNewChat: () => void;
  timeRemainingText?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onOpenHistory,
  onNewChat,
  timeRemainingText,
}) => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 bg-[var(--bg-app,#0B0F17)]/95 backdrop-blur-md border-b border-[var(--border-color,#263143)] select-none transition-colors">
      {/* Brand & 24h indicator */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[var(--border-color,#263143)] bg-[var(--bg-surface,#151D2B)] shadow-xs">
          <img
            src="https://i.ibb.co/wNzxPt3H/Chat-GPT-Image-Sep-29-2026-11-19-51-AM.png"
            alt="ChatBai"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-[var(--text-primary,#F8FAFC)] tracking-tight">
              ChatBai
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Online" />
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary,#94A3B8)]">
            <Clock className="w-3 h-3 text-[#F59E0B]" />
            <span>{timeRemainingText || 'Auto-delete sa 24h'}</span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            sound.hapticTap();
            onOpenHistory();
          }}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#F8FAFC)] hover:bg-[var(--bg-surface,#151D2B)] transition-colors cursor-pointer"
          title="Mga Estorya (History)"
          aria-label="History"
        >
          <History className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            sound.hapticTap();
            onNewChat();
          }}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#F8FAFC)] hover:bg-[var(--bg-surface,#151D2B)] transition-colors cursor-pointer"
          title="Bag-ong Estorya (New Chat)"
          aria-label="Bag-ong Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
