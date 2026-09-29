import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS } from '../utils/constants';
import { nd, createGlow } from '../utils/platform';

const { width } = Dimensions.get('window');

/**
 * Ultra-premium, production-grade Splash Screen for Chatzy.
 * Features ambient glow orbs, multi-stage loading ticker,
 * concentric pulsing aura rings, and a cinematic exit transition.
 */
export default function SplashScreen({ onFinish }) {
  const [statusText, setStatusText] = useState('Initializing socket engine…');

  // Animation values
  const logoScale    = useRef(new Animated.Value(0.7)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const contentFade  = useRef(new Animated.Value(0)).current;
  const screenFade   = useRef(new Animated.Value(1)).current;
  const screenScale  = useRef(new Animated.Value(1)).current;

  // Pulse rings
  const ring1 = useRef(new Animated.Value(0.8)).current;
  const ring2 = useRef(new Animated.Value(0.8)).current;

  // Ambient orbs
  const orbFloat = useRef(new Animated.Value(0)).current;

  // Progress line
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entry logo spring & content fade-in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: nd,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: nd,
      }),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 800,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: nd,
      }),
    ]).start();

    // 2. Continuous pulse rings
    const createRingLoop = (anim, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1.6,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: nd,
          }),
          Animated.timing(anim, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: nd,
          }),
        ])
      );
    };

    const ring1Loop = createRingLoop(ring1, 0);
    const ring2Loop = createRingLoop(ring2, 800);
    ring1Loop.start();
    ring2Loop.start();

    // 3. Floating ambient orbs
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbFloat, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: nd,
        }),
        Animated.timing(orbFloat, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: nd,
        }),
      ])
    ).start();

    // 4. Progress bar fill
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2100,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false, // width interpolation
    }).start();

    // 5. Status ticker text transitions
    const t1 = setTimeout(() => {
      setStatusText('Establishing encrypted channel…');
    }, 700);

    const t2 = setTimeout(() => {
      setStatusText('Synchronizing global room…');
    }, 1400);

    const t3 = setTimeout(() => {
      setStatusText('Welcome to Chatzy');
    }, 2000);

    // 6. Cinematic exit transition after ~2.3 seconds
    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(screenFade, {
          toValue: 0,
          duration: 450,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: nd,
        }),
        Animated.timing(screenScale, {
          toValue: 1.05,
          duration: 450,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: nd,
        }),
      ]).start(() => {
        onFinish?.();
      });
    }, 2350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(exitTimer);
      ring1Loop.stop();
      ring2Loop.stop();
    };
  }, []);

  // Interpolated ring styles
  const ring1Opacity = ring1.interpolate({
    inputRange: [0.8, 1.2, 1.6],
    outputRange: [0.55, 0.25, 0],
  });

  const ring2Opacity = ring2.interpolate({
    inputRange: [0.8, 1.2, 1.6],
    outputRange: [0.45, 0.2, 0],
  });

  // Progress width
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const orb1Y = orbFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const orb2Y = orbFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenFade,
          transform: [{ scale: screenScale }],
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#050811" />

      {/* Deep gradient background */}
      <LinearGradient
        colors={['#050811', '#080C14', '#0F1626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient background glow orbs */}
      <Animated.View
        style={[
          styles.glowOrb,
          styles.glowOrbCyan,
          { transform: [{ translateY: orb1Y }] },
        ]}
      />
      <Animated.View
        style={[
          styles.glowOrb,
          styles.glowOrbViolet,
          { transform: [{ translateY: orb2Y }] },
        ]}
      />

      {/* Subtle grid pattern overlay lines */}
      <View style={styles.gridOverlay} pointerEvents="none" />

      {/* Center Branding Content */}
      <View style={styles.centerContent}>
        {/* Pulsing Concentric Rings */}
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: COLORS.accentCyan,
                opacity: ring1Opacity,
                transform: [{ scale: ring1 }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: COLORS.accentViolet,
                opacity: ring2Opacity,
                transform: [{ scale: ring2 }],
              },
            ]}
          />

          {/* Main Logo Emblem */}
          <Animated.View
            style={[
              styles.logoBadgeWrap,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.accentCyan, COLORS.accentViolet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoOuterBorder}
            >
              <View style={styles.logoInner}>
                <LinearGradient
                  colors={['#0F172A', '#090D18']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoInnerGrad}
                >
                  <Text style={styles.logoEmoji}>💬</Text>
                  {/* Digital sparkle dot */}
                  <View style={styles.emblemDot} />
                </LinearGradient>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Brand Name & Tagline */}
        <Animated.View style={[styles.brandWrap, { opacity: contentFade }]}>
          <Text style={styles.brandTitle}>
            CHAT<Text style={styles.brandTitleCyan}>ZY</Text>
          </Text>

          <View style={styles.taglineBadge}>
            <View style={styles.taglineLiveDot} />
            <Text style={styles.brandTagline}>NEXT-GEN REAL-TIME MESSAGING</Text>
          </View>
        </Animated.View>

        {/* Progress Tracker */}
        <Animated.View style={[styles.loaderSection, { opacity: contentFade }]}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width: progressWidth }]}>
              <LinearGradient
                colors={[COLORS.accentCyan, COLORS.accentViolet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>

          <Text style={styles.statusText}>{statusText}</Text>
        </Animated.View>
      </View>

      {/* Footer Info */}
      <Animated.View style={[styles.footer, { opacity: contentFade }]}>
        <View style={styles.footerShield}>
          <Text style={styles.footerLock}>🔒</Text>
          <Text style={styles.footerText}>End-to-End Real-Time Socket Architecture</Text>
        </View>
        <Text style={styles.footerVersion}>v1.0.0 • Production Build</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050811',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Ambient Glow Orbs ───────────────────────────────────────────────────────
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowOrbCyan: {
    top: '20%',
    left: '12%',
    width: 260,
    height: 260,
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
  },
  glowOrbViolet: {
    bottom: '22%',
    right: '10%',
    width: 280,
    height: 280,
    backgroundColor: 'rgba(124, 58, 237, 0.14)',
  },

  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  // ── Center Content ─────────────────────────────────────────────────────────
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },

  logoContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  pulseRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
  },

  logoBadgeWrap: {
    width: 86,
    height: 86,
    borderRadius: 28,
    ...Platform.select({
      web: { boxShadow: '0 0 35px rgba(0, 212, 255, 0.35)' },
      default: {
        shadowColor: '#00D4FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
        elevation: 12,
      },
    }),
  },
  logoOuterBorder: {
    flex: 1,
    borderRadius: 28,
    padding: 2.5,
  },
  logoInner: {
    flex: 1,
    borderRadius: 25.5,
    overflow: 'hidden',
  },
  logoInnerGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 40,
  },
  emblemDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentCyan,
    ...Platform.select({
      web: { boxShadow: '0 0 8px #00D4FF' },
      default: {},
    }),
  },

  // ── Brand Typography ───────────────────────────────────────────────────────
  brandWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: FONTS.black,
    color: COLORS.white,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  brandTitleCyan: {
    color: COLORS.accentCyan,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
    gap: 7,
  },
  taglineLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentGreen,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
  },

  // ── Progress Loader ────────────────────────────────────────────────────────
  loaderSection: {
    alignItems: 'center',
    width: Math.min(width * 0.72, 260),
  },
  track: {
    width: '100%',
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: FONTS.medium,
    letterSpacing: 0.4,
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
    gap: 6,
  },
  footerShield: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLock: {
    fontSize: 10,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: FONTS.medium,
  },
  footerVersion: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.25)',
    letterSpacing: 0.5,
  },
});
