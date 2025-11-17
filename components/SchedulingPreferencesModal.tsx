import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Clock, X } from 'lucide-react-native';
import { SchedulingPreference } from '@/utils/lessonScheduler';
import Colors from '@/constants/colors';

interface SchedulingPreferencesModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (preferences: SchedulingPreference) => void;
  initialPreferences?: Partial<SchedulingPreference>;
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIMES = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

export default function SchedulingPreferencesModal({
  visible,
  onClose,
  onSave,
  initialPreferences,
}: SchedulingPreferencesModalProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialPreferences?.preferredDays || []
  );
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    initialPreferences?.preferredTimes || []
  );
  const [sessionDuration, setSessionDuration] = useState(
    initialPreferences?.sessionDuration || 45
  );
  const [weeklyFrequency, setWeeklyFrequency] = useState(
    initialPreferences?.weeklyFrequency || 2
  );

  const handleSave = () => {
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one preferred day');
      return;
    }
    if (selectedTimes.length === 0) {
      Alert.alert('Error', 'Please select at least one preferred time');
      return;
    }

    onSave({
      preferredDays: selectedDays,
      preferredTimes: selectedTimes,
      sessionDuration,
      weeklyFrequency,
    });

    onClose();
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Scheduling Preferences</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Days</Text>
              <View style={styles.daysGrid}>
                {DAYS.map((day) => (
                  <Pressable
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day) && styles.dayButtonSelected,
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDays.includes(day) && styles.dayButtonTextSelected,
                      ]}
                    >
                      {day.slice(0, 3)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferred Times</Text>
              <View style={styles.timeGrid}>
                {TIMES.map((time) => (
                  <Pressable
                    key={time}
                    style={[
                      styles.timeButton,
                      selectedTimes.includes(time) && styles.timeButtonSelected,
                    ]}
                    onPress={() => toggleTime(time)}
                  >
                    <Clock
                      size={16}
                      color={selectedTimes.includes(time) ? Colors.text.white : Colors.text.primary}
                    />
                    <Text
                      style={[
                        styles.timeButtonText,
                        selectedTimes.includes(time) && styles.timeButtonTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Duration</Text>
              <View style={styles.durationOptions}>
                {[30, 45, 60].map((duration) => (
                  <Pressable
                    key={duration}
                    style={[
                      styles.durationButton,
                      sessionDuration === duration && styles.durationButtonSelected,
                    ]}
                    onPress={() => setSessionDuration(duration)}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        sessionDuration === duration && styles.durationButtonTextSelected,
                      ]}
                    >
                      {duration} min
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Frequency</Text>
              <View style={styles.frequencyOptions}>
                {[1, 2, 3, 4, 5].map((frequency) => (
                  <Pressable
                    key={frequency}
                    style={[
                      styles.frequencyButton,
                      weeklyFrequency === frequency && styles.frequencyButtonSelected,
                    ]}
                    onPress={() => setWeeklyFrequency(frequency)}
                  >
                    <Text
                      style={[
                        styles.frequencyButtonText,
                        weeklyFrequency === frequency && styles.frequencyButtonTextSelected,
                      ]}
                    >
                      {frequency}x
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.background.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    maxHeight: '80%',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background.light,
  },
  dayButtonSelected: {
    backgroundColor: Colors.accent.black,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  dayButtonTextSelected: {
    color: Colors.text.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background.light,
  },
  timeButtonSelected: {
    backgroundColor: Colors.accent.black,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  timeButtonTextSelected: {
    color: Colors.text.white,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.background.light,
    alignItems: 'center',
  },
  durationButtonSelected: {
    backgroundColor: Colors.accent.black,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  durationButtonTextSelected: {
    color: Colors.text.white,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.background.light,
    alignItems: 'center',
  },
  frequencyButtonSelected: {
    backgroundColor: Colors.accent.black,
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  frequencyButtonTextSelected: {
    color: Colors.text.white,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  saveButton: {
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
});