import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { ScoringResult, getScoreColor, getScoreLabel } from '@/services/video-parser-api';

interface ScoreVisualizationProps {
  result: ScoringResult;
}

export function ScoreVisualization({ result }: ScoreVisualizationProps) {
  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {/* Overall Score */}
        <ThemedView style={styles.overallScoreContainer}>
          <ThemedText type="title" style={styles.overallScoreTitle}>
            Overall Score
          </ThemedText>
          <ThemedText
            style={[
              styles.overallScoreValue,
              { color: getScoreColor(result.overallScore) },
            ]}
          >
            {result.overallScore.toFixed(1)}%
          </ThemedText>
          <ThemedText
            style={[
              styles.scoreLabel,
              { color: getScoreColor(result.overallScore) },
            ]}
          >
            {getScoreLabel(result.overallScore)}
          </ThemedText>
        </ThemedView>

        {/* Breakdown Scores */}
        <ThemedView style={styles.breakdownContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Score Breakdown
          </ThemedText>

          <ScoreItem
            label="Position"
            score={result.breakdown.positionScore}
            description="3D spatial similarity"
          />
          <ScoreItem
            label="Joint Angles"
            score={result.breakdown.angularScore}
            description="Joint angle matching"
          />
          <ScoreItem
            label="Timing"
            score={result.breakdown.timingScore}
            description="Video length matching"
          />
        </ThemedView>

        {/* Statistics */}
        <ThemedView style={styles.statisticsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Statistics
          </ThemedText>

          <View style={styles.statsRow}>
            <StatItem
              label="Average"
              value={result.breakdown.statistics.mean.toFixed(1)}
            />
            <StatItem
              label="Best"
              value={result.breakdown.statistics.max.toFixed(1)}
            />
          </View>
          <View style={styles.statsRow}>
            <StatItem
              label="Worst"
              value={result.breakdown.statistics.min.toFixed(1)}
            />
            <StatItem
              label="Variance"
              value={result.breakdown.statistics.variance.toFixed(1)}
            />
          </View>
        </ThemedView>

        {/* Frame Scores Chart */}
        <ThemedView style={styles.frameScoresContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Frame-by-Frame Analysis
          </ThemedText>
          <ThemedText style={styles.frameScoresSubtitle}>
            {result.frameScores.length} frames analyzed
          </ThemedText>

          <ScrollView
            horizontal
            style={styles.chartScroll}
            showsHorizontalScrollIndicator={true}
          >
            <View style={styles.chart}>
              {result.frameScores.map((score, index) => (
                <View key={index} style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(score, 5)}%`,
                        backgroundColor: getScoreColor(score),
                      },
                    ]}
                  />
                  {index % 5 === 0 && (
                    <ThemedText style={styles.barLabel}>{index + 1}</ThemedText>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

interface ScoreItemProps {
  label: string;
  score: number;
  description: string;
}

function ScoreItem({ label, score, description }: ScoreItemProps) {
  return (
    <View style={styles.scoreItem}>
      <View style={styles.scoreItemHeader}>
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
        <ThemedText style={{ color: getScoreColor(score) }}>
          {score.toFixed(1)}%
        </ThemedText>
      </View>
      <ThemedText style={styles.scoreItemDescription}>{description}</ThemedText>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${score}%`,
              backgroundColor: getScoreColor(score),
            },
          ]}
        />
      </View>
    </View>
  );
}

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.statValue}>
        {value}%
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overallScoreContainer: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  overallScoreTitle: {
    marginBottom: 12,
  },
  overallScoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  breakdownContainer: {
    padding: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  scoreItem: {
    gap: 8,
  },
  scoreItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreItemDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statisticsContainer: {
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 18,
  },
  frameScoresContainer: {
    padding: 20,
    gap: 12,
  },
  frameScoresSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  chartScroll: {
    marginTop: 8,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    gap: 2,
    paddingBottom: 20,
  },
  barContainer: {
    width: 8,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 8,
    marginTop: 4,
    opacity: 0.6,
  },
});
