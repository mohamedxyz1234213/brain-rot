import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing, Radius, Shadow, Layout, LetterSpacing, Sizing } from '../../src/constants/theme';
import { SafeScreen, ScreenHeader } from '../../src/components/ui';
import { PullToRefresh } from '../../src/components/ui/PullToRefresh';
import { useRefreshAll } from '../../src/hooks/useRefreshAll';
import { useAuthStore } from '../../src/stores/authStore';
import { backendService } from '../../src/services/backend';

type ReportType = 'bug' | 'feature';
type ReportStatus = 'open' | 'acknowledged' | 'fixed' | 'closed';

interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
}

const STATUS_COLORS: Record<ReportStatus, string> = {
  open: Colors.WARNING,
  acknowledged: Colors.PRIMARY_LIGHT,
  fixed: Colors.SUCCESS,
  closed: Colors.TEXT_SECONDARY,
};

export default function ReportScreen() {
  const { t } = useTranslation();
  const refreshAll = useRefreshAll();
  const userId = useAuthStore((s) => s.user?.id);
  const [type, setType] = useState<ReportType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const loadMyReports = async () => {
    if (!userId) return;
    setLoadingReports(true);
    try {
      const reports = await backendService.getMyReports(userId);
      setMyReports(reports.map((r) => ({ ...r, type: r.type as ReportType, status: (r.status || 'open') as ReportStatus })));
    } catch {
      // ignore - offline or no backend
    }
    setLoadingReports(false);
  };

  useEffect(() => { loadMyReports(); }, [userId]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(t('report.fillRequired'), t('report.fillRequiredDesc'));
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    try {
      await backendService.submitReport(userId!, { type, title: title.trim(), description: description.trim() });
      Alert.alert(t('report.submitted'), t('report.submittedDesc'));
      setTitle('');
      setDescription('');
      setType('bug');
      loadMyReports();
    } catch {
      Alert.alert(t('report.failed'), t('report.failedDesc'));
    }
    setSubmitting(false);
  };

  return (
    <SafeScreen>
      <ScreenHeader title={t('report.title')} subtitle={t('report.subtitle')} onBack={() => router.back()} />
      <PullToRefresh onRefresh={() => { refreshAll(); loadMyReports(); }} contentContainerStyle={styles.content}>
        {/* Type selector */}
        <View style={styles.typeRow}>
          {(['bug', 'feature'] as const).map((t2) => {
            const active = type === t2;
            return (
              <Pressable
                key={t2}
                onPress={() => { Haptics.selectionAsync(); setType(t2); }}
                style={[styles.typeBtn, active && styles.typeBtnActive]}
                accessibilityRole="button"
                accessibilityLabel={t2 === 'bug' ? t('report.reportProblem') : t('report.requestFeature')}
              >
                <Ionicons name={t2 === 'bug' ? 'bug-outline' : 'bulb-outline'} size={Sizing.iconSm} color={active ? Colors.TEXT_ON_PRIMARY : Colors.PRIMARY_LIGHT} />
                <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>
                  {t2 === 'bug' ? t('report.reportProblem') : t('report.requestFeature')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.label}>{t('report.titleLabel')}</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={t('report.titlePlaceholder')}
            placeholderTextColor={Colors.TEXT_SECONDARY}
            maxLength={200}
          />

          <Text style={styles.label}>{t('report.descriptionLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('report.descriptionPlaceholder')}
            placeholderTextColor={Colors.TEXT_SECONDARY}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={2000}
          />

          <Text style={styles.charCount}>{description.length}/2000</Text>

          <Pressable
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={t('report.submit')}
          >
            <Ionicons name="send-outline" size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} />
            <Text style={styles.submitBtnText}>{submitting ? t('common.loading') : t('report.submit')}</Text>
          </Pressable>
        </View>

        {/* My Reports */}
        {myReports.length > 0 && (
          <View style={styles.myReportsSection}>
            <Text style={styles.sectionTitle}>{t('report.myReports')} ({myReports.length})</Text>
            {myReports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Ionicons name={report.type === 'bug' ? 'bug-outline' : 'bulb-outline'} size={20} color={Colors.PRIMARY_LIGHT} />
                  <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[report.status]}22` }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[report.status] }]}>{report.status}</Text>
                  </View>
                </View>
                <Text style={styles.reportDesc} numberOfLines={2}>{report.description}</Text>
                <Text style={styles.reportDate}>{new Date(report.createdAt).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>
        )}
      </PullToRefresh>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.BORDER, backgroundColor: Colors.SURFACE_RAISED, minHeight: Sizing.touchTarget },
  typeBtnActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY, ...Shadow.sm },
  typeBtnText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_PRIMARY },
  typeBtnTextActive: { color: Colors.TEXT_ON_PRIMARY, fontFamily: Typography.families.featureSemi },
  formCard: { backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.lg, borderWidth: Layout.hairline, borderColor: Colors.BORDER, ...Shadow.sm },
  label: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.xs, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.SURFACE_RAISED, borderRadius: Radius.lg, padding: Spacing.md, fontSize: Typography.sizes.md, color: Colors.TEXT_PRIMARY, borderWidth: Layout.hairline, borderColor: Colors.BORDER, marginBottom: Spacing.md, minHeight: 44 },
  textArea: { height: 120, paddingTop: Spacing.md },
  charCount: { fontSize: Typography.sizes.xs, color: Colors.TEXT_SECONDARY, textAlign: 'right', marginTop: -Spacing.sm, marginBottom: Spacing.md },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, paddingVertical: Spacing.md, minHeight: Sizing.touchTarget, ...Shadow.sm },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_ON_PRIMARY },
  myReportsSection: { marginTop: Spacing.md },
  sectionTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.displaySemi, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.md, letterSpacing: LetterSpacing.tight },
  reportCard: { backgroundColor: Colors.SURFACE, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: Layout.hairline, borderColor: Colors.BORDER },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  reportTitle: { flex: 1, fontSize: Typography.sizes.md, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  statusText: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, textTransform: 'capitalize' },
  reportDesc: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, lineHeight: 20, marginBottom: Spacing.xs },
  reportDate: { fontSize: Typography.sizes.xs, color: Colors.TEXT_SECONDARY },
});
