import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * ConnectionBanner — persistent banner at the top of the chat screen
 * that informs the user of connection state and lets them retry.
 *
 * States:
 *   'connected'    → hidden (returns null)
 *   'connecting'   → yellow "Reconnecting..." banner
 *   'disconnected' → red banner with Retry button
 *
 * @param {{ status: 'connected'|'connecting'|'disconnected', onRetry: function }} props
 */
const ConnectionBanner = ({ status, onRetry }) => {
  if (status === 'connected') return null;

  const isConnecting = status === 'connecting';

  return (
    <View style={[styles.banner, isConnecting ? styles.connecting : styles.disconnected]}>
      <View style={styles.dot} />
      <Text style={styles.text}>
        {isConnecting ? 'Reconnecting to server...' : 'No connection. Messages may not send.'}
      </Text>
      {!isConnecting && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.75}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8
  },
  connecting: {
    backgroundColor: '#78500A' // amber-dark
  },
  disconnected: {
    backgroundColor: '#7F1D1D' // red-dark
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.white,
    opacity: 0.7
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500'
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)'
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12
  }
});

export default memo(ConnectionBanner);
