import { Platform } from 'react-native';

// ─── API ────────────────────────────────────────────────────────────────────
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';

// ─── Chat ────────────────────────────────────────────────────────────────────
export const DEFAULT_ROOM = 'global';
export const MESSAGE_MAX_LENGTH = 2000;
export const HISTORY_LIMIT = 50;

// ─── Typing indicator ────────────────────────────────────────────────────────
export const TYPING_STOP_DELAY_MS = 1500;

// ─── Avatar Gradient Pairs (start, end) ──────────────────────────────────────
export const AVATAR_GRADIENTS = [
  ['#00D4FF', '#0077B6'],
  ['#7C3AED', '#C026D3'],
  ['#F97316', '#EF4444'],
  ['#10B981', '#0D9488'],
  ['#F59E0B', '#EF4444'],
  ['#6366F1', '#8B5CF6'],
  ['#EC4899', '#F43F5E'],
  ['#14B8A6', '#3B82F6'],
  ['#A855F7', '#EC4899'],
  ['#22D3EE', '#818CF8'],
];

// Flat colours for avatars
export const AVATAR_COLORS = [
  '#00D4FF','#7C3AED','#F97316','#10B981','#F59E0B',
  '#6366F1','#EC4899','#14B8A6','#A855F7','#22D3EE',
];

// ─── Premium Design System ──────────────────────────────────────────────────
export const COLORS = {
  // ── Core Backgrounds ──
  bgBase:        '#080C14',   // deepest background
  bgSurface:     '#0D1117',   // cards, screens
  bgElevated:    '#161B27',   // elevated panels
  bgFloat:       '#1C2333',   // floating elements, header
  bgInput:       '#1C2333',   // input container bar
  bgInputField:  '#232B3E',   // text field background
  bgBubbleMine:  '#0D3B5E',   // own message bubble
  bgBubbleOther: '#1C2333',   // others' message bubble
  bgOverlay:     'rgba(8,12,20,0.85)',

  // ── Accent / Brand ──
  accentCyan:    '#00D4FF',   // primary accent
  accentCyanDim: '#0094B5',
  accentViolet:  '#7C3AED',
  accentPurple:  '#A855F7',
  accentGreen:   '#10B981',
  accentRed:     '#EF4444',
  accentAmber:   '#F59E0B',
  accentOrange:  '#F97316',

  // ── Text ──
  textPrimary:   '#E8EDF5',
  textSecondary: '#8B95A8',
  textMuted:     '#4B566B',
  textInverse:   '#080C14',

  // ── Borders / Dividers ──
  border:        '#1F2A40',
  borderActive:  '#00D4FF',
  borderGlass:   'rgba(255,255,255,0.07)',
  divider:       '#141C2A',

  // ── Status ──
  statusOnline:  '#10B981',
  statusAway:    '#F59E0B',
  statusOffline: '#4B566B',

  // ── Glow ──
  glowCyan:      'rgba(0,212,255,0.18)',
  glowViolet:    'rgba(124,58,237,0.18)',
  glowGreen:     'rgba(16,185,129,0.18)',

  // ── Whites ──
  white:         '#FFFFFF',
  white10:       'rgba(255,255,255,0.10)',
  white06:       'rgba(255,255,255,0.06)',
  white03:       'rgba(255,255,255,0.03)',
};

// ─── Gradients ──────────────────────────────────────────────────────────────
export const GRADIENTS = {
  loginBg:       ['#080C14', '#0D1B35', '#0C0F1E'],
  header:        ['#0D1117', '#161B27'],
  bubbleMine:    ['#0D3B5E', '#0A2A45'],
  sendButton:    ['#00D4FF', '#0094B5'],
  loginCard:     ['#111827', '#1C2333'],
  accentCyan:    ['#00D4FF', '#0094B5'],
  accentViolet:  ['#7C3AED', '#A855F7'],
};

// ─── Typography ─────────────────────────────────────────────────────────────
export const FONTS = {
  light:    '300',
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  black:    '900',
};

// ─── Spacing & Radius ───────────────────────────────────────────────────────
export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const SHADOW = {
  cyanGlow: Platform.select({
    web: {
      boxShadow: '0 0 16px rgba(0, 212, 255, 0.35)',
    },
    default: {
      shadowColor: '#00D4FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 12,
    },
  }),
  violetGlow: Platform.select({
    web: {
      boxShadow: '0 0 16px rgba(124, 58, 237, 0.35)',
    },
    default: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 12,
    },
  }),
  card: Platform.select({
    web: {
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 24,
      elevation: 16,
    },
  }),
};
