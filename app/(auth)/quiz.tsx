import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow, Gradients, LetterSpacing } from '../../src/constants/theme';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { useBrainScoreStore } from '../../src/stores/brainScoreStore';
import { useXPStore } from '../../src/stores/xpStore';

interface QuizQuestion {
  question: string;
  options: { text: string; score: number }[];
}

const QUESTIONS: QuizQuestion[] = [
  { question: 'How much time on social media daily?', options: [{ text: 'Under 1h', score: 0 }, { text: '1-3h', score: 4 }, { text: '3h+', score: 9 }] },
  { question: 'Can you stop scrolling when you need to?', options: [{ text: 'Easily', score: 0 }, { text: 'With effort', score: 5 }, { text: 'Nope', score: 10 }] },
  { question: 'How does social media make you feel?', options: [{ text: 'Fine', score: 0 }, { text: 'Anxious', score: 5 }, { text: 'Addicted', score: 10 }] },
];

function getResult(score: number) {
  if (score <= 10) return { icon: 'leaf-outline' as const, title: 'Mild Brain Rot', message: "You're in control. We'll keep you sharp with some light guardrails." };
  if (score <= 18) return { icon: 'warning-outline' as const, title: 'Moderate Brain Rot', message: "Bad habits are creeping in. Let's fix them before they take over." };
  return { icon: 'skull-outline' as const, title: 'Severe Brain Rot', message: "Your dopamine system is cooked. BrainRot was made for you. بنعالجك." };
}

export default function QuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const totalScore = answers.reduce((sum, a) => sum + a, 0);
  const percentage = Math.round((totalScore / (QUESTIONS.length * 10)) * 100);
  const initialBrainScore = 100 - percentage;

  const handleAnswer = (score: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleStartRecovery = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useBrainScoreStore.getState().setScore(initialBrainScore, {
      screenTimeScore: 100 - percentage * 0.3,
      taskScore: 100,
      focusScore: 100,
      prayerScore: 100,
      sleepScore: 100 - percentage * 0.1,
    });
    useXPStore.getState().addXP(25, 'Quiz completed');
    router.push('/religion-picker');
  };

  if (showResult) {
    const result = getResult(percentage);
    return (
      <SafeScreen>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.resultContent}>
          <Ionicons name={result.icon} size={52} color={Colors.PRIMARY} style={styles.resultIcon} />
          <Text style={styles.resultScore}>{percentage}% Brain Rot</Text>
          <Text style={styles.resultInitial}>Initial Brain Score: {initialBrainScore}</Text>
          <Text style={styles.resultTitle}>{result.title}</Text>
          <Text style={styles.resultMessage}>{result.message}</Text>
        </Animated.View>
        <View style={styles.resultActions}>
          <Pressable style={styles.startBtn} onPress={handleStartRecovery} accessibilityRole="button" accessibilityLabel="Start recovery">
            <Text style={styles.startBtnText}>Start My Recovery</Text>
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.progress}>{currentQuestion + 1} / {QUESTIONS.length}</Text>
        <ProgressBar progress={((currentQuestion + 1) / QUESTIONS.length) * 100} height={6} gradient={Gradients.brand} />
      </View>

      <Animated.View entering={FadeInDown.duration(400)} style={styles.questionContent}>
        <Text style={styles.question}>{question.question}</Text>
        <View style={styles.optionsList}>
          {question.options.map((option, index) => (
            <Pressable key={index} style={styles.optionBtn} onPress={() => handleAnswer(option.score)} accessibilityRole="button" accessibilityLabel={option.text}>
              <Text style={styles.optionText}>{option.text}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  progress: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, textAlign: 'center', marginBottom: Spacing.sm },
  questionContent: { flex: 1, paddingHorizontal: Spacing.xl },
  question: { fontSize: Typography.sizes.xl, color: Colors.TEXT_PRIMARY, fontWeight: 600, lineHeight: Typography.lineHeight.relaxed, marginBottom: Spacing.xl, letterSpacing: LetterSpacing.tight },
  optionsList: { gap: Spacing.md },
  optionBtn: { padding: Spacing.lg, backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.BORDER, minHeight: 52, alignItems: 'center', ...Shadow.sm },
  optionText: { fontSize: Typography.sizes.md, color: Colors.TEXT_PRIMARY, lineHeight: Typography.lineHeight.normal },
  resultContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl },
  resultIcon: { marginBottom: Spacing.xl },
  resultScore: { fontSize: Typography.sizes['4xl'], color: Colors.DANGER, fontWeight: 700, marginBottom: Spacing.md, letterSpacing: LetterSpacing.tight },
  resultInitial: { fontSize: Typography.sizes.lg, color: Colors.PRIMARY_LIGHT, fontWeight: 600, marginBottom: Spacing.lg },
  resultTitle: { fontSize: Typography.sizes['2xl'], color: Colors.TEXT_PRIMARY, fontWeight: 700, marginBottom: Spacing.md, textAlign: 'center' },
  resultMessage: { fontSize: Typography.sizes.lg, color: Colors.TEXT_SECONDARY, textAlign: 'center', lineHeight: Typography.lineHeight.relaxed },
  resultActions: { padding: Spacing.xl, paddingBottom: Spacing['3xl'] },
  startBtn: { backgroundColor: Colors.PRIMARY, borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center', ...Shadow.sm },
  startBtnText: { color: Colors.TEXT_ON_PRIMARY, fontSize: Typography.sizes.lg, fontWeight: 600 },
});
