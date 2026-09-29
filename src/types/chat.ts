export type Role = 'user' | 'assistant' | 'system';

export type LikeStatus = 'liked' | 'disliked' | null;

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  status?: 'sending' | 'streaming' | 'done' | 'error';
  errorMessage?: string;
  likeStatus?: LikeStatus;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number; // 24 hours from creation (createdAt + 24 * 60 * 60 * 1000)
  messages: Message[];
}

export type TabType = 'chat' | 'settings';

export interface ChatBaiSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  enterToSend: boolean;
  autoDeleteHours: number; // fixed at 24
}
