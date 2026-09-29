import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { COLORS, GRADIENTS, RADIUS, SHADOW, FONTS } from '../utils/constants';
import { nd } from '../utils/platform';

const { width, height } = Dimensions.get('window');

// ── Floating orb decoration ──────────────────────────────────────────────────
const FloatingOrb = ({ style, color, size, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: nd,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: nd,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.28, 0.15] });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY }],
          opacity,
        },
        style,
      ]}
    />
  );
};

// ── Main Login Screen ─────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  // Animations
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const cardAnim   = useRef(new Animated.Value(0)).current;
  const logoAnim   = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation
    Animated.stagger(120, [
      Animated.spring(logoAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: nd }),
      Animated.spring(cardAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: nd }),
    ]).start();

    // Logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.07, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: nd }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: nd }),
      ])
    ).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: nd }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: nd }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: nd }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: nd }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: nd }),
    ]).start();
  };

  const handleJoin = async () => {
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
      setError(err.message || 'Could not connect. Check your network.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  const logoTranslateY = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] });
  const cardTranslateY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });

  return (
    <LinearGradient colors={GRADIENTS.loginBg} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Decorative Orbs */}
      <FloatingOrb color={COLORS.accentCyan}   size={280} style={{ top: -60, right: -80 }}   delay={0} />
      <FloatingOrb color={COLORS.accentViolet} size={200} style={{ top: 180, left: -90 }}    delay={800} />
      <FloatingOrb color={COLORS.accentCyan}   size={120} style={{ bottom: 80, right: 40 }}  delay={400} />
      <FloatingOrb color={COLORS.accentViolet} size={160} style={{ bottom: 200, left: -40 }} delay={1200} />

      {/* Grid overlay */}
      <View style={[styles.gridOverlay, { pointerEvents: 'none' }]} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          {/* ── Logo Area ── */}
          <Animated.View
            style={[
              styles.logoArea,
              {
                opacity: logoAnim,
                transform: [{ translateY: logoTranslateY }, { scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.accentCyan, COLORS.accentViolet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoRing}
            >
              <View style={styles.logoInner}>
                <Text style={styles.logoEmoji}>💬</Text>
              </View>
            </LinearGradient>

            <Text style={styles.appName}>Chatzy</Text>
            <View style={styles.taglineRow}>
              <View style={[styles.taglineDot, { backgroundColor: COLORS.accentCyan }]} />
              <Text style={styles.tagline}>Real-time · Global · Instant</Text>
              <View style={[styles.taglineDot, { backgroundColor: COLORS.accentViolet }]} />
            </View>
          </Animated.View>

          {/* ── Card ── */}
          <Animated.View
            style={[
              styles.cardWrap,
              {
                opacity: cardAnim,
                transform: [
                  { translateY: cardTranslateY },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            {/* Glass card */}
            <View style={styles.card}>
              {/* Top accent line */}
              <LinearGradient
                colors={[COLORS.accentCyan, COLORS.accentViolet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardAccentLine}
              />

              <Text style={styles.cardTitle}>Join the Room</Text>
              <Text style={styles.cardSubtitle}>
                Choose your identity to enter the global chatroom
              </Text>

              {/* Input */}
              <View style={[styles.inputContainer, focused && styles.inputContainerFocused]}>
                <Text style={styles.inputPrefix}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your_username"
                  placeholderTextColor={COLORS.textMuted}
                  value={username}
                  onChangeText={(t) => { setUsername(t); if (error) setError(''); }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onSubmitEditing={handleJoin}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  maxLength={30}
                  editable={!loading}
                  selectionColor={COLORS.accentCyan}
                />
                {username.length > 0 && (
                  <TouchableOpacity onPress={() => { setUsername(''); setError(''); }}>
                    <Text style={styles.clearBtn}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Error */}
              {!!error && (
                <View style={styles.errorRow}>
                  <Text style={styles.errorIcon}>⚠</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* CTA Button */}
              <TouchableOpacity
                onPress={handleJoin}
                disabled={!username.trim() || loading}
                activeOpacity={0.85}
                style={styles.btnWrap}
              >
                <LinearGradient
                  colors={
                    !username.trim() || loading
                      ? ['#1C2333', '#1C2333']
                      : [COLORS.accentCyan, COLORS.accentViolet]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btn}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={[styles.btnText, (!username.trim()) && styles.btnTextDisabled]}>
                      Enter Chatroom  →
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Hint */}
              <Text style={styles.hint}>
                New users are created automatically · No password required
              </Text>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.025,
    backgroundImage: undefined,
    // Simulated grid via border
  },
  kav: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // ── Logo ──
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    marginBottom: 20,
    ...SHADOW.cyanGlow,
  },
  logoInner: {
    flex: 1,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 40,
    fontWeight: FONTS.black,
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: 10,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taglineDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Card ──
  cardWrap: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    backgroundColor: 'rgba(22,27,39,0.9)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  cardAccentLine: {
    height: 2,
    width: '100%',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 28,
    marginHorizontal: 28,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginHorizontal: 28,
    marginBottom: 28,
    lineHeight: 19,
  },

  // ── Input ──
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInputField,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    marginBottom: 8,
    height: 54,
  },
  inputContainerFocused: {
    borderColor: COLORS.accentCyan,
    ...Platform.select({
      web: { boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)' },
      default: {
        shadowColor: COLORS.accentCyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
      },
    }),
  },
  inputPrefix: {
    fontSize: 20,
    color: COLORS.accentCyan,
    fontWeight: FONTS.bold,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
    padding: 0,
  },
  clearBtn: {
    fontSize: 14,
    color: COLORS.textMuted,
    paddingLeft: 8,
  },

  // ── Error ──
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 28,
    marginBottom: 10,
    gap: 6,
  },
  errorIcon: { fontSize: 13, color: COLORS.accentRed },
  errorText: {
    fontSize: 13,
    color: COLORS.accentRed,
    flex: 1,
  },

  // ── Button ──
  btnWrap: { marginHorizontal: 24, marginTop: 8, borderRadius: RADIUS.md, overflow: 'hidden' },
  btn: {
    height: 54,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  btnTextDisabled: {
    color: COLORS.textMuted,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginHorizontal: 28,
    marginTop: 18,
    marginBottom: 28,
    lineHeight: 17,
  },
});
