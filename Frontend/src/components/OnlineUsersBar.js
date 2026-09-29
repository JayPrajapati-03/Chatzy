import React, { memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../utils/constants';

const MAX_VISIBLE_CHIPS = 4;

/**
 * Production-level adaptive online users bar.
 * Displays "ACTIVE NOW:" label + user chips.
 * When <= 4 users: displays all user chips.
 * When > 4 users: displays top 4 users + sleek [+N more] button.
 * Clicking any user chip or [+N more] opens the full searchable members sheet.
 */
const OnlineUsersBar = ({ users, onOpenMembersModal }) => {
  if (!users || users.length === 0) return null;

  const visibleUsers = users.slice(0, MAX_VISIBLE_CHIPS);
  const remainingCount = users.length - MAX_VISIBLE_CHIPS;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Active Now Label */}
        <Text style={styles.activeLabel}>ACTIVE NOW:</Text>

        {visibleUsers.map((u, i) => {
          const initial = (u.displayName || u.username || '?').charAt(0).toUpperCase();
          const isOnline = u.isOnline !== undefined ? u.isOnline : true;

          return (
            <TouchableOpacity
              key={u.userId || i}
              style={styles.userChip}
              activeOpacity={0.75}
              onPress={onOpenMembersModal}
            >
              <View style={styles.avatarWrapper}>
                <View style={[styles.chipAvatar, { backgroundColor: u.avatarColor || COLORS.accentGreen }]}>
                  <Text style={styles.chipInitial}>{initial}</Text>
                </View>
                {/* Subtle presence dot */}
                <View
                  style={[
                    styles.presenceDot,
                    { backgroundColor: isOnline ? '#00f5ff' : COLORS.textMuted }
                  ]}
                />
              </View>
              <Text style={styles.chipName} numberOfLines={1}>{u.displayName || u.username}</Text>
            </TouchableOpacity>
          );
        })}

        {/* If more than 4 users, show the +N more button */}
        {remainingCount > 0 && (
          <TouchableOpacity
            style={styles.moreChip}
            activeOpacity={0.75}
            onPress={onOpenMembersModal}
          >
            <Text style={styles.moreText}>+{remainingCount} more</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  scroll: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 10,
  },
  activeLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: FONTS.bold,
    letterSpacing: 0.8,
    marginRight: 2,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white06,
    borderRadius: RADIUS.full,
    paddingRight: 10,
    paddingLeft: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    gap: 6,
  },
  avatarWrapper: {
    position: 'relative',
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
  presenceDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.bgSurface,
  },
  chipName: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: FONTS.semibold,
    maxWidth: 75,
  },
  moreChip: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  moreText: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    color: COLORS.accentCyan,
  },
});

export default memo(OnlineUsersBar);
