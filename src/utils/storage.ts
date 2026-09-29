/**
 * AsyncStorage-compatible storage interface with automatic 24-Hour expiration
 */
import { Conversation } from '../types/chat';

export const STORAGE_KEY_CONVERSATIONS = 'chatbai_conversations_v2';
export const STORAGE_KEY_ACTIVE_CONV = 'chatbai_active_conv_v2';
export const STORAGE_KEY_SETTINGS = 'chatbai_settings_v2';

export const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      console.error('AsyncStorage getItem error:', e);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('AsyncStorage setItem error:', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('AsyncStorage removeItem error:', e);
    }
  },

  async clear(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
      }
    } catch (e) {
      console.error('AsyncStorage clear error:', e);
    }
  },
};

/**
 * Filter out conversations that have exceeded the 24-hour expiration window
 */
export async function loadActiveConversations(): Promise<Conversation[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_CONVERSATIONS);
  if (!raw) return [];

  try {
    const parsed: Conversation[] = JSON.parse(raw);
    const now = Date.now();

    // Keep only conversations created within the last 24 hours
    const active = parsed.filter((conv) => {
      const expiresAt = conv.expiresAt || (conv.createdAt + EXPIRATION_MS);
      return now < expiresAt;
    });

    // If any were expired and pruned, update storage
    if (active.length !== parsed.length) {
      await AsyncStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(active));
    }

    return active;
  } catch (e) {
    console.error('Failed to parse active conversations:', e);
    return [];
  }
}

/**
 * Format remaining time before 24-hour auto-deletion
 */
export function formatTimeRemaining(expiresAt: number): string {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Mapapas na karon';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m nabilin`;
  }
  return `${minutes}m nabilin`;
}
