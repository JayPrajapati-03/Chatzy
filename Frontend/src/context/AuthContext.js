import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api/userApi';
import { disconnectSocket } from '../socket/socket';

const STORAGE_KEY = '@chatzy_user';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // logged-in user object or null
  const [loading, setLoading] = useState(true); // true while restoring session

  // ── Auto-login: restore persisted session on app start ────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Re-validate with the server (this also marks isOnline:true)
          const freshUser = await loginUser(parsed.username, parsed.displayName);
          setUser(freshUser);
        }
      } catch (err) {
        // Network down or bad storage — fall through to login screen
        console.warn('Session restore failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  /**
   * Log in with a username. Creates the user if not exists.
   * Persists user data to AsyncStorage for auto-login.
   */
  const login = useCallback(async (username, displayName) => {
    const userData = await loginUser(username.trim().toLowerCase(), displayName);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  /**
   * Log out: clear storage, disconnect socket, and reset state.
   */
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    disconnectSocket();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — convenience hook for consuming AuthContext.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
