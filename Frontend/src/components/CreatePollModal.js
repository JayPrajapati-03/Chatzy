import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS } from '../utils/constants';

const CreatePollModal = ({ visible, onClose, onCreatePoll }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (text, index) => {
    const updated = [...options];
    updated[index] = text;
    setOptions(updated);
  };

  const handleSubmit = () => {
    const cleanQuestion = question.trim();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!cleanQuestion || cleanOptions.length < 2) return;

    onCreatePoll({
      question: cleanQuestion,
      options: cleanOptions.map((text, idx) => ({
        id: `opt_${Date.now()}_${idx}`,
        text,
        votes: [],
        voteUsernames: [],
      })),
      totalVotes: 0,
    });

    setQuestion('');
    setOptions(['', '']);
    onClose();
  };

  const canCreate =
    question.trim().length > 0 &&
    options.filter((o) => o.trim().length > 0).length >= 2;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.pollIcon}>📊</Text>
              <Text style={styles.title}>Create Live Poll</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Question */}
            <Text style={styles.label}>Question</Text>
            <TextInput
              style={styles.questionInput}
              placeholder="Ask the room a question…"
              placeholderTextColor={COLORS.textMuted}
              value={question}
              onChangeText={setQuestion}
              maxLength={200}
              selectionColor={COLORS.accentCyan}
            />

            {/* Options */}
            <Text style={[styles.label, { marginTop: 16 }]}>Options</Text>
            {options.map((opt, index) => (
              <View key={index} style={styles.optionRow}>
                <View style={styles.optionNumber}>
                  <Text style={styles.optionNumText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={styles.optionInput}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={COLORS.textMuted}
                  value={opt}
                  onChangeText={(text) => handleOptionChange(text, index)}
                  maxLength={100}
                  selectionColor={COLORS.accentCyan}
                />
                {options.length > 2 && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveOption(index)}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {options.length < 6 && (
              <TouchableOpacity
                style={styles.addOptionBtn}
                onPress={handleAddOption}
                activeOpacity={0.7}
              >
                <Text style={styles.addOptionText}>+ Add Option</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, !canCreate && styles.submitBtnDisabled]}
              disabled={!canCreate}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  canCreate
                    ? [COLORS.accentCyan, COLORS.accentViolet]
                    : ['#232B3E', '#232B3E']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                <Text
                  style={[
                    styles.submitText,
                    !canCreate && { color: COLORS.textMuted },
                  ]}
                >
                  Launch Poll 🚀
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 14, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#121724',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)' },
      default: {
        shadowColor: '#00D4FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pollIcon: {
    fontSize: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  closeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: FONTS.bold,
  },
  body: {
    maxHeight: 340,
  },
  label: {
    fontSize: 12,
    color: COLORS.accentCyan,
    fontWeight: FONTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  questionInput: {
    backgroundColor: '#181F30',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  optionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionNumText: {
    fontSize: 11,
    color: COLORS.accentCyan,
    fontWeight: FONTS.bold,
  },
  optionInput: {
    flex: 1,
    backgroundColor: '#181F30',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  removeBtn: {
    padding: 8,
  },
  removeText: {
    fontSize: 14,
    color: COLORS.accentRed,
    fontWeight: FONTS.bold,
  },
  addOptionBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 4,
  },
  addOptionText: {
    fontSize: 13,
    color: COLORS.accentCyan,
    fontWeight: FONTS.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
});

export default CreatePollModal;
