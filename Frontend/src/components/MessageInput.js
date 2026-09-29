import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
  Animated,
} from 'react-native';
import { COLORS, FONTS, TYPING_STOP_DELAY_MS, MESSAGE_MAX_LENGTH } from '../utils/constants';
import { nd } from '../utils/platform';

// ── Ultra-crisp Vector Icons (Web SVG + Native View fallback) ────────────────

/** Plus Icon */
const PlusIcon = ({ size = 20, color = '#8B95A8' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  }
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size * 0.7, height: 2.2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', width: 2.2, height: size * 0.7, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
};

/** Smiley outline icon */
const SmileyIcon = ({ size = 20, color = '#4B566B' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    );
  }
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: 1.8, borderColor: color,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <View style={{ flexDirection: 'row', gap: size * 0.22, marginTop: -size * 0.08 }}>
          <View style={{ width: size * 0.12, height: size * 0.12, borderRadius: size * 0.06, backgroundColor: color }} />
          <View style={{ width: size * 0.12, height: size * 0.12, borderRadius: size * 0.06, backgroundColor: color }} />
        </View>
        <View style={{
          width: size * 0.44, height: size * 0.22,
          borderBottomLeftRadius: size * 0.22, borderBottomRightRadius: size * 0.22,
          borderBottomWidth: 1.8, borderColor: color,
          marginTop: size * 0.05,
        }} />
      </View>
    </View>
  );
};

/** Mic outline icon */
const MicIcon = ({ size = 20, color = '#8B95A8' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    );
  }
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size * 0.36, height: size * 0.52, borderRadius: size * 0.18,
        borderWidth: 1.8, borderColor: color, position: 'absolute', top: size * 0.06,
      }} />
      <View style={{
        width: size * 0.6, height: size * 0.38,
        borderBottomLeftRadius: size * 0.3, borderBottomRightRadius: size * 0.3,
        borderBottomWidth: 1.8, borderLeftWidth: 1.8, borderRightWidth: 1.8,
        borderColor: color, position: 'absolute', top: size * 0.26,
      }} />
      <View style={{
        width: 1.8, height: size * 0.18, backgroundColor: color,
        position: 'absolute', bottom: size * 0.08,
      }} />
      <View style={{
        width: size * 0.36, height: 1.8, backgroundColor: color, borderRadius: 1,
        position: 'absolute', bottom: size * 0.07,
      }} />
    </View>
  );
};

/** Upward Arrow / Send icon — clean arrow pointing UP */
const ArrowUpIcon = ({ size = 18, color = '#fff' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    );
  }
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size * 0.42,
        height: size * 0.42,
        borderTopWidth: 2.2,
        borderLeftWidth: 2.2,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginBottom: -size * 0.14,
        borderTopLeftRadius: 1.5,
      }} />
      <View style={{ width: 2.2, height: size * 0.5, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
};

/**
 * Premium MessageInput — flagship composer dock with attach, emoji, mic, and send.
 */
const MessageInput = ({ onSend, onTypingStart, onTypingStop, disabled }) => {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const typingTimerRef = useRef(null);
  const isTypingRef   = useRef(false);
  const sendScale     = useRef(new Animated.Value(1)).current;

  const handleChangeText = useCallback(
    (value) => {
      setText(value);
      if (!value.trim()) {
        if (isTypingRef.current) {
          isTypingRef.current = false;
          clearTimeout(typingTimerRef.current);
          onTypingStop?.();
        }
        return;
      }
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStart?.();
      }
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTypingStop?.();
      }, TYPING_STOP_DELAY_MS);
    },
    [onTypingStart, onTypingStop]
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    // Pop animation
    Animated.sequence([
      Animated.spring(sendScale, { toValue: 0.82, speed: 80, useNativeDriver: nd }),
      Animated.spring(sendScale, { toValue: 1,    speed: 80, useNativeDriver: nd }),
    ]).start();

    clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }
    setText('');
    onSend(trimmed);
  }, [text, disabled, onSend, onTypingStop, sendScale]);

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      {/* Top separator */}
      <View style={styles.topLine} />

      <View style={styles.row}>
        {/* Attach button */}
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <PlusIcon size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Input container with inline emoji */}
        <View style={[styles.inputPill, focused && styles.inputPillFocused]}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSend}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={disabled ? 'No connection…' : 'Type a message…'}
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={MESSAGE_MAX_LENGTH}
            returnKeyType="send"
            blurOnSubmit={false}
            editable={!disabled}
            selectionColor={COLORS.accentCyan}
          />
          <TouchableOpacity style={styles.inlineAction} activeOpacity={0.7}>
            <SmileyIcon size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Mic button */}
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <MicIcon size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Send button */}
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.sendBtn,
                canSend ? styles.sendBtnActive : styles.sendBtnInactive,
              ]}
            >
              <ArrowUpIcon size={18} color={canSend ? COLORS.white : COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d121e',
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  topLine: {
    height: 1,
    backgroundColor: COLORS.borderGlass,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white06,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151c2c',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    paddingHorizontal: 14,
    height: 44,
  },
  inputPillFocused: {
    borderColor: 'rgba(0, 210, 255, 0.5)',
    ...Platform.select({
      web: { boxShadow: '0 0 10px rgba(0, 212, 255, 0.2)' },
      default: {
        shadowColor: COLORS.accentCyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    padding: 0,
    margin: 0,
    fontWeight: FONTS.regular,
    maxHeight: 100,
  },
  inlineAction: {
    padding: 4,
    marginLeft: 4,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: COLORS.accentCyan,
    ...Platform.select({
      web: { boxShadow: '0 0 15px rgba(0, 210, 255, 0.4)' },
      default: {
        shadowColor: COLORS.accentCyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 8,
      },
    }),
  },
  sendBtnInactive: {
    backgroundColor: COLORS.white06,
  },
});

export default MessageInput;

