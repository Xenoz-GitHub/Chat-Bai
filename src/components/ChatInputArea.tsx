import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { sound } from '../utils/sound';

interface ChatInputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  onSendMessage,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [input]);

  const toggleRecording = () => {
    sound.hapticTap();

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fil-PH';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    sound.hapticSend(); // Haptic feedback on send
    sound.playSend();
    onSendMessage(trimmed);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="shrink-0 bg-[var(--bg-app,#0B0F17)]/95 border-t border-[var(--border-color,#263143)] px-3 py-2 transition-colors">
      <div className="max-w-2xl mx-auto flex items-end gap-2 bg-[var(--bg-surface,#151D2B)] border border-[var(--border-color,#263143)] rounded-2xl p-1.5 focus-within:border-[#F59E0B]/60 transition-colors">
        {/* Voice Input Button */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
            isRecording
              ? 'text-red-400 bg-red-950/40 animate-pulse'
              : 'text-[var(--text-secondary,#94A3B8)] hover:text-[var(--text-primary,#F8FAFC)]'
          }`}
          title={isRecording ? 'Paminaw...' : 'Tingog (Voice)'}
          aria-label="Microphone"
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pangutana kang ChatBai..."
          rows={1}
          className="flex-1 max-h-28 bg-transparent text-[var(--text-primary,#F8FAFC)] placeholder-[var(--text-secondary,#94A3B8)] text-[15px] leading-relaxed resize-none focus:outline-hidden py-2 px-1 select-text"
        />

        {/* Send Button */}
        <button
          type="button"
          disabled={!canSend}
          onClick={handleSend}
          className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer ${
            canSend
              ? 'bg-[#F59E0B] text-[#0B0F17] hover:bg-[#D97706] active:scale-95 shadow-sm'
              : 'text-[var(--text-secondary,#94A3B8)]/40 cursor-not-allowed'
          }`}
          title="Ipadala (Send)"
          aria-label="Send"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
