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
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, RADIUS, FONTS, TYPING_STOP_DELAY_MS, MESSAGE_MAX_LENGTH } from '../utils/constants';

/**
 * Premium MessageInput — frosted glass input bar with animated send button.
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
      Animated.spring(sendScale, { toValue: 0.82, speed: 80, useNativeDriver: true }),
      Animated.spring(sendScale, { toValue: 1,    speed: 80, useNativeDriver: true }),
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
      {/* Separator line */}
      <LinearGradient
        colors={['transparent', COLORS.accentCyan, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topLine}
      />

      <View style={styles.row}>
        {/* Input pill */}
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
        </View>

        {/* Send button */}
        <Animated.View style={[styles.sendWrap, { transform: [{ scale: sendScale }] }]}>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canSend ? [COLORS.accentCyan, '#0094B5'] : [COLORS.bgInputField, COLORS.bgInputField]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              <Text style={[styles.sendIcon, !canSend && styles.sendIconOff]}>
                {canSend ? '▲' : '▲'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgInput,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  topLine: {
    height: 1,
    opacity: 0.35,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    gap: 10,
  },
  inputPill: {
    flex: 1,
    backgroundColor: COLORS.bgInputField,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 11,
    minHeight: 46,
    maxHeight: 130,
    justifyContent: 'center',
  },
  inputPillFocused: {
    borderColor: COLORS.accentCyan,
    shadowColor: COLORS.accentCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  input: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 21,
    padding: 0,
    margin: 0,
    fontWeight: FONTS.regular,
  },
  sendWrap: {},
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: FONTS.bold,
  },
  sendIconOff: { color: COLORS.textMuted },
});

export default MessageInput;
