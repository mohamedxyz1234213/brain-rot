import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

interface WrappedCard {
  id: string;
  emoji: string;
  title: string;
  value: string;
  description: string;
  color: string;
}

const WRAPPED_CARDS: WrappedCard[] = [
  {
    id: '1',
    emoji: '📱',
    title: 'Total Screen Time',
    value: '147 hours',
    description: "That's 6 days and 3 hours of your life this month.",
    color: Colors.DANGER,
  },
  {
    id: '2',
    emoji: '🏆',
    title: 'Most Used App',
    value: 'Instagram',
    description: 'You opened it 1,247 times. The app knows you better than you know yourself.',
    color: '#E1306C',
  },
  {
    id: '3',
    emoji: '📏',
    title: 'Scrolling Distance',
    value: '12.4 km',
    description: "If you walked that distance instead, you'd have burned 900 calories.",
    color: Colors.WARNING,
  },
  {
    id: '4',
    emoji: '📈',
    title: 'Best Day',
    value: 'March 15',
    description: 'Brain Score: 94. Only 28 minutes of social media. A legend was born.',
    color: Colors.SUCCESS,
  },
  {
    id: '5',
    emoji: '📉',
    title: 'Worst Day',
    value: 'March 3',
    description: 'Brain Score: 12. 6 hours on TikTok. We don\'t talk about that day.',
    color: Colors.DANGER,
  },
  {
    id: '6',
    emoji: '🔥',
    title: 'Longest Streak',
    value: '14 days',
    description: 'You kept under your limits for 2 weeks straight. Then... well.',
    color: Colors.PRIMARY,
  },
  {
    id: '7',
    emoji: '🧠',
    title: 'Brain Score Change',
    value: '+34 points',
    description: 'From Zombie (38) to Recovering (72). Real progress.',
    color: Colors.PRIMARY,
  },
  {
    id: '8',
    emoji: '⏰',
    title: 'Time Saved',
    value: '23 hours',
    description: 'Compared to last month, you spent 23 fewer hours on social media.',
    color: Colors.SUCCESS,
  },
  {
    id: '9',
    emoji: '💪',
    title: 'Tasks Completed',
    value: '87/104',
    description: '84% completion rate. Better than 78% of users.',
    color: Colors.PRIMARY,
  },
  {
    id: '10',
    emoji: '🎉',
    title: 'Your Summary',
    value: 'Recovering',
    description: "You're healing. Keep going. Next month will be even better.",
    color: Colors.SUCCESS,
  },
];

export default function AppWrappedScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderCard = ({ item }: { item: WrappedCard }) => (
    <View style={[styles.card, { width: width - Spacing.xl * 2 }]}>
      <Text style={styles.cardEmoji}>{item.emoji}</Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={[styles.cardValue, { color: item.color }]}>{item.value}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>✕ Close</Text>
        </Pressable>
        <Text style={styles.title}>🎬 App Wrapped</Text>
        <Text style={styles.subtitle}>Your month in review</Text>
      </View>

      <FlatList
        data={WRAPPED_CARDS}
        renderItem={renderCard}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardList}
        snapToInterval={width - Spacing.xl * 2 + Spacing.md}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (width - Spacing.xl * 2 + Spacing.md)
          );
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {WRAPPED_CARDS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
        <Pressable style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share Summary Card 📤</Text>
        </Pressable>
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
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  backBtn: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  cardList: {
    paddingHorizontal: Spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.SURFACE,
    borderRadius: 24,
    padding: Spacing['2xl'],
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 64,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  cardValue: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: '800',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.SECONDARY,
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: Colors.PRIMARY,
    width: 18,
  },
  shareBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: '600',
  },
});
