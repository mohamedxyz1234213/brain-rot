import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
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
  { question: 'How many hours per day on social media?', options: [{ text: '< 1 hour', score: 0 }, { text: '1-2 hours', score: 2 }, { text: '2-4 hours', score: 5 }, { text: '4-6 hours', score: 8 }, { text: '6+ hours', score: 10 }] },
  { question: 'Check phone within 5 min of waking?', options: [{ text: 'Never', score: 0 }, { text: 'Sometimes', score: 3 }, { text: 'Most days', score: 6 }, { text: 'Every day', score: 10 }] },
  { question: 'Scroll when you should be sleeping?', options: [{ text: 'Never', score: 0 }, { text: 'Rarely', score: 2 }, { text: 'Few times/week', score: 5 }, { text: 'Every night', score: 8 }, { text: 'Past 2am regularly', score: 10 }] },
  { question: 'Feel when you can\'t access social media?', options: [{ text: 'Totally fine', score: 0 }, { text: 'Slightly bored', score: 2 }, { text: 'Anxious', score: 6 }, { text: 'Panic', score: 10 }] },
  { question: 'Open same app without realizing?', options: [{ text: 'Never', score: 0 }, { text: '1-2 times/day', score: 2 }, { text: '5-10 times/day', score: 5 }, { text: '10-20/day', score: 8 }, { text: '20+/day', score: 10 }] },
  { question: 'Social media affected productivity?', options: [{ text: 'Not at all', score: 0 }, { text: 'Slightly', score: 3 }, { text: 'Significantly', score: 7 }, { text: 'Ruined it', score: 10 }] },
  { question: 'Compare yourself to others on social media?', options: [{ text: 'Never', score: 0 }, { text: 'Occasionally', score: 3 }, { text: 'Frequently', score: 7 }, { text: 'Constantly', score: 10 }] },
  { question: 'Tried to reduce screen time and failed?', options: [{ text: "Don't need to", score: 0 }, { text: 'Tried once', score: 2 }, { text: 'Multiple times', score: 7 }, { text: "Can't last a day", score: 10 }] },
  { question: 'Use phone during prayers/meals/conversations?', options: [{ text: 'Never', score: 0 }, { text: 'Rarely', score: 2 }, { text: 'Sometimes', score: 5 }, { text: 'Often', score: 8 }, { text: 'Almost always', score: 10 }] },
  { question: 'Feel if you permanently deleted social media?', options: [{ text: 'Relieved', score: 0 }, { text: "I'd adapt", score: 2 }, { text: 'Worried FOMO', score: 5 }, { text: "Can't imagine it", score: 8 }, { text: 'Absolute terror', score: 10 }] },
];

function getResult(score: number) {
  if (score <= 20) return { icon: 'leaf-outline' as const, title: 'Minimal Brain Rot', message: "You're doing great! Minor optimizations will level you up." };
  if (score <= 40) return { icon: 'ellipse-outline' as const, title: 'Moderate Brain Rot', message: "Some unhealthy habits forming. Let's catch them early." };
  if (score <= 60) return { icon: 'warning-outline' as const, title: 'Significant Brain Rot', message: "Your dopamine system is compromised. Serious intervention needed." };
  if (score <= 80) return { icon: 'skull-outline' as const, title: 'Severe Brain Rot', message: "Deep in the scroll hole. BrainRot Healer was built for you." };
  return { icon: 'alert-circle-outline' as const, title: 'Critical Brain Rot', message: "Emergency intervention. Your brain runs on pure dopamine fumes." };
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
    router.push('/setup/limits');
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
        <ScrollView showsVerticalScrollIndicator={false}>
          {question.options.map((option, index) => (
            <Pressable key={index} style={styles.optionBtn} onPress={() => handleAnswer(option.score)} accessibilityRole="button" accessibilityLabel={option.text}>
              <Text style={styles.optionText}>{option.text}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  progress: { fontSize: Typography.sizes.sm, color: Colors.TEXT_SECONDARY, textAlign: 'center', marginBottom: Spacing.sm },
  questionContent: { flex: 1, paddingHorizontal: Spacing.xl },
  question: { fontSize: Typography.sizes.xl, color: Colors.TEXT_PRIMARY, fontWeight: 600, lineHeight: Typography.lineHeight.relaxed, marginBottom: Spacing.xl, letterSpacing: LetterSpacing.tight },
  optionBtn: { padding: Spacing.lg, backgroundColor: Colors.SURFACE, borderRadius: Radius.xl, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.BORDER, minHeight: 44, ...Shadow.sm },
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
