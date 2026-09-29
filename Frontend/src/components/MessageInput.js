import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform
} from 'react-native';
import { COLORS, MESSAGE_MAX_LENGTH, TYPING_STOP_DELAY_MS } from '../utils/constants';

/**
 * MessageInput — fixed bottom input bar with send button.
 * Calls onTypingStart / onTypingStop for debounced typing indicators.
 * Calls onSend(text) when the user submits.
 *
 * @param {{ onSend, onTypingStart, onTypingStop, disabled }} props
 */
const MessageInput = ({ onSend, onTypingStart, onTypingStop, disabled }) => {
  const [text, setText] = useState('');
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleChangeText = useCallback(
    (value) => {
      setText(value);

      if (!value.trim()) {
        // Cleared — stop typing immediately
        if (isTypingRef.current) {
          isTypingRef.current = false;
          clearTimeout(typingTimerRef.current);
          onTypingStop?.();
        }
        return;
      }

      // Emit typing:start (idempotent — server deduplicates)
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStart?.();
      }

      // Reset debounce timer
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

    // Stop typing indicator
    clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }

    setText('');
    onSend(trimmed);
  }, [text, disabled, onSend, onTypingStop]);

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSend}
          placeholder="Message..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
          maxLength={MESSAGE_MAX_LENGTH}
          returnKeyType="send"
          blurOnSubmit={false}
          editable={!disabled}
        />
      </View>

      <TouchableOpacity
        style={[styles.sendButton, canSend ? styles.sendButtonActive : styles.sendButtonInactive]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.8}
      >
        <Text style={styles.sendIcon}>➤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: COLORS.bgInput,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.bgInputField,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  input: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 21,
    padding: 0,
    margin: 0
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    flexShrink: 0
  },
  sendButtonActive: {
    backgroundColor: COLORS.accentGreen,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4
  },
  sendButtonInactive: {
    backgroundColor: COLORS.bgInputField,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  sendIcon: {
    fontSize: 18,
    color: COLORS.white,
    marginLeft: 2
  }
});

export default MessageInput;
