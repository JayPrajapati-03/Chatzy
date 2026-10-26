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
import EmojiPickerBoard from './EmojiPickerBoard';

// ── 1:1 WhatsApp Vector Icons (Crisp Web SVG + Native fallback) ──────────────

/** WhatsApp Official Smiley Outline Icon */
const WhatsAppSmileyIcon = ({ size = 23, color = '#8696A0' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <circle cx="12" cy="12" r="9.5" />
        <path d="M8 13.8c.9 1.8 2.4 2.6 4 2.6s3.1-.8 4-2.6" strokeWidth="1.9" />
        <circle cx="9" cy="9.5" r="1.2" fill={color} stroke="none" />
        <circle cx="15" cy="9.5" r="1.2" fill={color} stroke="none" />
      </svg>
    );
  }
  return <Text style={{ fontSize: 18 }}>😊</Text>;
};

/** WhatsApp Official Paperclip / Attach Icon */
const WhatsAppPaperclipIcon = ({ size = 21, color = '#8696A0' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block', transform: 'rotate(-45deg)' }}
      >
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
    );
  }
  return <Text style={{ fontSize: 18 }}>📎</Text>;
};

/** WhatsApp Official Camera Icon */
const WhatsAppCameraIcon = ({ size = 21, color = '#8696A0' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }
  return <Text style={{ fontSize: 18 }}>📷</Text>;
};

/** WhatsApp Official Voice Note Mic Icon (Authentic WhatsApp dark icon on green) */
const WhatsAppMicIcon = ({ size = 22, color = '#111B21' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        style={{ display: 'block' }}
      >
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
      </svg>
    );
  }
  return <Text style={{ fontSize: 18, color }}>🎙️</Text>;
};

/** WhatsApp Official Paper Airplane Send Icon */
const WhatsAppSendIcon = ({ size = 20, color = '#FFFFFF' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        style={{ display: 'block', marginLeft: 2 }}
      >
        <path d="M1.101 21.757L23.8 12.028 1.101 2.3 1 9.87l15.143 2.158L1 14.186l.101 7.571z" />
      </svg>
    );
  }
  return <Text style={{ fontSize: 16, color }}>➤</Text>;
};

/**
 * Premium MessageInput — 1:1 WhatsApp Composer dock with Attach, Emoji, Mic/Send, and Reply banner.
 */
const MessageInput = ({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled,
  replyingTo,
  onCancelReply,
  onOpenPollModal,
}) => {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
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

  const handleToggleEmoji = useCallback(() => {
    setShowEmojiPicker((prev) => !prev);
  }, []);

  const handleInsertEmoji = useCallback(
    (emoji) => {
      handleChangeText(text + emoji);
    },
    [text, handleChangeText]
  );

  const handleBackspace = useCallback(() => {
    if (!text) return;
    const chars = Array.from(text);
    chars.pop();
    handleChangeText(chars.join(''));
  }, [text, handleChangeText]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    if (trimmed.toLowerCase() === '/poll') {
      setText('');
      setShowEmojiPicker(false);
      onOpenPollModal?.();
      return;
    }

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
    setShowEmojiPicker(false);
    onSend(trimmed, replyingTo);
  }, [text, disabled, onSend, onTypingStop, sendScale, replyingTo, onOpenPollModal]);

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      {/* Quoted Replying Banner */}
      {replyingTo && (
        <View style={styles.replyingBar}>
          <View style={styles.replyingAccent} />
          <View style={styles.replyingContent}>
            <Text style={styles.replyingUser}>
              Replying to @{replyingTo.senderUsername || 'User'}
            </Text>
            <Text style={styles.replyingText} numberOfLines={1}>
              {replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cancelReplyBtn}
            onPress={onCancelReply}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.cancelReplyText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top separator */}
      <View style={styles.topLine} />

      <View style={styles.row}>
        {/* WhatsApp-Style Pill Input: [ 😊 ] [ Message ] [ 📎 ] [ 📷 ] */}
        <View style={[styles.inputPill, focused && styles.inputPillFocused]}>
          {/* WhatsApp Smiley toggle button on LEFT */}
          <TouchableOpacity
            style={styles.inlineActionLeft}
            activeOpacity={0.7}
            onPress={handleToggleEmoji}
          >
            <WhatsAppSmileyIcon
              size={23}
              color={showEmojiPicker ? '#00A884' : '#8696A0'}
            />
          </TouchableOpacity>

          {/* Main Text Input */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSend}
            onFocus={() => {
              setFocused(true);
              setShowEmojiPicker(false);
            }}
            onBlur={() => setFocused(false)}
            placeholder={
              disabled
                ? 'No connection…'
                : replyingTo
                ? 'Type your reply…'
                : 'Message'
            }
            placeholderTextColor="#8696A0"
            multiline
            maxLength={MESSAGE_MAX_LENGTH}
            returnKeyType="send"
            blurOnSubmit={false}
            editable={!disabled}
            selectionColor="#00A884"
          />

          {/* WhatsApp Paperclip (Attach / Poll) button inside pill */}
          <TouchableOpacity
            style={styles.inlineActionIcon}
            activeOpacity={0.7}
            onPress={onOpenPollModal}
          >
            <WhatsAppPaperclipIcon size={21} color="#8696A0" />
          </TouchableOpacity>

          {/* WhatsApp Camera button inside pill */}
          <TouchableOpacity
            style={styles.inlineActionIcon}
            activeOpacity={0.7}
            onPress={onOpenPollModal}
          >
            <WhatsAppCameraIcon size={21} color="#8696A0" />
          </TouchableOpacity>
        </View>

        {/* WhatsApp-Style Circular Action Button: Green circle with Mic or Paper Plane */}
        {canSend ? (
          <Animated.View style={{ transform: [{ scale: sendScale }] }}>
            <TouchableOpacity
              onPress={handleSend}
              activeOpacity={0.85}
              style={styles.actionCircleBtn}
            >
              <WhatsAppSendIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity
            style={styles.actionCircleBtn}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <WhatsAppMicIcon size={22} color="#111B21" />
          </TouchableOpacity>
        )}
      </View>

      {/* WhatsApp-Style Categorized Emoji Keyboard Drawer */}
      {showEmojiPicker && (
        <EmojiPickerBoard
          onSelectEmoji={handleInsertEmoji}
          onBackspace={handleBackspace}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0b141a',
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  topLine: {
    height: 1,
    backgroundColor: '#1f2c34',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 6,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2c34',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#1f2c34',
    paddingHorizontal: 10,
    height: 48,
  },
  inputPillFocused: {
    borderColor: '#00a884',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#E9EDEF',
    lineHeight: 22,
    padding: 0,
    margin: 0,
    fontWeight: FONTS.regular,
    maxHeight: 100,
  },
  inlineActionLeft: {
    padding: 6,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineActionIcon: {
    padding: 6,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A884',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0, 168, 132, 0.4)' },
      default: {
        shadowColor: '#00A884',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 4,
      },
    }),
  },
  replyingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2c34',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 168, 132, 0.3)',
  },
  replyingAccent: {
    width: 4,
    height: 34,
    borderRadius: 2,
    backgroundColor: '#00A884',
    marginRight: 10,
  },
  replyingContent: {
    flex: 1,
  },
  replyingUser: {
    fontSize: 12,
    color: '#00A884',
    fontWeight: FONTS.bold,
    marginBottom: 2,
  },
  replyingText: {
    fontSize: 12,
    color: '#8696A0',
  },
  cancelReplyBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelReplyText: {
    fontSize: 12,
    color: '#8696A0',
    fontWeight: FONTS.bold,
  },
});

export default MessageInput;

