import React, { useState, useMemo, memo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS } from '../utils/constants';

/**
 * Production-level Active Members Sheet/Modal.
 * Displays all currently connected users with real-time search,
 * avatar badges, and identity tags.
 */
const ActiveMembersModal = ({ visible, onClose, users = [], currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members by name or username
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const name = (u.displayName || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      return name.includes(q) || username.includes(q);
    });
  }, [users, searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const renderMember = ({ item }) => {
    const isMe =
      item.userId === currentUser?._id ||
      item.username === currentUser?.username;
    const initial = (item.displayName || item.username || '?').charAt(0).toUpperCase();

    return (
      <View style={styles.memberRow}>
        {/* Avatar with Instagram-style status dot */}
        <View style={styles.avatarWrap}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: item.avatarColor || COLORS.accentCyan },
            ]}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.statusDot} />
        </View>

        {/* User Info */}
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {item.displayName || item.username}
            </Text>
            {isMe && (
              <View style={styles.youBadge}>
                <Text style={styles.youText}>You</Text>
              </View>
            )}
          </View>
          <Text style={styles.usernameText} numberOfLines={1}>
            @{item.username}
          </Text>
        </View>

        {/* Live indicator badge */}
        <View style={styles.onlineBadge}>
          <View style={styles.livePulse} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          style={styles.sheet}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Accent top gradient bar */}
          <LinearGradient
            colors={[COLORS.accentCyan, COLORS.accentViolet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentLine}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerDot} />
              <Text style={styles.title}>Online Members</Text>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{users.length}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar (crucial for 10+ or 100+ users) */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search members…"
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Member List */}
          <FlatList
            data={filteredUsers}
            keyExtractor={(item, index) => item.userId || `${item.username}_${index}`}
            renderItem={renderMember}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No members found</Text>
              </View>
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '75%',
    backgroundColor: '#0E1422',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 20px 40px rgba(0,0,0,0.6)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 16,
      },
    }),
  },
  accentLine: {
    height: 3,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentGreen,
  },
  title: {
    fontSize: 17,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  countPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: FONTS.bold,
    color: COLORS.accentGreen,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONTS.bold,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F33',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  searchIcon: {
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    padding: 0,
  },
  clearSearch: {
    fontSize: 12,
    color: COLORS.textMuted,
    padding: 4,
  },

  // Member rows
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accentGreen,
    borderWidth: 2,
    borderColor: '#0E1422',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 14,
    fontWeight: FONTS.semibold,
    color: COLORS.textPrimary,
  },
  youBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  youText: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.accentCyan,
  },
  usernameText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  livePulse: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.accentGreen,
  },
  onlineText: {
    fontSize: 11,
    color: COLORS.accentGreen,
    fontWeight: FONTS.medium,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyWrap: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});

export default memo(ActiveMembersModal);
