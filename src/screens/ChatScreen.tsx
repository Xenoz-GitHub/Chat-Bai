import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, MessageSquare, Trash2, X, Plus, Clock, Sparkles } from 'lucide-react';
import { Conversation, Message, LikeStatus } from '../types/chat';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ChatInputArea } from '../components/ChatInputArea';
import {
  AsyncStorage,
  STORAGE_KEY_CONVERSATIONS,
  STORAGE_KEY_ACTIVE_CONV,
  EXPIRATION_MS,
  loadActiveConversations,
  formatTimeRemaining,
} from '../utils/storage';
import { sound } from '../utils/sound';

export const ChatScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load valid conversations (filtering out any > 24 hours old)
  useEffect(() => {
    const initConversations = async () => {
      const active = await loadActiveConversations();
      const lastActiveId = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_CONV);

      if (active.length > 0) {
        setConversations(active);
        if (lastActiveId && active.some((c) => c.id === lastActiveId)) {
          setActiveConvId(lastActiveId);
        } else {
          setActiveConvId(active[0].id);
        }
      } else {
        const now = Date.now();
        const fresh: Conversation = {
          id: 'conv-' + now,
          title: 'Bag-ong Estorya',
          createdAt: now,
          updatedAt: now,
          expiresAt: now + EXPIRATION_MS,
          messages: [],
        };
        setConversations([fresh]);
        setActiveConvId(fresh.id);
        await AsyncStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify([fresh]));
        await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_CONV, fresh.id);
      }
    };

    initConversations();
  }, []);

  // Save conversations to storage
  useEffect(() => {
    if (conversations.length > 0) {
      AsyncStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save active conversation id
  useEffect(() => {
    if (activeConvId) {
      AsyncStorage.setItem(STORAGE_KEY_ACTIVE_CONV, activeConvId);
    }
  }, [activeConvId]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const messages = activeConversation?.messages || [];

  // Scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 180);
  };

  const scrollToBottom = () => {
    sound.hapticTap();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewChat = () => {
    sound.hapticTap();
    const now = Date.now();
    const newConv: Conversation = {
      id: 'conv-' + now,
      title: 'Bag-ong Estorya',
      createdAt: now,
      updatedAt: now,
      expiresAt: now + EXPIRATION_MS,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setHistoryOpen(false);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.hapticTap();
    const remaining = conversations.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const now = Date.now();
      const freshConv: Conversation = {
        id: 'conv-' + now,
        title: 'Bag-ong Estorya',
        createdAt: now,
        updatedAt: now,
        expiresAt: now + EXPIRATION_MS,
        messages: [],
      };
      setConversations([freshConv]);
      setActiveConvId(freshConv.id);
    } else {
      setConversations(remaining);
      if (activeConvId === id) {
        setActiveConvId(remaining[0].id);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !activeConvId) return;

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      status: 'done',
    };

    const assistantPlaceholderId = 'msg-' + (Date.now() + 1);
    const assistantPlaceholder: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      status: 'streaming',
    };

    const currentConv = conversations.find((c) => c.id === activeConvId);
    const updatedTitle =
      currentConv && currentConv.messages.length === 0
        ? text.slice(0, 26) + (text.length > 26 ? '...' : '')
        : currentConv?.title || 'Estorya';

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            title: updatedTitle,
            updatedAt: Date.now(),
            messages: [...c.messages, userMessage, assistantPlaceholder],
          };
        }
        return c;
      })
    );

    setIsLoading(true);

    try {
      const allMessages = currentConv
        ? [...currentConv.messages, userMessage]
        : [userMessage];

      const apiMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No readable stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                accumulatedText += data.text;
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id === activeConvId) {
                      return {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === assistantPlaceholderId
                            ? { ...m, content: accumulatedText }
                            : m
                        ),
                      };
                    }
                    return c;
                  })
                );
              }
            } catch {
              if (dataStr && dataStr !== '[DONE]') {
                accumulatedText += dataStr;
              }
            }
          }
        }
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content: accumulatedText || 'Sige bai! Unsa pay akong ikatabang nimo?',
                      status: 'done',
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
      sound.playReceive();
      sound.hapticReceive();
    } catch (error: any) {
      console.error('Chat error:', error);
      sound.hapticError();
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content:
                        'Pasayloa bai, adunay gamayng problema sa koneksyon. Palihug suwayi pag-usab.',
                      status: 'error',
                      errorMessage: error?.message,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeToggle = (messageId: string, status: LikeStatus) => {
    sound.hapticTap();
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, likeStatus: status } : m
            ),
          };
        }
        return c;
      })
    );
  };

  const quickStarters = [
    'Nganong nahimo kag meme bai? Trending kaayo ka!',
    'Unsaon pag-budget sa inadlaw nga gasto ug sweldo bai?',
    'Unsa ang photosynthesis? I-explain sa Bisaya.',
  ];

  const timeRemainingText = activeConversation
    ? formatTimeRemaining(activeConversation.expiresAt)
    : '24h auto-delete';

  return (
    <div className="relative flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden transition-colors">
      {/* Fixed Mobile Header */}
      <ChatHeader
        onOpenHistory={() => {
          sound.hapticTap();
          setHistoryOpen(true);
        }}
        onNewChat={createNewChat}
        timeRemainingText={timeRemainingText}
      />

      {/* Messages Scroll Area with Sleek Minimalist Scrollbar */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pt-3 pb-3 space-y-1 transition-colors"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center max-w-md mx-auto">
            {/* Minimal Logo */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-md">
              <img
                src="https://i.ibb.co/wNzxPt3H/Chat-GPT-Image-Sep-29-2026-11-19-51-AM.png"
                alt="ChatBai Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="font-semibold text-lg text-[var(--text-primary)] tracking-tight">
              ChatBai
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Unsay atong chika o hisgotan karon, bai?
            </p>

            {/* Subtle 24h Expiration Note */}
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Awtomatikong mapapas ang tanang estorya sa 24 ka oras.</span>
            </div>

            {/* Subtle Starter Prompts */}
            <div className="w-full mt-6 space-y-2 text-left">
              {quickStarters.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    sound.hapticTap();
                    handleSendMessage(starter);
                  }}
                  className="w-full p-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-center justify-between transition-all group text-left cursor-pointer active:scale-[0.99] shadow-2xs"
                >
                  <span className="truncate">{starter}</span>
                  <Sparkles className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[#F59E0B] shrink-0 ml-2 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              onRetry={() => {
                sound.hapticTap();
                const lastUserMsg = [...messages]
                  .reverse()
                  .find((m) => m.role === 'user');
                if (lastUserMsg) {
                  handleSendMessage(lastUserMsg.content);
                }
              }}
              onLikeToggle={handleLikeToggle}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 z-20 w-9 h-9 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-lg flex items-center justify-center hover:bg-[var(--bg-elevated)] transition-all cursor-pointer active:scale-95"
          title="Ubos"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Persistent Sticky Composer */}
      <ChatInputArea onSendMessage={handleSendMessage} isLoading={isLoading} />

      {/* History Slide-Over Drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => {
              sound.hapticTap();
              setHistoryOpen(false);
            }}
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85%] h-full bg-[var(--bg-app)] border-r border-[var(--border-color)] shadow-2xl flex flex-col z-10 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                  Mga Estorya
                </h3>
              </div>
              <button
                onClick={() => {
                  sound.hapticTap();
                  setHistoryOpen(false);
                }}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label="Isira"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-3 border-b border-[var(--border-color)]">
              <button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F17] font-semibold text-xs transition-colors cursor-pointer active:scale-95 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Bag-ong Estorya</span>
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const remaining = formatTimeRemaining(conv.expiresAt);
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      sound.hapticTap();
                      setActiveConvId(conv.id);
                      setHistoryOpen(false);
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                      isActive
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] font-medium shadow-2xs'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate text-[var(--text-primary)]">
                        {conv.title}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-[#F59E0B]" />
                        <span>{remaining}</span>
                      </span>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 rounded transition-opacity cursor-pointer"
                      title="Papasa"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Privacy notice footer */}
            <div className="p-3 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 justify-center">
              <Clock className="w-3 h-3 text-[#F59E0B]" />
              <span>Awtomatikong mapapas sa 24h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
