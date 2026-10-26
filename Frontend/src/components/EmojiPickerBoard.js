import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys & People',
    iconText: '😊',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹',
      '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗',
      '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓',
      '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕',
      '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😮‍💨',
      '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
      '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🫢', '🫡', '🤫',
      '🫠', '🤥', '😶', '😐', '😑', '😬', '🫨', '😯', '😦', '😧',
      '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '😵‍💫', '🤐', '🥴',
      '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
      '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶', '👐',
      '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '👂', '👃', '🧠',
    ],
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    iconText: '🐾',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨',
      '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤',
      '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱',
      '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗',
      '🐢', '🐍', '🦎', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠',
      '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂',
      '🍃', '🍄', '🌸', '💐', '🌷', '🌹', '🌻', '🌞', '🌝', '🌙',
    ],
  },
  {
    id: 'food',
    name: 'Food & Drink',
    iconText: '🍔',
    emojis: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐',
      '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦',
      '🌶', '🌽', '🥕', '🥔', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚',
      '🍳', '🥞', '🧇', '🥓', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕',
      '🌮', '🌯', '🥗', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟',
      '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫',
      '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕️', '🫖', '🍵', '🧃',
    ],
  },
  {
    id: 'activities',
    name: 'Activities',
    iconText: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
      '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳️',
      '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷',
      '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺',
      '🎮', '🕹', '🎰', '🎲', '🧩', '🎨', '🎬', '🎤', '🎧', '🎼',
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    iconText: '🚗',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐',
      '🛻', '🚚', '🚛', '🚜', '🛵', '🏍', '🛺', '🚲', '🛴', '🚏',
      '✈️', '🛫', '🛬', '🛩', '🚁', '🚀', '🛸', '🛰', '⛵️', '🚤',
      '🛳', '⛴', '🚢', '⚓️', '🪝', '🚂', '🚆', '🚇', '🚊', '🗺',
      '🌋', '🗻', '🏔', '🏕', '🏖', '🏜', '🏝', '🏛', '🏟', '🎡',
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    iconText: '💡',
    emojis: [
      '💡', '🔦', '🕯', '🪔', '📱', '💻', '🖥', '🖨', '⌨️', '🖱',
      '📷', '📸', '📹', '🎥', '📞', '☎️', '📟', '📠', '📺', '📻',
      '⏱', '⏲', '⏰', '🕰', '⏳', '⌛️', '📡', '🔋', '🔌', '🧯',
      '💰', '🪙', '💴', '💵', '💶', '💷', '💸', '💳', '💎', '⚖️',
      '🪜', '🪰', '🪛', '🔧', '🔨', '⚒', '⛏', '🪓', '🛡', '🔮',
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols & Hearts',
    iconText: '🔣',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
      '💟', '💌', '💋', '💯', '🔥', '✨', '🌟', '💫', '💥', '💢',
      '💤', '🕳', '🎉', '🎊', '🎈', '🎁', '👑', '💍', '💎', '🏆',
      '🥇', '🥈', '🥉', '🎯', '🔮', '🧿', '🪄', '💡', '🔔', '🔕',
    ],
  },
];

const ArrowLeftIcon = ({ size = 20, color = '#8696A0' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    );
  }
  return <Text style={{ fontSize: 16, color }}>←</Text>;
};

const BackspaceIcon = ({ size = 20, color = '#8696A0' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
        <line x1="18" y1="9" x2="12" y2="15" />
        <line x1="12" y1="9" x2="18" y2="15" />
      </svg>
    );
  }
  return <Text style={{ fontSize: 16, color }}>⌫</Text>;
};

const SearchIcon = ({ size = 20, color = '#8696A0' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="11" cy="11" r="7.5" />
        <line x1="21" y1="21" x2="16.5" y2="16.5" />
      </svg>
    );
  }
  return <Text style={{ fontSize: 16, color }}>🔍</Text>;
};

const EmojiPickerBoard = ({ onSelectEmoji, onBackspace, onClose }) => {
  const [activeTab, setActiveTab] = useState('smileys');

  const currentCategory =
    EMOJI_CATEGORIES.find((c) => c.id === activeTab) || EMOJI_CATEGORIES[0];

  return (
    <View style={styles.container}>
      {/* ── Top Bar (WhatsApp style: Arrow Back + Mode Pills + Search) ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon size={20} color="#8696A0" />
        </TouchableOpacity>

        <View style={styles.modeTabsRow}>
          <TouchableOpacity style={styles.modePillActive} activeOpacity={0.8}>
            <Text style={styles.modeEmojiIcon}>😊</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modePillInactive} activeOpacity={0.8}>
            <Text style={styles.modeEmoticonText}>:-)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modePillInactive} activeOpacity={0.8}>
            <Text style={styles.modeStickerText}>💬</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modePillInactive} activeOpacity={0.8}>
            <Text style={styles.modeText}>GIF</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.7}>
          <SearchIcon size={20} color="#8696A0" />
        </TouchableOpacity>
      </View>

      {/* ── Main Emoji Grid ── */}
      <ScrollView
        style={styles.gridScroll}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <Text style={styles.categoryTitle}>{currentCategory.name}</Text>
        <View style={styles.emojiGrid}>
          {currentCategory.emojis.map((emoji, idx) => (
            <TouchableOpacity
              key={`${emoji}-${idx}`}
              style={styles.emojiCell}
              onPress={() => onSelectEmoji(emoji)}
              activeOpacity={0.6}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Bottom Category Navigation Bar (1:1 WhatsApp) ── */}
      <View style={styles.bottomBar}>
        {/* ABC Button (Switch to text keyboard) */}
        <TouchableOpacity
          style={styles.abcBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.abcText}>ABC</Text>
        </TouchableOpacity>

        {/* Category Icons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {EMOJI_CATEGORIES.map((cat) => {
            const isActive = cat.id === activeTab;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catBtn, isActive && styles.catBtnActive]}
                onPress={() => setActiveTab(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.catIconText}>{cat.iconText}</Text>
                {isActive && <View style={styles.catActiveIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Backspace Delete Button */}
        <TouchableOpacity
          style={styles.backspaceBtn}
          onPress={onBackspace}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <BackspaceIcon size={20} color="#8696A0" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 290,
    backgroundColor: '#182229',
    borderTopWidth: 1,
    borderTopColor: '#222E35',
  },
  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2C34',
    paddingHorizontal: 8,
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#222E35',
  },
  backBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modePillActive: {
    backgroundColor: '#2A3942',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#374248',
  },
  modeEmojiIcon: {
    fontSize: 15,
  },
  modePillInactive: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 18,
  },
  modeEmoticonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8696A0',
  },
  modeStickerText: {
    fontSize: 14,
    color: '#8696A0',
  },
  modeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8696A0',
  },
  searchBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Emoji Grid ──
  gridScroll: {
    flex: 1,
    paddingHorizontal: 6,
  },
  gridContent: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8696A0',
    marginBottom: 8,
    paddingLeft: 8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  emojiCell: {
    width: `${100 / 8}%`,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 26,
  },

  // ── Bottom Navigation Bar ──
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2C34',
    height: 44,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#222E35',
  },
  abcBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#2A3942',
    marginRight: 6,
  },
  abcText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8696A0',
    letterSpacing: 0.5,
  },
  catScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  catBtnActive: {
    backgroundColor: '#2A3942',
  },
  catIconText: {
    fontSize: 18,
  },
  catActiveIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#00A884',
  },
  backspaceBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginLeft: 6,
  },
});

export default memo(EmojiPickerBoard);
