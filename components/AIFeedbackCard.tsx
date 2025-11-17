import { BookOpen, Lightbulb, Target } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Colors from '@/constants/colors';

interface AIFeedbackCardProps {
  summary: string;
  identifiedIssues: string[];
  suggestedLessons: string[];
  recommendedActions: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  confidenceLevel?: number;
  skillProgress?: number;
  adaptiveMetrics?: {
    comprehensionScore: number;
    engagementLevel: number;
    practiceEfficiency: number;
  };
  onLessonPress?: (lesson: string) => void;
  onActionPress?: (action: string) => void;
}

export default function AIFeedbackCard({
  summary,
  identifiedIssues,
  suggestedLessons,
  recommendedActions,
  learningStyle,
  confidenceLevel,
  skillProgress,
  adaptiveMetrics,
  onLessonPress,
  onActionPress
}: AIFeedbackCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Lightbulb size={24} color={Colors.accent.black} />
        <Text style={styles.title}>AI Coach Insights</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.summary}>{summary}</Text>
        
        {learningStyle && (
          <View style={styles.learningMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Learning Style</Text>
              <Text style={styles.metricValue}>
                {learningStyle.charAt(0).toUpperCase() + learningStyle.slice(1)}
              </Text>
            </View>
            
            {confidenceLevel !== undefined && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Confidence</Text>
                <Text style={styles.metricValue}>{confidenceLevel}/5</Text>
              </View>
            )}
            
            {skillProgress !== undefined && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Progress</Text>
                <Text style={styles.metricValue}>{Math.round(skillProgress)}%</Text>
              </View>
            )}
          </View>
        )}
        
        {adaptiveMetrics && (
          <View style={styles.adaptiveMetrics}>
            <View style={styles.adaptiveMetricItem}>
              <Text style={styles.adaptiveMetricLabel}>Comprehension</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${adaptiveMetrics.comprehensionScore * 100}%` }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.adaptiveMetricItem}>
              <Text style={styles.adaptiveMetricLabel}>Engagement</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${adaptiveMetrics.engagementLevel * 100}%` }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.adaptiveMetricItem}>
              <Text style={styles.adaptiveMetricLabel}>Practice Efficiency</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${adaptiveMetrics.practiceEfficiency * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}
        
        {identifiedIssues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identified Areas for Improvement</Text>
            {identifiedIssues.map((issue, index) => (
              <View key={index} style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{issue}</Text>
              </View>
            ))}
          </View>
        )}
        
        {suggestedLessons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Lessons</Text>
            {suggestedLessons.map((lesson, index) => (
              <Pressable 
                key={index} 
                style={styles.lessonItem}
                onPress={() => onLessonPress?.(lesson)}
              >
                <BookOpen size={16} color={Colors.accent.black} />
                <Text style={styles.lessonText}>{lesson}</Text>
              </Pressable>
            ))}
          </View>
        )}
        
        {recommendedActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Actions</Text>
            {recommendedActions.map((action, index) => (
              <View key={index} style={styles.bulletItem}>
                <Target size={16} color={Colors.accent.black} />
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  content: {
    gap: 20,
  },
  summary: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.black,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  lessonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  learningMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 12,
    padding: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  adaptiveMetrics: {
    gap: 12,
  },
  adaptiveMetricItem: {
    gap: 8,
  },
  adaptiveMetricLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.black,
  },
});