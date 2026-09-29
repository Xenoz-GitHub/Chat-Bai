import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Trash2,
  Clock,
  Moon,
  Sun,
  Laptop,
  Info,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { AsyncStorage } from '../utils/storage';
import {
  ThemePreference,
  getStoredThemePreference,
  applyTheme,
} from '../utils/theme';

interface SettingsScreenProps {
  onClearAllChats: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClearAllChats }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);

  useEffect(() => {
    setSoundEnabled(sound.isSoundEnabled());
    setHapticsEnabled(sound.isHapticsEnabled());
    const stored = getStoredThemePreference();
    setThemePreference(stored);
  }, []);

  const handleThemeChange = (pref: ThemePreference) => {
    sound.hapticTap();
    setThemePreference(pref);
    applyTheme(pref);
  };

  const toggleSound = () => {
    sound.hapticTap();
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
    if (next) sound.playTap();
  };

  const toggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    sound.setHapticsEnabled(next);
    if (next) {
      sound.triggerHaptic(30);
    }
  };

  const handleClearConfirm = async () => {
    sound.hapticError();
    await AsyncStorage.clear();
    onClearAllChats();
    setConfirmClearOpen(false);
  };

  const themeOptions: { id: ThemePreference; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'light', label: 'Kahayag (Light)', icon: Sun },
    { id: 'dark', label: 'Ngitngit (Dark)', icon: Moon },
    { id: 'system', label: 'Sistema (Auto)', icon: Laptop },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 bg-[var(--bg-app)]/95 backdrop-blur-md border-b border-[var(--border-color)]">
        <h1 className="font-semibold text-base text-[var(--text-primary)]">
          Settings
        </h1>
      </header>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto w-full no-scrollbar">
        {/* App Profile Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--border-color)] bg-[var(--bg-app)] shrink-0">
            <img
              src="https://i.ibb.co/wNzxPt3H/Chat-GPT-Image-Sep-29-2026-11-19-51-AM.png"
              alt="ChatBai"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-sm text-[var(--text-primary)]">ChatBai</h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-[#F59E0B] font-medium">v1.0</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Imong Maalamon ug Mahigalaong Bisaya AI Buddy
            </p>
          </div>
        </div>

        {/* Section: Appearance (ChatGPT-style Segmented Theme Control) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Panagway (Appearance)
            </span>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-3.5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Tema (Theme)
              </span>
              <span className="text-xs text-[var(--text-secondary)] capitalize">
                {themePreference === 'light' ? 'Light' : themePreference === 'dark' ? 'Dark' : 'System default'}
              </span>
            </div>

            {/* Segmented Pill Selector (ChatGPT style) */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl">
              {themeOptions.map((opt) => {
                const isSelected = themePreference === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleThemeChange(opt.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F59E0B]' : ''}`} />
                    <span className="truncate">{opt.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section: Chat Preferences */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] px-1 uppercase tracking-wider">
            Mensahe ug Audio
          </span>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl divide-y divide-[var(--border-color)] overflow-hidden shadow-xs">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#F59E0B]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[var(--text-secondary)]" />
                )}
                <div>
                  <p className="text-sm text-[var(--text-primary)]">Tingog (Sound)</p>
                  <p className="text-xs text-[var(--text-secondary)]">Audio feedback sa mensahe</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                onClick={toggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  soundEnabled ? 'bg-[#F59E0B]' : 'bg-[var(--border-color)]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Haptics Toggle */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-[#F59E0B]" />
                <div>
                  <p className="text-sm text-[var(--text-primary)]">Haptics (Vibration)</p>
                  <p className="text-xs text-[var(--text-secondary)]">Kurog sa pag-tap ug pagpadala</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hapticsEnabled}
                onClick={toggleHaptics}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  hapticsEnabled ? 'bg-[#F59E0B]' : 'bg-[var(--border-color)]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                    hapticsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section: Privacy & Expiration */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] px-1 uppercase tracking-wider">
            Seguridad ug Privacy
          </span>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)]">
                  24-Hour Auto-Delete
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Ang tanang panag-estorya awtomatikong mapapas human sa 24 ka oras gikan sa paghimo niini alang sa imong pribasiya ug kahilwasan.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-primary)]">Papasa Tanan Karon</p>
                <p className="text-xs text-[var(--text-secondary)]">I-delete dayon ang tanang kasaysayan</p>
              </div>
              <button
                onClick={() => {
                  sound.hapticTap();
                  setConfirmClearOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-950/20 hover:bg-red-900/40 border border-red-500/40 text-red-500 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Papas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section: About */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] px-1 uppercase tracking-wider">
            Bahin sa ChatBai
          </span>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-4 text-xs space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
              <Info className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Cebuano-First Barkada AI</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Dili robot, dili boring! Si ChatBai usa ka cool ug maalamong Bisaya buddy nga kanunay andam makig-vibe, makig-estorya, ug motabang kanimo.
            </p>
            <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
              <span>Bersyon 1.0.0</span>
              <span className="text-emerald-500 font-medium">Aktibo (Production)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                Sigurado ka bai?
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Mawala ang tanang aktibong estorya sa chat history.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  sound.hapticTap();
                  setConfirmClearOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-[var(--bg-elevated)] hover:opacity-80 text-[var(--text-primary)] text-xs font-medium cursor-pointer"
              >
                Kanselahon
              </button>
              <button
                onClick={handleClearConfirm}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Oo, Papasa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
