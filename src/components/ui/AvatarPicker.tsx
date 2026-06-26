import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AVATARS, AVATAR_IDS } from '../../data/avatars';
import { Colors, Typography, Spacing, Radius, Shadow, LetterSpacing } from '../../constants/theme';

interface AvatarPickerProps {
  /** Currently selected avatar key */
  selected: string | null;
  /** Called when user selects an avatar */
  onSelect: (avatarId: string) => void;
  /** Whether the modal is visible */
  visible: boolean;
  /** Close the modal */
  onClose: () => void;
}

const LABELS: Record<string, string> = {
  'man-vampire-light-skin-tone': 'Vampire',
  'man-technologist-medium-skin-tone': 'Technologist',
  'man-supervillain-medium-skin-tone': 'Supervillain',
  'man-supervillain-medium-dark-skin-tone': 'Supervillain',
  'man-superhero-medium-skin-tone': 'Superhero',
  'man-superhero-light-skin-tone': 'Superhero',
  'man-superhero-dark-skin-tone': 'Superhero',
  'man-student-medium-skin-tone': 'Student',
  'man-pouting-light-skin-tone': 'Pouting',
  'man-pouting-dark-skin-tone': 'Pouting',
  'man-police-officer-medium-skin-tone': 'Police',
  'man-health-worker-medium-skin-tone': 'Health Worker',
  'man-light-skin-tone-beard': 'Beard',
  'man-light-skin-tone-curly-hair': 'Curly Hair',
  'man-medium-dark-skin-tone-curly-hair': 'Curly Hair',
};

const GRID_COLUMNS = 3;
const CELL_SIZE = Math.floor((Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md * (GRID_COLUMNS - 1)) / GRID_COLUMNS);

export function AvatarPicker({
  selected,
  onSelect,
  visible,
  onClose,
}: AvatarPickerProps) {
  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Avatar</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={Colors.TEXT_PRIMARY} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {AVATAR_IDS.map((id) => {
            const isActive = id === selected;
            return (
              <Pressable
                key={id}
                style={[styles.cell, isActive && styles.cellActive]}
                onPress={() => handleSelect(id)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${LABELS[id] || id} avatar`}
              >
                <View style={[styles.avatarWrap, isActive && styles.avatarWrapActive]}>
                  <SvgXml xml={AVATARS[id]} width={CELL_SIZE - 20} height={CELL_SIZE - 20} />
                </View>
                {isActive && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color={Colors.TEXT_ON_PRIMARY} />
                  </View>
                )}
                <Text style={styles.label} numberOfLines={1}>
                  {LABELS[id] || id}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: Colors.BACKGROUND },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.families.displaySemi,
    color: Colors.TEXT_PRIMARY,
    letterSpacing: LetterSpacing.tight,
  },
  closeBtn: { padding: Spacing.xs },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cell: {
    width: CELL_SIZE,
    alignItems: 'center',
    gap: 6,
  },
  avatarWrap: {
    width: CELL_SIZE - 10,
    height: CELL_SIZE - 10,
    borderRadius: Radius.xl,
    backgroundColor: Colors.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  avatarWrapActive: {
    borderColor: Colors.PRIMARY,
    backgroundColor: 'rgba(67,104,111,0.12)',
  },
  cellActive: {},
  checkBadge: {
    position: 'absolute',
    top: 2,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.families.featureMedium,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
