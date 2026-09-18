export type AssistantState =
  | 'disconnected'
  | 'connecting'
  | 'listening'
  | 'speaking'
  | 'error';

export type VoiceOption = 'Aoede' | 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir';

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
}

export type AtmosphereTheme =
  | 'cyber-rose'
  | 'electric-violet'
  | 'neon-cyan'
  | 'midnight-gold'
  | 'emerald-matrix';

export interface AtmosphereConfig {
  id: AtmosphereTheme;
  name: string;
  primaryColor: string;
  glowColor: string;
  accentColor: string;
  bgGradient: string;
}

export interface SpecialOccasion {
  id: string;
  title: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'promotion' | 'milestone' | 'holiday' | 'custom';
  notes?: string;
  createdAt: number;
}

export interface CelebrationEvent {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: number;
}

export interface RealTimeWishEvent {
  id: string;
  wishType: string;
  message: string;
  timestamp: number;
}

export interface ToolCallEvent {
  id: string;
  name: string;
  args: Record<string, any>;
  timestamp: number;
  completed?: boolean;
}

export interface LiveServerMessage {
  type: 'status' | 'audio' | 'interrupted' | 'turnComplete' | 'toolCall' | 'wish' | 'error';
  state?: AssistantState;
  message?: string;
  data?: string; // base64 pcm 24kHz
  id?: string;
  name?: string;
  wishType?: string;
  args?: Record<string, any>;
}

