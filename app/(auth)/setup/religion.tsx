import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../../src/constants/theme';

const CALCULATION_METHODS = [
  { id: 'MWL', name: 'Muslim World League' },
  { id: 'ISNA', name: 'ISNA (North America)' },
  { id: 'Egypt', name: 'Egyptian General Authority' },
  { id: 'Makkah', name: 'Umm al-Qura (Makkah)' },
  { id: 'Tehran', name: 'Institute of Geophysics, Tehran' },
];

export default function ReligionSetupScreen() {
  const [religionEnabled, setReligionEnabled] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('MWL');
  const [features, setFeatures] = useState({
    prayerTimes: true,
    prayerTracker: true,
    quranProgress: true,
    dhikr: true,
    fasting: true,
    islamicRoasts: true,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    router.push('/(auth)/setup/persona');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>Step 2 of 3</Text>
        <Text style={styles.title}>Religion Settings</Text>
        <Text style={styles.subtitle}>
          Enable Islamic features for a holistic recovery experience.
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Enable Islamic Features</Text>
            <Text style={styles.toggleDesc}>Prayer times, Quran, Dhikr, Fasting</Text>
          </View>
          <Switch
            value={religionEnabled}
            onValueChange={setReligionEnabled}
            trackColor={{ true: Colors.PRIMARY, false: Colors.SECONDARY }}
            thumbColor="#fff"
          />
        </View>

        {religionEnabled && (
          <>
            <Text style={styles.sectionTitle}>Calculation Method</Text>
            {CALCULATION_METHODS.map((method) => (
              <Pressable
                key={method.id}
                style={[
                  styles.methodRow,
                  selectedMethod === method.id && styles.methodRowSelected,
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <Text style={styles.methodName}>{method.name}</Text>
                {selectedMethod === method.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}

            <Text style={styles.sectionTitle}>Features</Text>
            {Object.entries(features).map(([key, value]) => (
              <View key={key} style={styles.featureRow}>
                <Text style={styles.featureLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </Text>
                <Switch
                  value={value}
                  onValueChange={() => toggleFeature(key as keyof typeof features)}
                  trackColor={{ true: Colors.PRIMARY, false: Colors.SECONDARY }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  step: {
    fontSize: Typography.sizes.sm,
    color: Colors.PRIMARY,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    marginBottom: Spacing.xl,
  },
  toggleLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
  },
  toggleDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.SURFACE,
    borderRadius: 10,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  methodRowSelected: {
    borderColor: Colors.PRIMARY,
  },
  methodName: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: `${Colors.SECONDARY}33`,
  },
  featureLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
  },
  footer: {
    padding: Spacing.xl,
  },
  continueBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
  },
});
