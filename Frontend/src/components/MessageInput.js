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

// ── Pure View-based Icons (zero dependency, cross-platform) ───────────────────

/** Plus icon — two perpendicular bars */
const PlusIcon = ({ size = 20, color = '#8B95A8' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ position: 'absolute', width: size * 0.55, height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ position: 'absolute', width: 2, height: size * 0.55, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

/** Smiley outline icon — circle + two eyes + smile arc */
const SmileyIcon = ({ size = 20, color = '#4B566B' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 1.8, borderColor: color,
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Eyes */}
      <View style={{ flexDirection: 'row', gap: size * 0.22, marginTop: -size * 0.06 }}>
        <View style={{ width: size * 0.12, height: size * 0.12, borderRadius: size * 0.06, backgroundColor: color }} />
        <View style={{ width: size * 0.12, height: size * 0.12, borderRadius: size * 0.06, backgroundColor: color }} />
      </View>
      {/* Smile */}
      <View style={{
        width: size * 0.4, height: size * 0.2, borderBottomLeftRadius: size * 0.2,
        borderBottomRightRadius: size * 0.2, borderBottomWidth: 1.8,
        borderLeftWidth: 1.8, borderRightWidth: 1.8,
        borderColor: color, marginTop: size * 0.04,
      }} />
    </View>
  </View>
);

/** Mic outline icon — pill shape + stand */
const MicIcon = ({ size = 20, color = '#8B95A8' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Mic body */}
    <View style={{
      width: size * 0.35, height: size * 0.5,
      borderRadius: size * 0.175, borderWidth: 1.8,
      borderColor: color, position: 'absolute', top: size * 0.05,
    }} />
    {/* Arc */}
    <View style={{
      width: size * 0.55, height: size * 0.35,
      borderBottomLeftRadius: size * 0.275, borderBottomRightRadius: size * 0.275,
      borderBottomWidth: 1.8, borderLeftWidth: 1.8, borderRightWidth: 1.8,
      borderColor: color, position: 'absolute', top: size * 0.3,
    }} />
    {/* Stand */}
    <View style={{
      width: 1.8, height: size * 0.15, backgroundColor: color,
      position: 'absolute', bottom: size * 0.05,
    }} />
  </View>
);

/** Arrow Up icon — clean upward arrow */
const ArrowUpIcon = ({ size = 18, color = '#fff' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Shaft */}
    <View style={{ width: 2.2, height: size * 0.6, backgroundColor: color, borderRadius: 1 }} />
    {/* Left wing */}
    <View style={{
      position: 'absolute', top: size * 0.15, width: size * 0.35, height: 2.2,
      backgroundColor: color, borderRadius: 1,
      transform: [{ rotate: '45deg' }], left: size * 0.15,
    }} />
    {/* Right wing */}
    <View style={{
      position: 'absolute', top: size * 0.15, width: size * 0.35, height: 2.2,
      backgroundColor: color, borderRadius: 1,
      transform: [{ rotate: '-45deg' }], right: size * 0.15,
    }} />
  </View>
);

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
    backgroundColor: COLORS.bgInputField,
  },
});

export default MessageInput;

