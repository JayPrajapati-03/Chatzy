import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, FONTS } from '../utils/constants';
import { nd } from '../utils/platform';

const { width, height } = Dimensions.get('window');

/**
 * Chatzy Production Login Screen with dynamic ambient glows,
 * interactive card, and animated visual identity.
 */
export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Background Animation Values
  const orb1Anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb2Anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orb 1 Floating Animation Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, {
          toValue: { x: 30, y: -40 },
          duration: 7000,
          useNativeDriver: nd,
        }),
        Animated.timing(orb1Anim, {
          toValue: { x: -20, y: 30 },
          duration: 8000,
          useNativeDriver: nd,
        }),
        Animated.timing(orb1Anim, {
          toValue: { x: 0, y: 0 },
          duration: 7000,
          useNativeDriver: nd,
        }),
      ])
    ).start();

    // Orb 2 Floating Animation Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, {
          toValue: { x: -35, y: 30 },
          duration: 9000,
          useNativeDriver: nd,
        }),
        Animated.timing(orb2Anim, {
          toValue: { x: 25, y: -25 },
          duration: 8500,
          useNativeDriver: nd,
        }),
        Animated.timing(orb2Anim, {
          toValue: { x: 0, y: 0 },
          duration: 9000,
          useNativeDriver: nd,
        }),
      ])
    ).start();

    // Logo Subtle Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2500,
          useNativeDriver: nd,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: nd,
        }),
      ])
    ).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: nd }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: nd }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: nd }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: nd }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: nd }),
    ]).start();
  };

  const handleEnter = async () => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) {
      setError('Username must be at least 2 characters.');
      shake();
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      setError('Only letters, numbers, . - _ allowed.');
      shake();
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(trimmed);
    } catch (err) {
      setError(err.message || 'Could not connect. Check your server connection.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Dynamic Animated Background Ambient Glows */}
      <Animated.View
        style={[
          styles.ambientOrb,
          styles.orbCyan,
          {
            transform: [
              { translateX: orb1Anim.x },
              { translateY: orb1Anim.y },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ambientOrb,
          styles.orbPurple,
          {
            transform: [
              { translateX: orb2Anim.x },
              { translateY: orb2Anim.y },
            ],
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.innerContent}
      >
        {/* Brand Header */}
        <View style={styles.headerContainer}>
          <Animated.View style={[styles.logoOuterRing, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.logoInnerDisc}>
              <Text style={styles.chatIcon}>💬</Text>
            </View>
          </Animated.View>

          <Text style={styles.brandTitle}>Chatzy</Text>

          <View style={styles.taglineRow}>
            <View style={styles.cyanDot} />
            <Text style={styles.taglineText}>REAL-TIME</Text>
            <View style={styles.cyanDot} />
            <Text style={styles.taglineText}>GLOBAL</Text>
            <View style={styles.cyanDot} />
            <Text style={styles.taglineText}>INSTANT</Text>
            <View style={styles.cyanDot} />
          </View>
        </View>

        {/* Glassmorphic Interaction Card */}
        <Animated.View style={[styles.cardContainer, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.cardTitle}>Join the Room</Text>
          <Text style={styles.cardSubtitle}>
            Choose your identity to enter the global chatroom
          </Text>

          {/* Input Box */}
          <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
            <View style={styles.badgeAt}>
              <Text style={styles.atSymbol}>@</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="your_username"
              placeholderTextColor="#5a657c"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                if (error) setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleEnter}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              editable={!loading}
            />
          </View>

          {/* Error Message */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Enter Button */}
          <TouchableOpacity
            activeOpacity={0.82}
            style={[styles.enterButton, (!username.trim() || loading) && styles.enterButtonDisabled]}
            onPress={handleEnter}
            disabled={!username.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.enterButtonText}>Enter Chatroom →</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            New users are created automatically · No password required
          </Text>
        </Animated.View>

        {/* Bottom Live Indicator */}
        <View style={styles.onlineBadge}>
          <View style={styles.greenPulseDot} />
          <Text style={styles.onlineText}>Connected · Live Global Room</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d16',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerContent: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'web' ? 44 : 56,
    alignItems: 'center',
    zIndex: 10,
  },

  /* Ambient Orbs */
  ambientOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  orbCyan: {
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: '#00d2ff',
    top: height * 0.05,
    right: -width * 0.2,
    ...Platform.select({
      web: { boxShadow: '0 0 120px rgba(0, 210, 255, 0.45)' },
      default: {
        shadowColor: '#00d2ff',
        shadowOpacity: 0.8,
        shadowRadius: 100,
        elevation: 20,
      },
    }),
  },
  orbPurple: {
    width: width * 0.85,
    height: width * 0.85,
    backgroundColor: '#6b21a8',
    bottom: height * 0.1,
    left: -width * 0.2,
    ...Platform.select({
      web: { boxShadow: '0 0 120px rgba(139, 92, 246, 0.4)' },
      default: {
        shadowColor: '#8b5cf6',
        shadowOpacity: 0.7,
        shadowRadius: 100,
        elevation: 20,
      },
    }),
  },

  /* Header */
  headerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoOuterRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 210, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 0 25px rgba(0, 210, 255, 0.35)' },
      default: {
        shadowColor: '#00d2ff',
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
    }),
  },
  logoInnerDisc: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#111728',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chatIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginTop: 18,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  cyanDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00d2ff',
  },
  taglineText: {
    color: '#00d2ff',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  /* Card */
  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(18, 23, 38, 0.85)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...Platform.select({
      web: { boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.45,
        shadowRadius: 32,
        elevation: 12,
      },
    }),
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8b96ad',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 26, 0.85)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 12,
  },
  inputWrapperFocused: {
    borderColor: '#00d2ff',
    ...Platform.select({
      web: { boxShadow: '0 0 12px rgba(0, 210, 255, 0.35)' },
      default: {
        shadowColor: '#00d2ff',
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  badgeAt: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  atSymbol: {
    color: '#00d2ff',
    fontWeight: '700',
    fontSize: 14,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    padding: 0,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorIcon: {
    fontSize: 13,
    color: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    flex: 1,
  },
  enterButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1b243b',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(0, 210, 255, 0.2)' },
      default: {
        shadowColor: '#00d2ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  enterButtonDisabled: {
    opacity: 0.6,
  },
  enterButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerNote: {
    color: '#65728d',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 15,
  },

  /* Online Status */
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00f5ff',
    ...Platform.select({
      web: { boxShadow: '0 0 8px #00f5ff' },
      default: {
        shadowColor: '#00f5ff',
        shadowOpacity: 0.8,
        shadowRadius: 6,
      },
    }),
  },
  onlineText: {
    color: '#808da5',
    fontSize: 12,
    fontWeight: '500',
  },
});
