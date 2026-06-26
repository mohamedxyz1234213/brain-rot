import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Modal, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing, Radius, Sizing, Shadow, LetterSpacing, ANIMATION } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SafeScreen, TabHeader } from '../../src/components/ui/SafeScreen';
import { SkeletonLoader } from '../../src/components/ui/SkeletonLoader';
import { useTaskStore } from '../../src/stores/taskStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { generateDayPlan, DayPlanBlock } from '../../src/services/aiService';
import { useAuthStore } from '../../src/stores/authStore';

type EnergyLevel = 'morning' | 'afternoon' | 'evening';

type TaskTab = 'today' | 'upcoming' | 'completed' | 'abandoned';
const TAB_IDS: TaskTab[] = ['today', 'upcoming', 'completed', 'abandoned'];

const PRIORITY_COLORS: Record<string, string> = {
  low: Colors.TEXT_SECONDARY,
  medium: Colors.PRIMARY_LIGHT,
  high: Colors.WARNING,
  critical: Colors.DANGER,
};

export default function TasksScreen() {
  const { t } = useTranslation();
  const activeTab = useTaskStore((s) => s.activeTab);
  const setActiveTab = useTaskStore((s) => s.setActiveTab);
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const abandonTask = useTaskStore((s) => s.abandonTask);
  const userId = useAuthStore((s) => s.user?.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [planSchedule, setPlanSchedule] = useState<DayPlanBlock[]>([]);
  const [planOffline, setPlanOffline] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('morning');

  const handleAddTask = () => {
    Keyboard.dismiss();
    if (!newTitle.trim() || !userId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addTask({
      userId,
      title: newTitle.trim(),
      priority: newPriority,
      isEatTheFrog: false,
      isAppUnlocker: false,
      isRecurring: false,
      dueDate: new Date().toISOString(),
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleCancelAddTask = () => {
    Keyboard.dismiss();
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleComplete = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeTask(id);
    const task = useTaskStore.getState().tasks.find((t) => t.id === id);
    const xpMap: Record<string, number> = { low: 10, medium: 20, high: 40, critical: 75 };
    if (task) useXPStore.getState().addXP(xpMap[task.priority] ?? 20, `Task completed: ${task.title}`);
    useStreakStore.getState().incrementStreak('tasks');
  };

  const handleAbandon = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    abandonTask(id);
    useXPStore.getState().deductXP(20, 'Task abandoned');
  };

  const handlePlanDay = async (energy: EnergyLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEnergyLevel(energy);
    setPlanLoading(true);
    try {
      const pending = useTaskStore.getState().tasks.filter((t) => t.status === 'pending');
      const result = await generateDayPlan(
        pending.map((t) => ({
          title: t.title,
          priority: t.priority,
          estimatedMinutes: t.estimatedMinutes ?? 30,
        })),
        { energyLevel: energy, workHours: 8 }
      );
      setPlanSchedule(result.schedule);
      setPlanOffline(result.isOffline);
    } catch {
      setPlanSchedule([]);
      setPlanOffline(true);
    } finally {
      setPlanLoading(false);
    }
  };

  const openPlanModal = () => {
    setShowPlanModal(true);
    handlePlanDay('morning');
  };

  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    switch (activeTab) {
      case 'today':
        return tasks.filter((task) => task.status === 'pending' && (!task.dueDate || task.dueDate.startsWith(today)));
      case 'upcoming':
        return tasks.filter((task) => task.status === 'pending' && task.dueDate && !task.dueDate.startsWith(today));
      case 'completed':
        return tasks.filter((task) => task.status === 'completed');
      case 'abandoned':
        return tasks.filter((task) => task.status === 'abandoned');
      default:
        return tasks;
    }
  }, [activeTab, tasks]);

  return (
    <SafeScreen tabBarSpacing>
      <TabHeader
        eyebrow={t('tabs.tasks')}
        title={t('tabs.tasks')}
        rightAction={
          <>
            <Button title={t('tasks.planDay')} onPress={openPlanModal} variant="ghost" size="sm" />
            <Button title={t('tasks.add')} onPress={() => setShowAddModal(true)} size="sm" />
          </>
        }
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {TAB_IDS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); }}
            accessibilityRole="button"
            accessibilityLabel={t(`tasks.${tab}`)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{t(`tasks.${tab}`)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon="clipboard-outline"
            title={t('tasks.noTasks')}
            subtitle={t('tasks.noTasksHint')}
            action={<Button title={t('tasks.addTask')} onPress={() => setShowAddModal(true)} />}
          />
        ) : (
          filteredTasks.map((task, i) => (
          <Animated.View key={task.id} entering={FadeInLeft.duration(300).delay(Math.min(i, 6) * ANIMATION.stagger)}>
              <Card dense glass style={styles.taskCard}>
                <View style={styles.taskRow}>
                  <Pressable
                    style={[styles.checkbox, task.status === 'completed' && styles.checkboxCompleted]}
                    onPress={() => task.status === 'pending' ? handleComplete(task.id) : null}
                    accessibilityRole="button"
                    accessibilityLabel={`Complete: ${task.title}`}
                  >
                    {task.status === 'completed' && <Ionicons name="checkmark" size={Sizing.iconSm} color={Colors.TEXT_ON_PRIMARY} />}
                  </Pressable>
                  <View style={styles.taskContent}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.taskTitle, task.status === 'completed' && styles.taskTitleCompleted]} numberOfLines={1}>
                        {task.title}
                      </Text>
                      {task.isEatTheFrog && <Ionicons name="flame" size={Sizing.iconSm} color={Colors.WARNING} style={styles.badge} />}
                      {task.isAppUnlocker && <Ionicons name="lock-open-outline" size={Sizing.iconSm} color={Colors.PRIMARY_LIGHT} style={styles.badge} />}
                      {task.postponeCount >= 3 && <Ionicons name="warning-outline" size={Sizing.iconSm} color={Colors.WARNING} style={styles.badge} />}
                    </View>
                    <View style={styles.metaRow}>
                      <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
                      <Text style={styles.meta}>{t(`tasks.${task.priority}`)}</Text>
                      {task.estimatedMinutes && <Text style={styles.meta}> · {task.estimatedMinutes}{t('common.min')}</Text>}
                    </View>
                  </View>
                  {task.status === 'pending' && (
                    <Pressable style={styles.abandonBtn} onPress={() => handleAbandon(task.id)} accessibilityRole="button" accessibilityLabel={`Abandon: ${task.title}`}>
                      <Ionicons name="close" size={Sizing.iconMd} color={Colors.DANGER} />
                    </Pressable>
                  )}
                </View>
              </Card>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={handleCancelAddTask}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Spacing.md}
        >
          <Animated.View entering={FadeInLeft.duration(300)} style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('tasks.newTask')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('tasks.whatToDo')}
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              accessibilityLabel={t('tasks.title')}
            />
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
                <Pressable
                  key={p}
                  style={[styles.priorityBtn, newPriority === p && styles.priorityBtnActive, { borderColor: PRIORITY_COLORS[p] }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setNewPriority(p); }}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('tasks.priority')}: ${t(`tasks.${p}`)}`}
                >
                  <Text style={[styles.priorityBtnText, newPriority === p && { color: PRIORITY_COLORS[p] }]}>{t(`tasks.${p}`)}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button title={t('common.cancel')} onPress={handleCancelAddTask} variant="ghost" size="md" />
              <Button title={t('tasks.addTask')} onPress={handleAddTask} size="md" />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showPlanModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInLeft.duration(300)} style={[styles.modalContent, styles.planContent]}>
            <Text style={styles.modalTitle}>{t('tasks.planTitle')}</Text>
            {planOffline && (
              <View style={styles.offlineNote}>
                <Ionicons name="flash-outline" size={Typography.sizes.sm} color={Colors.WARNING} />
                <Text style={styles.offlineNoteText}>{t('tasks.offlineSmart')}</Text>
              </View>
            )}

            <View style={styles.energyRow}>
              {(['morning', 'afternoon', 'evening'] as const).map((e) => (
                <Pressable
                  key={e}
                  style={[styles.energyBtn, energyLevel === e && styles.energyBtnActive]}
                  onPress={() => handlePlanDay(e)}
                  accessibilityRole="button"
                  accessibilityLabel={t(`tasks.energy${e.charAt(0).toUpperCase()}${e.slice(1)}`)}
                >
                  <Text style={[styles.energyBtnText, energyLevel === e && styles.energyBtnTextActive]}>{t(`tasks.energy${e.charAt(0).toUpperCase()}${e.slice(1)}`)}</Text>
                </Pressable>
              ))}
            </View>

            {planLoading ? (
              <View style={styles.planEmpty}>
                <SkeletonLoader width="100%" height={48} style={{ marginBottom: Spacing.sm }} />
                <SkeletonLoader width="85%" height={48} style={{ marginBottom: Spacing.sm }} />
                <SkeletonLoader width="70%" height={48} style={{ marginBottom: Spacing.md }} />
                <Text style={styles.planEmptyText}>{t('tasks.buildingSchedule')}</Text>
              </View>
            ) : planSchedule.length === 0 ? (
              <View style={styles.planEmpty}>
                <Text style={styles.planEmptyText}>{t('tasks.noPendingToSchedule')}</Text>
              </View>
            ) : (
              <ScrollView style={styles.planList} contentContainerStyle={{ paddingBottom: Spacing.md }}>
                {planSchedule.map((block, i) => (
                  <View key={i} style={styles.planBlock}>
                    <Text style={styles.planTime}>{block.time}</Text>
                    <View style={styles.planBlockBody}>
                      <Text style={[styles.planTask, block.task === 'Break' && styles.planTaskBreak]} numberOfLines={2}>
                        {block.task === 'Break' ? t('tasks.break') : block.task}
                      </Text>
                      <Text style={styles.planDuration}>{block.duration} {t('common.min')}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <Button title={t('common.done')} onPress={() => setShowPlanModal(false)} size="md" />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  tabs: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, maxHeight: Sizing.touchTarget },
  tab: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginRight: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.SURFACE, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.BORDER },
  tabActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY, ...Shadow.sm },
  tabText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, letterSpacing: 0.2 },
  tabTextActive: { color: Colors.TEXT_ON_PRIMARY, fontFamily: Typography.families.featureSemi },
  list: { flex: 1 },
  listContent: { flexGrow: 1, padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  taskCard: { marginBottom: Spacing.md },
  taskRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: Sizing.touchTarget, height: Sizing.touchTarget, borderRadius: Radius.full, borderWidth: 2, borderColor: Colors.PRIMARY_LIGHT, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  checkboxCompleted: { backgroundColor: Colors.SUCCESS, borderColor: Colors.SUCCESS },
  taskContent: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  taskTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.families.bodyMedium, color: Colors.TEXT_PRIMARY, flex: 1 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: Colors.TEXT_SECONDARY },
  badge: { marginLeft: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  priorityDot: { width: Spacing.sm, height: Spacing.sm, borderRadius: Spacing.xs, marginRight: Spacing.xs },
  meta: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, letterSpacing: 0.3, textTransform: 'uppercase' },
  abandonBtn: { padding: Spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: Colors.OVERLAY, justifyContent: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.BORDER, ...Shadow.lg },
  modalTitle: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.families.display, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.lg, letterSpacing: LetterSpacing.tight },
  input: { backgroundColor: Colors.SURFACE_RAISED, borderRadius: Radius.lg, padding: Spacing.md, fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.BORDER },
  priorityRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  priorityBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.BORDER, minHeight: Sizing.touchTarget, justifyContent: 'center' },
  priorityBtnActive: { backgroundColor: Colors.DANGER_LIGHT },
  priorityBtnText: { fontSize: Typography.sizes.xs, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, letterSpacing: 0.3, textTransform: 'uppercase' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  planContent: { maxHeight: '80%' },
  offlineNote: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  offlineNoteText: { fontSize: Typography.sizes.sm, color: Colors.WARNING, flex: 1 },
  energyRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  energyBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.BORDER, alignItems: 'center', minHeight: Sizing.touchTarget, justifyContent: 'center' },
  energyBtnActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
  energyBtnText: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, letterSpacing: 0.2, textTransform: 'capitalize' },
  energyBtnTextActive: { color: Colors.TEXT_ON_PRIMARY, fontFamily: Typography.families.featureSemi },
  planList: { marginBottom: Spacing.lg },
  planEmpty: { paddingVertical: Spacing['2xl'], alignItems: 'center', gap: Spacing.md },
  planEmptyText: { fontSize: Typography.sizes.md, fontFamily: Typography.families.body, color: Colors.TEXT_SECONDARY, textAlign: 'center' },
  planBlock: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  planTime: { width: 56, fontSize: Typography.sizes.sm, fontFamily: Typography.families.numeric, color: Colors.PRIMARY, letterSpacing: 0.2 },
  planBlockBody: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.SURFACE_RAISED, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.BORDER },
  planTask: { flex: 1, fontSize: Typography.sizes.md, fontFamily: Typography.families.bodyMedium, color: Colors.TEXT_PRIMARY },
  planTaskBreak: { color: Colors.TEXT_SECONDARY, fontStyle: 'italic' },
  planDuration: { fontSize: Typography.sizes.sm, fontFamily: Typography.families.featureMedium, color: Colors.TEXT_SECONDARY, marginLeft: Spacing.sm },
});
