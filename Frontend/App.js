import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';
import { COLORS } from './src/utils/constants';

/**
 * Navigator — renders the correct screen based on auth state.
 * No external navigation library needed: we have only two screens.
 */
const Navigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a full-screen spinner while AsyncStorage is being read
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={COLORS.accentGreen} />
      </View>
    );
  }

  return user ? <ChatScreen /> : <LoginScreen />;
};

/**
 * App root — wraps everything in providers.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.bgHeader} />
      <AuthProvider>
        <Navigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
