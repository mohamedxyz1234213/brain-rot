import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius, Sizing } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { useTaskStore } from '../../src/stores/taskStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useStreakStore } from '../../src/stores/streakStore';

const TABS = ['Today', 'Upcoming', 'Completed', 'Abandoned'] as const;
type TaskTab = 'today' | 'upcoming' | 'completed' | 'abandoned';

const PRIORITY_COLORS: Record<string, string> = {
  low: Colors.TEXT_SECONDARY,
  medium: Colors.PRIMARY_LIGHT,
  high: Colors.WARNING,
  critical: Colors.DANGER,
};

export default function TasksScreen() {
  const activeTab = useTaskStore((s) => s.activeTab);
  const setActiveTab = useTaskStore((s) => s.setActiveTab);
  const filteredTasks = useTaskStore((s) => s.getFilteredTasks());
  const addTask = useTaskStore((s) => s.addTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const abandonTask = useTaskStore((s) => s.abandonTask);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addTask({
      userId: 'current_user',
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

  const tabMap: Record<string, TaskTab> = { Today: 'today', Upcoming: 'upcoming', Completed: 'completed', Abandoned: 'abandoned' };

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Button title="+ Add" onPress={() => setShowAddModal(true)} size="sm" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tabMap[tab] && styles.tabActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tabMap[tab]); }}
            accessibilityRole="button"
            accessibilityLabel={tab}
          >
            <Text style={[styles.tabText, activeTab === tabMap[tab] && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filteredTasks.length === 0 ? (
          <EmptyState
            emoji="📝"
            title="No tasks here"
            subtitle="Add your first task to start healing your brain"
            action={<Button title="Add Task" onPress={() => setShowAddModal(true)} />}
          />
        ) : (
          filteredTasks.map((task, i) => (
            <Animated.View key={task.id} entering={FadeInLeft.duration(300).delay(i * 50)}>
              <Card style={styles.taskCard}>
                <View style={styles.taskRow}>
                  <Pressable
                    style={[styles.checkbox, task.status === 'completed' && styles.checkboxCompleted]}
                    onPress={() => task.status === 'pending' ? handleComplete(task.id) : null}
                    accessibilityRole="button"
                    accessibilityLabel={`Complete: ${task.title}`}
                  >
                    {task.status === 'completed' && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                  <View style={styles.taskContent}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.taskTitle, task.status === 'completed' && styles.taskTitleCompleted]} numberOfLines={1}>
                        {task.title}
                      </Text>
                      {task.isEatTheFrog && <Text style={styles.badge}>🐸</Text>}
                      {task.isAppUnlocker && <Text style={styles.badge}>🔓</Text>}
                      {task.postponeCount >= 3 && <Text style={styles.badge}>⚡</Text>}
                    </View>
                    <View style={styles.metaRow}>
                      <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
                      <Text style={styles.meta}>{task.priority}</Text>
                      {task.estimatedMinutes && <Text style={styles.meta}> · {task.estimatedMinutes}min</Text>}
                    </View>
                  </View>
                  {task.status === 'pending' && (
                    <Pressable style={styles.abandonBtn} onPress={() => handleAbandon(task.id)} accessibilityRole="button" accessibilityLabel={`Abandon: ${task.title}`}>
                      <Text style={styles.abandonText}>✗</Text>
                    </Pressable>
                  )}
                </View>
              </Card>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Task</Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              accessibilityLabel="Task title"
            />
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
                <Pressable
                  key={p}
                  style={[styles.priorityBtn, newPriority === p && styles.priorityBtnActive, { borderColor: PRIORITY_COLORS[p] }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setNewPriority(p); }}
                  accessibilityRole="button"
                  accessibilityLabel={`Priority: ${p}`}
                >
                  <Text style={[styles.priorityBtnText, newPriority === p && { color: PRIORITY_COLORS[p] }]}>{p}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setShowAddModal(false)} variant="ghost" size="md" />
              <Button title="Add Task" onPress={handleAddTask} size="md" />
            </View>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  title: { fontSize: Typography.sizes['2xl'], fontWeight: 700, color: Colors.TEXT_PRIMARY },
  tabs: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, maxHeight: Sizing.touchTarget },
  tab: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginRight: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.SURFACE, minHeight: Sizing.touchTarget, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: Colors.PRIMARY },
  tabText: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY },
  tabTextActive: { color: Colors.TEXT_ON_PRIMARY, fontWeight: 600 },
  list: { flex: 1 },
  listContent: { flexGrow: 1, padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  taskCard: { marginBottom: Spacing.sm },
  taskRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: Sizing.iconMd, height: Sizing.iconMd, borderRadius: Radius.full, borderWidth: 2, borderColor: Colors.PRIMARY_LIGHT, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  checkboxCompleted: { backgroundColor: Colors.SUCCESS, borderColor: Colors.SUCCESS },
  checkmark: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.sm, fontWeight: 700 },
  taskContent: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  taskTitle: { fontSize: Typography.sizes.md, color: Colors.TEXT_PRIMARY, flex: 1 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: Colors.TEXT_SECONDARY },
  badge: { fontSize: Typography.sizes.lg, marginLeft: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  priorityDot: { width: Spacing.sm, height: Spacing.sm, borderRadius: Spacing.xs, marginRight: Spacing.xs },
  meta: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY },
  abandonBtn: { padding: Spacing.sm },
  abandonText: { fontSize: Typography.sizes.lg, color: Colors.DANGER, fontWeight: 600 },
  modalOverlay: { flex: 1, backgroundColor: Colors.OVERLAY, justifyContent: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: Colors.SURFACE, borderRadius: Radius.lg, padding: Spacing.xl },
  modalTitle: { fontSize: Typography.sizes.xl, fontWeight: 700, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.lg },
  input: { backgroundColor: Colors.SURFACE_RAISED, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.md, color: Colors.TEXT_PRIMARY, marginBottom: Spacing.lg },
  priorityRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  priorityBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.BORDER },
  priorityBtnActive: { backgroundColor: Colors.DANGER_LIGHT },
  priorityBtnText: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
});
