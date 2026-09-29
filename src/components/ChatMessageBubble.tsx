import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, AlertCircle, RefreshCw } from 'lucide-react';
import { Message, LikeStatus } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { sound } from '../utils/sound';

interface ChatMessageBubbleProps {
  message: Message;
  onRetry?: () => void;
  onLikeToggle?: (messageId: string, status: LikeStatus) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onRetry,
  onLikeToggle,
}) => {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      sound.hapticTap();
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const handleLike = () => {
    sound.hapticTap();
    const newStatus = message.likeStatus === 'liked' ? null : 'liked';
    onLikeToggle?.(message.id, newStatus);
  };

  const handleDislike = () => {
    sound.hapticTap();
    const newStatus = message.likeStatus === 'disliked' ? null : 'disliked';
    onLikeToggle?.(message.id, newStatus);
  };

  return (
    <div className={`flex flex-col mb-4 px-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isUser ? (
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs">
            <img
              src="https://i.ibb.co/wNzxPt3H/Chat-GPT-Image-Sep-29-2026-11-19-51-AM.png"
              alt="ChatBai"
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {/* Message Content Container */}
        <div className="flex flex-col">
          {/* Sender label for AI */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-1 text-[11px] text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">ChatBai</span>
              <span>·</span>
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}

          {/* Bubble */}
          <div
            className={`rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed transition-all ${
              isUser
                ? 'bg-[var(--user-bubble-bg)] text-[var(--user-bubble-text)] border border-[var(--user-bubble-border)] rounded-tr-xs shadow-xs'
                : isError
                ? 'bg-red-500/10 border border-red-500/30 text-red-500 rounded-tl-xs'
                : 'bg-transparent text-[var(--text-primary)]'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap select-text">{message.content}</p>
            ) : isError ? (
              <div className="flex items-start gap-2 text-red-500">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                <div>
                  <p className="text-xs font-medium">Adunay gamayng problema, bai.</p>
                  <p className="text-xs text-red-400 mt-1">{message.content}</p>
                  {onRetry && (
                    <button
                      onClick={() => {
                        sound.hapticTap();
                        onRetry();
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Suwayi Pag-usab</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <MarkdownRenderer content={message.content} />
                {isStreaming && (
                  <div className="inline-flex items-center gap-1 mt-2 text-[#F59E0B] text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-[var(--text-secondary)] ml-1">Naghunahuna...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar under AI response */}
          {!isUser && !isError && message.content && (
            <div className="flex items-center gap-1 mt-1 text-[var(--text-secondary)] text-xs">
              <button
                onClick={handleCopy}
                className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors cursor-pointer active:scale-95"
                title="Kopyaha ang tubag"
                aria-label="Kopyaha"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={handleLike}
                className={`min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer active:scale-95 ${
                  message.likeStatus === 'liked'
                    ? 'text-emerald-500'
                    : 'hover:text-[var(--text-primary)]'
                }`}
                title="Nakatabang kini"
                aria-label="Like"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDislike}
                className={`min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer active:scale-95 ${
                  message.likeStatus === 'disliked'
                    ? 'text-red-500'
                    : 'hover:text-[var(--text-primary)]'
                }`}
                title="Wala nakatabang"
                aria-label="Dislike"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
