import React, { memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../utils/constants';

const MAX_VISIBLE_CHIPS = 4;

/**
 * Production-level adaptive online users bar.
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
