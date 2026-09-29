import React, { memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet
} from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * OnlineUsersBar — horizontal scrollable strip showing who's online.
 * Each user is shown as a colored avatar chip with a green pulse dot.
 *
 * @param {{ users: Array<{userId, username, displayName, avatarColor}> }} props
 */
const OnlineUsersBar = ({ users }) => {
  if (!users || users.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Online</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {users.map((u) => (
          <View key={u.userId} style={styles.chip}>
            <View style={styles.chipLeft}>
              <View style={[styles.avatar, { backgroundColor: u.avatarColor || COLORS.accentGreen }]}>
                <Text style={styles.avatarText}>
                  {(u.displayName || u.username || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineDot} />
            </View>
            <Text style={styles.chipName} numberOfLines={1}>
              {u.displayName || u.username}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgHeader,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  scroll: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInputField,
    borderRadius: 20,
    paddingRight: 10,
    paddingLeft: 4,
    paddingVertical: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  chipLeft: {
    position: 'relative',
    width: 28,
    height: 28
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.online,
    borderWidth: 1.5,
    borderColor: COLORS.bgHeader
  },
  chipName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: 80
  }
});

export default memo(OnlineUsersBar);
