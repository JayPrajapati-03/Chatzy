import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Subtle shake animation on validation error
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true })
    ]).start();
  };

  const handleJoin = async () => {
    const trimmed = username.trim().toLowerCase();

    // Client-side validation
    if (!trimmed || trimmed.length < 2) {
      setError('Username must be at least 2 characters.');
      shake();
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      setError('Only letters, numbers, dots, dashes, underscores allowed.');
      shake();
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(trimmed);
      // AuthContext sets user → App.js renders ChatScreen
    } catch (err) {
      setError(err.message || 'Could not connect to server. Check your network.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / branding */}
        <View style={styles.brandArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>💬</Text>
          </View>
          <Text style={styles.appName}>Chatzy</Text>
          <Text style={styles.tagline}>Real-time global chat</Text>
        </View>

        {/* Card */}
        <Animated.View
          style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
        >
          <Text style={styles.cardTitle}>Join the room</Text>
          <Text style={styles.cardSubtitle}>
            Pick a username to start chatting instantly
          </Text>

          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="e.g. alice or dev_jay"
            placeholderTextColor={COLORS.textSecondary}
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              if (error) setError('');
            }}
            onSubmitEditing={handleJoin}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            maxLength={30}
            editable={!loading}
          />

          {!!error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, (!username.trim() || loading) && styles.buttonDisabled]}
            onPress={handleJoin}
            disabled={!username.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Enter Chat →</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            No password needed. New users are created automatically.
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: 36
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10
  },
  logoIcon: {
    fontSize: 38
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.bgHeader,
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 22,
    lineHeight: 20
  },
  input: {
    backgroundColor: COLORS.bgInputField,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 6
  },
  inputError: {
    borderColor: COLORS.accentRed
  },
  errorText: {
    color: COLORS.accentRed,
    fontSize: 13,
    marginBottom: 12,
    paddingLeft: 4
  },
  button: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6
  },
  buttonDisabled: {
    opacity: 0.45
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  hint: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18
  }
});
