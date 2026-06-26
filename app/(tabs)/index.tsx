import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { ScoreShowcase } from '../../src/components/domain/ScoreShowcase';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { Colors, Gradients, LetterSpacing, Radius, Shadow, Sizing, Spacing, Typography } from '../../src/constants/theme';
import { generateMorningBriefing, NextTaskSuggestion, suggestNextTask } from '../../src/services/aiService';
import { useAuthStore } from '../../src/stores/authStore';
import { useBrainScoreStore } from '../../src/stores/brainScoreStore';
import { useFocusStore } from '../../src/stores/focusStore';
import { useReligionStore } from '../../src/stores/religionStore';
import { useScreenTimeStore } from '../../src/stores/screenTimeStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useTaskStore } from '../../src/stores/taskStore';
import { useXPStore } from '../../src/stores/xpStore';

const todayKey = () => new Date().toISOString().split('T')[0];

let briefingDismissedOn: string | null = null;

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = (i18n.language as 'en' | 'ar') ?? 'en';
  const isArabic = lang === 'ar';
  const userReligion = useAuthStore((s) => s.user?.religion) ?? 'muslim';

  const user = useAuthStore((s) => s.user);
  const brainScore = useBrainScoreStore((s) => s.currentScore);
  const levelName = useBrainScoreStore((s) => s.getLevelName());
  const scores = useBrainScoreStore((s) => s.scores);
  const breakdown = useBrainScoreStore((s) => s.breakdown);
  const totalMinutes = useScreenTimeStore((s) => s.totalMinutesToday);
  const limits = useScreenTimeStore((s) => s.limits);
  const logs = useScreenTimeStore((s) => s.logs);
  const prayerLogs = useReligionStore((s) => s.prayerLogs);
  const tasks = useTaskStore((s) => s.tasks);
  const frogTask = useTaskStore((s) => s.getEatTheFrogTask());
  const activeSession = useFocusStore((s) => s.activeSession);
  const totalFocusMinutes = useFocusStore((s) => s.totalFocusMinutesToday);
  const streak = useStreakStore((s) => s.getStreak('screen_time'));
  const xp = useXPStore((s) => s.xp);
  const level = useXPStore((s) => s.level);
  const levelInfo = useXPStore((s) => s.levelInfo);

  const todayTasks = tasks.filter((t) => t.status === 'pending');
  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const today = todayKey();
  const prayerCount = prayerLogs.filter(
    (l) => l.date.startsWith(today) && (l.status === 'on_time' || l.status === 'late')
  ).length;
  const screenTimeHours = Math.floor(totalMinutes / 60);
  const screenTimeMins = totalMinutes % 60;

  const usedForLimit = useCallback(
    (appBundleId: string) =>
      logs
        .filter((lg) => lg.appBundleId === appBundleId)
        .reduce((sum, lg) => sum + lg.minutesUsed, 0),
    [logs]
  );

  const morningBriefingEnabled = useSettingsStore((s) => s.morningBriefingEnabled);
  const [briefing, setBriefing] = useState<string | null>(null);

  useEffect(() => {
    if (!morningBriefingEnabled) return;
    if (briefingDismissedOn === todayKey()) return;
    let cancelled = false;
    const yesterday = scores.length > 1 ? scores[1] : scores[0];
    generateMorningBriefing(user?.name ?? 'you', {
      screenTime: totalMinutes,
      tasksCompleted: completedToday,
      tasksTotal: todayTasks.length + completedToday,
      brainScore: yesterday?.score ?? brainScore,
      streakDays: streak?.currentDays ?? 0,
    }, lang).then((text) => {
      if (!cancelled) setBriefing(text);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morningBriefingEnabled]);

  const dismissBriefing = () => {
    Haptics.selectionAsync();
    briefingDismissedOn = todayKey();
    setBriefing(null);
  };

  // AI next-task suggestion
  const [suggestion, setSuggestion] = useState<NextTaskSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const refreshSuggestion = useCallback(async () => {
    const pending = useTaskStore.getState().tasks.filter((t) => t.status === 'pending');
    if (!pending.length) { setSuggestion(null); setLoadingSuggestion(false); return; }
    setLoadingSuggestion(true);
    try {
      const hour = new Date().getHours();
      const res = await suggestNextTask(
        pending.map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          estimatedMinutes: t.estimatedMinutes,
          isEatTheFrog: t.isEatTheFrog,
          postponeCount: t.postponeCount,
        })),
        { currentHour: hour, lang }
      );
      setSuggestion(res);
    } catch {
      setSuggestion(null);
    } finally {
      setLoadingSuggestion(false);
    }
  }, [lang]);

  useEffect(() => { refreshSuggestion(); }, [refreshSuggestion, tasks.length]);

  // Score delta (today vs yesterday)
  const yesterdayScore = scores.length > 1 ? scores[1]?.score : null;
  const delta = yesterdayScore != null ? Math.round(brainScore - yesterdayScore) : null;

  // Recalculate score whenever underlying signals change so the showcase
  // breakdown reflects real, current state instead of a stale snapshot.
  useEffect(() => {
    const allTasks = useTaskStore.getState().tasks;
    const done = allTasks.filter((t) => t.status === 'completed').length;
    const limits = useScreenTimeStore.getState().limits;
    const hasScoreInput =
      totalMinutes > 0 ||
      totalFocusMinutes > 0 ||
      completedToday > 0 ||
      prayerCount > 0 ||
      allTasks.length > 0;

    if (!hasScoreInput) {
      useBrainScoreStore.getState().resetScores();
      return;
    }

    const stLimit = limits.reduce((s, l) => s + l.dailyLimitMinutes, 0);
    const focusMin = useFocusStore.getState().totalFocusMinutesToday;
    const religionEnabled = useSettingsStore.getState().religionEnabled;
    const day = todayKey();
    const prayed = useReligionStore
      .getState()
      .prayerLogs.filter(
        (l) => l.date.startsWith(day) && (l.status === 'on_time' || l.status === 'late')
      ).length;
    useBrainScoreStore.getState().calculateScore({
      screenTimeMinutes: totalMinutes,
      screenTimeLimit: stLimit,
      tasksCompleted: done,
      tasksTotal: allTasks.length,
      focusSessions: focusMin >= 50 ? 2 : focusMin > 0 ? 1 : 0,
      prayersCompleted: prayed,
      prayersTotal: 5,
      sleepHour: 23,
      religionEnabled,
    });
  }, [totalMinutes, totalFocusMinutes, completedToday, prayerCount, tasks.length]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const stMinutes = useScreenTimeStore.getState().calculateTotalMinutes();
    const allTasks = useTaskStore.getState().tasks;
    const done = allTasks.filter((t) => t.status === 'completed').length;
    const limits = useScreenTimeStore.getState().limits;
    const focusMin = useFocusStore.getState().totalFocusMinutesToday;
    const day = todayKey();
    const prayed = useReligionStore
      .getState()
      .prayerLogs.filter(
        (l) => l.date.startsWith(day) && (l.status === 'on_time' || l.status === 'late')
      ).length;
    const hasScoreInput =
      stMinutes > 0 ||
      focusMin > 0 ||
      done > 0 ||
      prayed > 0 ||
      allTasks.length > 0;

    if (!hasScoreInput) {
      useBrainScoreStore.getState().resetScores();
      refreshSuggestion();
      setRefreshing(false);
      return;
    }

    const stLimit = limits.reduce((s, l) => s + l.dailyLimitMinutes, 0);
    const religionEnabled = useSettingsStore.getState().religionEnabled;

    useBrainScoreStore.getState().calculateScore({
      screenTimeMinutes: stMinutes,
      screenTimeLimit: stLimit,
      tasksCompleted: done,
      tasksTotal: allTasks.length,
      focusSessions: focusMin >= 50 ? 2 : focusMin > 0 ? 1 : 0,
      prayersCompleted: prayed,
      prayersTotal: 5,
      sleepHour: 23,
      religionEnabled,
    });
    refreshSuggestion();
    setRefreshing(false);
  }, [refreshSuggestion]);

  const handleCompleteFrog = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (frogTask) {
      useTaskStore.getState().completeTask(frogTask.id);
      useXPStore.getState().addXP(75, 'Eat the Frog completed');
      useStreakStore.getState().incrementStreak('tasks');
    }
  };

  const handleStartSuggestion = () => {
    if (!suggestion) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/(tabs)/focus', params: { taskId: suggestion.taskId } });
  };

  const handleCompleteSuggestion = () => {
    if (!suggestion) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useTaskStore.getState().completeTask(suggestion.taskId);
    useXPStore.getState().addXP(20, 'Task completed from coach pick');
    useStreakStore.getState().incrementStreak('tasks');
    refreshSuggestion();
  };

  const greeting = user?.name ? `${t('dashboard.greeting')} ${user.name}` : t('dashboard.greetingFallback');
  const dateLabel = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const focusModeLabel = activeSession ? t(`dashboard.focusMode${activeSession.mode.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')}`) : '';

  return (
    <SafeScreen tabBarSpacing>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.PRIMARY_LIGHT}
            colors={[Colors.PRIMARY_LIGHT]}
          />
        }
      >
        <View style={[styles.headerBlock, isArabic && styles.rtlBlock]}>
          <View style={[styles.headerTop, isArabic && styles.rowReverse]}>
            <Text style={[styles.headerEyebrow, isArabic && styles.eyebrowArabic]} numberOfLines={1} ellipsizeMode="tail">{dateLabel}</Text>
            <View style={styles.heroPill}>
              <View style={styles.heroDot} />
              <Text style={[styles.heroPillText, isArabic && styles.microArabic]}>{t('common.live')}</Text>
            </View>
          </View>
          <Text style={[styles.headerTitle, isArabic && styles.textArabicRight]} numberOfLines={1}>{greeting}</Text>
          <Text style={[styles.headerSubtitle, isArabic && styles.textArabicRight]} numberOfLines={1}>{t('dashboard.subtitle')}</Text>
        </View>

        <ScoreShowcase
          score={brainScore}
          levelName={levelName}
          delta={delta}
          breakdown={breakdown}
          style={styles.scoreCard}
        />

        {briefing && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card glass style={styles.briefingCard}>
              <View style={styles.briefingHeader}>
                <View style={styles.briefingTagRow}>
                  <Ionicons name="sunny-outline" size={Sizing.iconSm} color={Colors.PRIMARY_LIGHT} />
                  <Text style={[styles.briefingTag, isArabic && styles.microArabic]}>{t('dashboard.morningBriefing')}</Text>
                </View>
                <Pressable onPress={dismissBriefing} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss briefing">
                  <Ionicons name="close" size={Sizing.iconMd} color={Colors.TEXT_SECONDARY} />
                </Pressable>
              </View>
              <Text style={[styles.briefingText, isArabic && styles.textArabicRight]}>{briefing}</Text>
            </Card>
          </Animated.View>
        )}

        {/* AI Coach Pick */}
        <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.sectionBlock}>
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionAccent} />
            <View style={styles.suggestionHeader}>
              <View style={styles.suggestionTagRow}>
                <View style={styles.sparkBadge}>
                  <Ionicons name="sparkles" size={12} color={Colors.TEXT_ON_PRIMARY} />
                </View>
                <Text style={[styles.suggestionTag, isArabic && styles.microArabic]}>{t('dashboard.aiSuggestion')}</Text>
              </View>
              {suggestion?.isOffline && (
                <View style={styles.offlineTag}>
                  <Ionicons name="flash-outline" size={11} color={Colors.WARNING} />
                  <Text style={[styles.offlineTagText, isArabic && styles.microArabic]}>{t('dashboard.aiOffline')}</Text>
                </View>
              )}
            </View>
            {!suggestion ? (
              <Text style={[styles.suggestionEmpty, isArabic && styles.textArabicRight]}>
                {loadingSuggestion ? t('common.loading') : t('dashboard.aiSuggestionEmpty')}
              </Text>
            ) : (
              <>
                <Text style={[styles.suggestionTitle, isArabic && styles.textArabicRight]} numberOfLines={2}>{suggestion.title}</Text>
                <Text style={[styles.suggestionReason, isArabic && styles.textArabicRight]} numberOfLines={3}>{suggestion.reason}</Text>
                <View style={styles.suggestionMetaRow}>
                  <View style={styles.suggestionMetaPill}>
                    <Ionicons name="time-outline" size={12} color={Colors.PRIMARY_DARK} />
                    <Text style={[styles.suggestionMetaText, isArabic && styles.microArabic]}>{suggestion.estimatedMinutes} {t('common.min')}</Text>
                  </View>
                  <View style={[styles.suggestionMetaPill, styles.priorityPill]}>
                    <Text style={[styles.suggestionMetaText, isArabic && styles.microArabic]}>{t(`tasks.${suggestion.priority}`)}</Text>
                  </View>
                </View>
                <View style={styles.suggestionActions}>
                  <Button title={t('dashboard.startNow')} onPress={handleStartSuggestion} size="sm" variant="primary" />
                  <Pressable onPress={handleCompleteSuggestion} style={styles.doneInlineBtn} accessibilityRole="button">
                    <Ionicons name="checkmark-circle-outline" size={Sizing.iconMd} color={Colors.SUCCESS} />
                    <Text style={[styles.doneInlineText, isArabic && styles.microArabic]}>{t('common.done')}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.sectionBlock}>
          <View style={[styles.sectionHeaderRow, isArabic && styles.rowReverse]}>
            <Text style={[styles.sectionTitle, isArabic && styles.textArabicRight]}>{t('dashboard.todayOverview')}</Text>
            <Text style={[styles.sectionMeta, isArabic && styles.microArabic]}>{t('dashboard.liveOverview')}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
            <StatCard label={t('dashboard.screenTime')} value={`${screenTimeHours}${t('common.hours')} ${screenTimeMins}${t('common.min')}`} progress={Math.min((totalMinutes / 180) * 100, 100)} isArabic={isArabic} />
            <StatCard label={t('dashboard.tasksCompleted')} value={`${completedToday}/${todayTasks.length + completedToday}`} progress={todayTasks.length > 0 ? (completedToday / (todayTasks.length + completedToday)) * 100 : 0} isArabic={isArabic} />
            <StatCard label={t('dashboard.focusMinutes')} value={`${totalFocusMinutes} ${t('common.min')}`} progress={Math.min((totalFocusMinutes / 60) * 100, 100)} isArabic={isArabic} />
            {userReligion === 'muslim' && <StatCard label={t('dashboard.prayers')} value={`${prayerCount}/5`} progress={prayerCount * 20} isArabic={isArabic} />}
            <StatCard label={t('dashboard.streak')} value={`${streak?.currentDays ?? 0}`} progress={100} isArabic={isArabic} />
          </ScrollView>
        </Animated.View>

        {frogTask && (
          <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.sectionBlock}>
            <Card glass style={styles.frogCard}>
              <View style={styles.frogIconWrap}>
                <Ionicons name="flame" size={Sizing.iconLg} color={Colors.WARNING} />
              </View>
              <Text style={styles.frogTitle}>{t('dashboard.eatTheFrog')}</Text>
              <Text style={styles.frogTask} numberOfLines={2}>{frogTask.title}</Text>
              <Button title={t('dashboard.completeToUnlock')} onPress={handleCompleteFrog} size="sm" variant="primary" />
            </Card>
          </Animated.View>
        )}

        {limits.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.sectionBlock}>
            <View style={[styles.sectionHeaderRow, isArabic && styles.rowReverse]}>
              <Text style={[styles.sectionTitle, isArabic && styles.textArabicRight]}>{t('dashboard.appLimits')}</Text>
              <Text style={[styles.sectionMeta, isArabic && styles.microArabic]}>{t('dashboard.appsTracked', { count: limits.length })}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.limitRow}>
              {limits.map((limit, i) => (
                <Animated.View key={limit.id} entering={FadeInRight.duration(300).delay(i * 100)}>
                  <AppLimitPill name={limit.appName} used={usedForLimit(limit.appBundleId)} limit={limit.dailyLimitMinutes} isHard={limit.isHardBlock} hardLabel={t('dashboard.hardBlock')} minLabel={t('common.min')} isArabic={isArabic} />
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.sectionBlock}>
          <Card glass style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={{ flex: 1, marginRight: Spacing.md }}>
                <Text style={[styles.levelKicker, isArabic && styles.microArabic]}>{t('dashboard.growth')}</Text>
                <Text style={[styles.levelTitle, isArabic && styles.textArabicRight]} numberOfLines={1}>{t('dashboard.level', { level })}</Text>
              </View>
              <Text style={styles.levelPercent}>{Math.round(levelInfo.progress * 100)}%</Text>
            </View>
            <Text style={[styles.xpText, isArabic && styles.textArabicRight]}>{t('dashboard.xpToNext', { xp })}</Text>
            <ProgressBar progress={levelInfo.progress * 100} height={7} backgroundColor="rgba(67,104,111,0.10)" gradient={Gradients.brand} />
          </Card>
        </Animated.View>

        {activeSession && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.sectionBlock}>
            <Card glass style={styles.focusCard}>
              <View style={styles.focusHeader}>
                <View style={styles.focusDot} />
                <Text style={[styles.focusTitle, isArabic && styles.textArabicRight]}>{t('dashboard.focusActive')}</Text>
              </View>
              <Text style={[styles.focusMode, isArabic && styles.textArabicRight]}>{focusModeLabel} · {Math.floor((activeSession.targetMinutes * 60 - useFocusStore.getState().remainingSeconds) / 60)} {t('common.min')}</Text>
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.sectionBlock}>
          <Card glass style={styles.motivationCard}>
            <Text style={[styles.motivationText, isArabic && styles.textArabicRight]}>"{t('dashboard.motivation')}"</Text>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeScreen>
  );
}

