import React, { memo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../utils/constants';

/**
 * Premium horizontal scrolling online users bar.
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
        <View style={styles.pill}>
          <View style={styles.liveDot} />
          <Text style={styles.countText}>{users.length} online</Text>
        </View>

        {users.map((u, i) => {
          const initial = (u.displayName || u.username || '?').charAt(0).toUpperCase();
          return (
            <View key={u.userId || i} style={styles.userChip}>
              <View style={[styles.chipAvatar, { backgroundColor: u.avatarColor || COLORS.accentCyan }]}>
                <Text style={styles.chipInitial}>{initial}</Text>
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
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    gap: 5,
    marginRight: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentGreen,
  },
  countText: {
    fontSize: 11,
    color: COLORS.accentGreen,
    fontWeight: FONTS.bold,
    letterSpacing: 0.5,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgFloat,
    borderRadius: RADIUS.full,
    paddingRight: 10,
    paddingLeft: 3,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    gap: 6,
  },
  chipAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInitial: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
  chipName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
    maxWidth: 70,
  },
});

export default memo(OnlineUsersBar);
