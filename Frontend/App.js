import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';
import { COLORS } from './src/utils/constants';

/**
 * Navigator — manages the lifecycle:
 * Splash Screen -> Login Screen -> Chat Screen
 */
const Navigator = () => {
  const { user, loading } = useAuth();
  const [isSplashDone, setIsSplashDone] = useState(false);

  // Always show the next-level Splash Screen on initial app launch / page refresh
  if (!isSplashDone || loading) {
    return <SplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  // Once splash screen finishes: LoginScreen (if unauthenticated) or ChatScreen (if authenticated)
  return user ? <ChatScreen /> : <LoginScreen />;
};

/**
 * App root — wraps everything in providers.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.bgBase} />
      <AuthProvider>
        <Navigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
});
