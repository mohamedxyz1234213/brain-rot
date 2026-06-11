import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface LineChartProps {
  data: number[];
  height?: number;
  color?: string;
  label?: string;
}

export function LineChart({ data, height = 100, color = theme.colors.primary, label }: LineChartProps) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.chart, { height }]}>
        {data.map((value, i) => {
          const barHeight = ((value - min) / range) * height;
          return (
            <View key={i} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(barHeight, 2),
                    backgroundColor: color,
                    opacity: 0.4 + (i / data.length) * 0.6,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

export function BarChart({ data, height = 120 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={[styles.barChart, { height: height + 30 }]}>
      <View style={[styles.barsRow, { height }]}>
        {data.map((item, i) => (
          <View key={i} style={styles.barGroup}>
            <View
              style={[
                styles.verticalBar,
                {
                  height: (item.value / max) * height,
                  backgroundColor: item.color || theme.colors.primary,
                },
              ]}
            />
            <Text style={styles.barLabel} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function PieChart({ data, size = 120 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <View style={styles.pieContainer}>
      <View style={[styles.pieCircle, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={styles.pieTotal}>{total}</Text>
        <Text style={styles.pieTotalLabel}>total</Text>
      </View>
      <View style={styles.pieLegend}>
        {data.map((item, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendValue}>{Math.round((item.value / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

interface HeatMapProps {
  data: number[][]; // 7 rows (days) × N columns (hours/weeks)
  labels?: string[];
}

export function HeatMap({ data, labels }: HeatMapProps) {
  const max = Math.max(...data.flat(), 1);

  return (
    <View style={styles.heatmap}>
      {labels && (
        <View style={styles.heatmapLabels}>
          {labels.map((label, i) => (
            <Text key={i} style={styles.heatmapLabel}>{label}</Text>
          ))}
        </View>
      )}
      {data.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.heatmapRow}>
          {row.map((value, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.heatmapCell,
                {
                  backgroundColor: value === 0
                    ? `${theme.colors.secondary}22`
                    : `${theme.colors.primary}${Math.round((value / max) * 15).toString(16)}0`,
                  opacity: value === 0 ? 0.3 : 0.4 + (value / max) * 0.6,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 2,
    width: '100%',
  },
  barChart: {},
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  verticalBar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pieCircle: {
    backgroundColor: theme.colors.surface,
    borderWidth: 6,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieTotal: {
    fontSize: theme.typography.xl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  pieTotalLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  pieLegend: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: theme.typography.sm,
    color: theme.colors.textPrimary,
  },
  legendValue: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  heatmap: {},
  heatmapLabels: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  heatmapLabel: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  heatmapRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 2,
  },
  heatmapCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});
