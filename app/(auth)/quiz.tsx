import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

interface QuizQuestion {
  question: string;
  options: { text: string; score: number }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    question: 'How many hours per day do you spend on social media?',
    options: [
      { text: 'Less than 1 hour', score: 0 },
      { text: '1-2 hours', score: 2 },
      { text: '2-4 hours', score: 5 },
      { text: '4-6 hours', score: 8 },
      { text: '6+ hours', score: 10 },
    ],
  },
  {
    question: 'How often do you check your phone within 5 minutes of waking up?',
    options: [
      { text: 'Never', score: 0 },
      { text: 'Sometimes', score: 3 },
      { text: 'Most days', score: 6 },
      { text: 'Every single day', score: 10 },
    ],
  },
  {
    question: 'Do you scroll social media when you should be sleeping?',
    options: [
      { text: 'Never', score: 0 },
      { text: 'Rarely', score: 2 },
      { text: 'A few times a week', score: 5 },
      { text: 'Every night', score: 8 },
      { text: 'I regularly stay up past 2am scrolling', score: 10 },
    ],
  },
  {
    question: 'How do you feel when you can\'t access social media?',
    options: [
      { text: 'Totally fine', score: 0 },
      { text: 'Slightly bored', score: 2 },
      { text: 'Anxious or restless', score: 6 },
      { text: 'Extremely uncomfortable / panic', score: 10 },
    ],
  },
  {
    question: 'How many times do you open the same app without realizing?',
    options: [
      { text: 'Never', score: 0 },
      { text: '1-2 times/day', score: 2 },
      { text: '5-10 times/day', score: 5 },
      { text: '10-20 times/day', score: 8 },
      { text: '20+ times/day', score: 10 },
    ],
  },
  {
    question: 'Has social media affected your productivity?',
    options: [
      { text: 'Not at all', score: 0 },
      { text: 'Slightly', score: 3 },
      { text: 'Significantly', score: 7 },
      { text: 'It has ruined my productivity', score: 10 },
    ],
  },
  {
    question: 'Do you compare yourself to others on social media?',
    options: [
      { text: 'Never', score: 0 },
      { text: 'Occasionally', score: 3 },
      { text: 'Frequently, and it affects my mood', score: 7 },
      { text: 'Constantly, it makes me feel terrible', score: 10 },
    ],
  },
  {
    question: 'Have you tried to reduce screen time before and failed?',
    options: [
      { text: "Never tried / don't need to", score: 0 },
      { text: "Tried once, it wasn't too hard", score: 2 },
      { text: 'Tried multiple times, usually fail', score: 7 },
      { text: "Can't last more than a day", score: 10 },
    ],
  },
  {
    question: 'How often do you use your phone during prayers, meals, or conversations?',
    options: [
      { text: 'Never', score: 0 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 5 },
      { text: 'Often', score: 8 },
      { text: 'Almost always', score: 10 },
    ],
  },
  {
    question: 'If you could permanently delete all social media, how would you feel?',
    options: [
      { text: 'Relieved', score: 0 },
      { text: "Fine, I'd adapt", score: 2 },
      { text: 'Worried about missing out', score: 5 },
      { text: "Can't imagine life without it", score: 8 },
      { text: "Absolute terror — it's my whole life", score: 10 },
    ],
  },
];

function getResultMessage(score: number): { emoji: string; title: string; message: string } {
  if (score <= 20) return { emoji: '🧘', title: 'Minimal Brain Rot', message: "You're doing great! Minor optimizations will level you up." };
  if (score <= 40) return { emoji: '😐', title: 'Moderate Brain Rot', message: "You have some unhealthy habits forming. Let's catch them early." };
  if (score <= 60) return { emoji: '😰', title: 'Significant Brain Rot', message: "Your dopamine system is compromised. It's time for serious intervention." };
  if (score <= 80) return { emoji: '🧟', title: 'Severe Brain Rot', message: "You're deep in the scroll hole. BrainRot Healer was built for you." };
  return { emoji: '💀', title: 'Critical Brain Rot', message: "Emergency intervention needed. Your brain is running on pure dopamine fumes." };
}

export default function QuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const totalScore = answers.reduce((sum, a) => sum + a, 0);
  const maxPossible = QUESTIONS.length * 10;
  const percentage = Math.round((totalScore / maxPossible) * 100);

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const result = getResultMessage(percentage);
    return (
      <View style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.resultEmoji}>{result.emoji}</Text>
          <Text style={styles.resultScore}>{percentage}%</Text>
          <Text style={styles.resultTitle}>{result.title}</Text>
          <Text style={styles.resultMessage}>{result.message}</Text>
        </View>
        <View style={styles.resultActions}>
          <Pressable
            style={styles.startBtn}
            onPress={() => router.push('/(auth)/setup/limits')}
          >
            <Text style={styles.startBtnText}>Start My Recovery →</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          {currentQuestion + 1} / {QUESTIONS.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.questionContent}>
        <Text style={styles.question}>{question.question}</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {question.options.map((option, index) => (
            <Pressable
              key={index}
              style={styles.optionBtn}
              onPress={() => handleAnswer(option.score)}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  progress: {
    fontSize: Typography.sizes.sm,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: `${Colors.SECONDARY}33`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 2,
  },
  questionContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  question: {
    fontSize: Typography.sizes.xl,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: Spacing.xl,
  },
  optionBtn: {
    padding: Spacing.lg,
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 22,
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  resultScore: {
    fontSize: Typography.sizes['4xl'],
    color: Colors.DANGER,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultActions: {
    padding: Spacing.xl,
    paddingBottom: 48,
  },
  startBtn: {
    paddingVertical: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
  },
});