function StatCard({ label, value, progress, isArabic }: { label: string; value: string; progress: number; isArabic: boolean }) {
  return (
    <Card dense glass style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statLabel, isArabic && styles.microArabic]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{label}</Text>
      <ProgressBar progress={progress} height={5} gradient={Gradients.brand} />
    </Card>
  );
}

function AppLimitPill({ name, used, limit, isHard, hardLabel, minLabel, isArabic }: { name: string; used: number; limit: number; isHard: boolean; hardLabel: string; minLabel: string; isArabic: boolean }) {
  const progress = (used / limit) * 100;
  const color = progress > 90 ? Colors.DANGER : progress > 70 ? Colors.WARNING : Colors.PRIMARY_LIGHT;
  return (
    <Card dense glass style={styles.appLimitPill}>
      <Text style={[styles.appName, isArabic && styles.textArabicRight]}>{name}</Text>
      <Text style={[styles.appTime, isArabic && styles.textArabicRight]}>{used} {minLabel} / {limit} {minLabel}</Text>
      {isHard && <Text style={[styles.hardBadge, isArabic && styles.microArabic]}>{hardLabel}</Text>}
      <ProgressBar progress={progress} color={color} height={5} gradient={progress <= 70 ? Gradients.brand : undefined} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing['3xl'] },
  headerBlock: { marginBottom: Spacing.lg, paddingHorizontal: Spacing.xs },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  headerEyebrow: { flex: 1, marginRight: Spacing.sm, fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  headerTitle: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.families.display, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  headerSubtitle: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginTop: 2 },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: 'rgba(90,143,123,0.14)', borderWidth: 1, borderColor: 'rgba(90,143,123,0.32)' },
  heroPillText: { fontSize: 10, fontFamily: Typography.families.featureSemi, color: Colors.SUCCESS, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.SUCCESS },
  scoreCard: { marginBottom: Spacing['2xl'] },
  sectionBlock: { marginBottom: Spacing['2xl'] },
  briefingCard: { marginBottom: Spacing.xl, borderLeftWidth: Spacing.xs, borderLeftColor: Colors.PRIMARY },
  briefingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  briefingTagRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  briefingTag: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  briefingText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_PRIMARY, lineHeight: Typography.lineHeight.relaxed },
  suggestionCard: { position: 'relative', borderRadius: Radius.xl, padding: Spacing.xl, backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: 'rgba(67,104,111,0.18)', overflow: 'hidden', ...Shadow.md },
  suggestionAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: Colors.PRIMARY },
  suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  suggestionTagRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sparkBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.PRIMARY },
  suggestionTag: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  offlineTag: { flexDirection: 'row', alignItems: 'center', gap: 0, paddingHorizontal: Spacing.sm, paddingVertical: 1, borderRadius: Radius.full, backgroundColor: Colors.WARNING_LIGHT },
  offlineTagText: { fontSize: 9, color: Colors.WARNING, fontFamily: Typography.families.featureSemi, letterSpacing: 0.3, textTransform: 'uppercase' },
  suggestionEmpty: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, paddingVertical: Spacing.sm },
  suggestionTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.families.displaySemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight, marginBottom: Spacing.xs },
  suggestionReason: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, lineHeight: Typography.lineHeight.normal, marginBottom: Spacing.md },
  suggestionMetaRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  suggestionMetaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: 'rgba(67,104,111,0.10)' },
  priorityPill: { backgroundColor: 'rgba(194,145,78,0.16)' },
  suggestionMetaText: { fontSize: 11, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY_DARK, letterSpacing: 0.4, textTransform: 'uppercase' },
  suggestionActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  doneInlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: Spacing.xs },
  doneInlineText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureSemi, color: Colors.SUCCESS, letterSpacing: 0.3 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.families.displaySemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  sectionMeta: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_SECONDARY, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase', paddingBottom: 2 },
  statsRow: { paddingBottom: Spacing.xs, gap: Spacing.md },
  statCard: { width: 136, minHeight: 116, padding: Spacing.lg, borderColor: 'rgba(67,104,111,0.10)' },
  statValue: { fontSize: Typography.sizes.xl, fontFamily: Typography.families.numeric, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  statLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.sm, marginTop: 2, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  frogCard: { alignItems: 'center', borderColor: 'rgba(194,145,78,0.24)', backgroundColor: 'rgba(255,255,255,0.80)' },
  frogIconWrap: { width: 52, height: 52, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, backgroundColor: Colors.WARNING_LIGHT, borderWidth: 1, borderColor: 'rgba(194,145,78,0.22)' },
  frogTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  frogTask: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, marginBottom: Spacing.lg, textAlign: 'center', lineHeight: Typography.lineHeight.normal },
  limitRow: { paddingBottom: Spacing.xs, gap: Spacing.md },
  levelCard: { borderColor: 'rgba(67,104,111,0.12)' },
  levelHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.sm },
  levelKicker: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.PRIMARY, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase', marginBottom: 2 },
  levelTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.families.displaySemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  levelPercent: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.families.numeric, color: Colors.PRIMARY_DARK, letterSpacing: LetterSpacing.tight },
  xpText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.bodyMedium, color: Colors.TEXT_SECONDARY, marginBottom: Spacing.md },
  focusCard: { borderColor: 'rgba(87,126,134,0.22)', backgroundColor: 'rgba(255,255,255,0.82)' },
  focusHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  focusDot: { width: 9, height: 9, borderRadius: Radius.full, backgroundColor: Colors.SUCCESS },
  focusTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY },
  focusMode: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginTop: Spacing.xs, lineHeight: Typography.lineHeight.normal },
  motivationCard: { borderColor: 'rgba(40,49,51,0.08)' },
  motivationText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_PRIMARY, lineHeight: Typography.lineHeight.relaxed, fontStyle: 'italic' },
  appLimitPill: { width: 150, minHeight: 118, padding: Spacing.lg, borderColor: 'rgba(40,49,51,0.08)', ...Shadow.sm },
  appName: { fontSize: Typography.sizes.md, fontFamily: Typography.families.featureSemi, color: Colors.TEXT_PRIMARY, letterSpacing: LetterSpacing.tight },
  appTime: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, marginVertical: Spacing.xs },
  hardBadge: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureSemi, color: Colors.DANGER, marginBottom: Spacing.xs, letterSpacing: LetterSpacing.wide, textTransform: 'uppercase' },
  rtlBlock: { direction: 'rtl' },
  rowReverse: { flexDirection: 'row-reverse' },
  textArabicRight: { textAlign: 'right', writingDirection: 'rtl' },
  eyebrowArabic: { marginRight: 0, marginLeft: Spacing.sm, textAlign: 'right', writingDirection: 'rtl', letterSpacing: 0, textTransform: 'none', fontFamily: Typography.families.bodySemibold, includeFontPadding: false },
  microArabic: { letterSpacing: 0, textTransform: 'none', fontFamily: Typography.families.bodySemibold, writingDirection: 'rtl', includeFontPadding: false },
});
