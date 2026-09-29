/**
 * App-wide constants and configuration
 *
 * EXPO_PUBLIC_ vars are bundled at build time by Expo.
 * See .env.example for how to set the correct URL for each environment.
 */

// ─── API ────────────────────────────────────────────────────────────────────
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';

// ─── Chat ────────────────────────────────────────────────────────────────────
export const DEFAULT_ROOM = 'global';
export const MESSAGE_MAX_LENGTH = 2000;
export const HISTORY_LIMIT = 50; // messages loaded on mount

// ─── Typing indicator ────────────────────────────────────────────────────────
export const TYPING_STOP_DELAY_MS = 1500; // debounce: stop after 1.5 s idle

// ─── Avatar color palette ─────────────────────────────────────────────────────
export const AVATAR_COLORS = [
  '#075E54',
  '#128C7E',
  '#25D366',
  '#0284C7',
  '#7C3AED',
  '#DB2777',
  '#EA580C',
  '#059669',
  '#D97706',
  '#4F46E5',
  '#0891B2',
  '#E11D48'
];

// ─── Theme ──────────────────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  bgDark: '#121B22',
  bgChat: '#0B141A',
  bgHeader: '#1F2C34',
  bgInput: '#1F2C34',
  bgInputField: '#2A3942',

  // Bubbles
  bubbleMine: '#005C4B',
  bubbleOther: '#1F2C34',

  // Text
  textPrimary: '#E9EDEF',
  textSecondary: '#8696A0',
  textTimestamp: '#8696A0',

  // Accent
  accentGreen: '#00A884',
  accentGreenLight: '#25D366',
  accentRed: '#E11D48',
  accentBlue: '#53BDEB',

  // Borders
  border: '#2A3942',
  divider: '#222E35',

  // Online
  online: '#25D366',
  offline: '#8696A0',

  // White / Overlays
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.6)'
};
