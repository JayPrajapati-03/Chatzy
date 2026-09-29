import React, { memo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../utils/constants';

/**
 * Premium horizontal scrolling online users bar with Instagram-style status dot on avatars.
 */
const OnlineUsersBar = ({ users }) => {
  if (!users || users.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {users.map((u, i) => {
          const initial = (u.displayName || u.username || '?').charAt(0).toUpperCase();
          const isOnline = u.isOnline !== undefined ? u.isOnline : true;

          return (
            <View key={u.userId || i} style={styles.userChip}>
              <View style={styles.avatarWrapper}>
                <View style={[styles.chipAvatar, { backgroundColor: u.avatarColor || COLORS.accentCyan }]}>
                  <Text style={styles.chipInitial}>{initial}</Text>
                </View>
                {/* Instagram-style status dot */}
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isOnline ? COLORS.accentGreen : COLORS.textMuted }
                  ]}
                />
              </View>
              <Text style={styles.chipName} numberOfLines={1}>{u.displayName || u.username}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scroll: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 8,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgFloat,
    borderRadius: RADIUS.full,
    paddingRight: 10,
    paddingLeft: 4,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    gap: 7,
  },
  avatarWrapper: {
    position: 'relative',
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInitial: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.bgFloat,
  },
  chipName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
    maxWidth: 75,
  },
});

export default memo(OnlineUsersBar);
