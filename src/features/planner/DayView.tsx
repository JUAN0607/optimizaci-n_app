import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MONTH_LABELS, WEEKDAY_LABELS_LONG } from '@/constants/labels';
import { useActivitiesForDate } from '@/hooks/useActivities';
import { useCategoryMap } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';
import { addDaysToKey, parseDateKey, todayKey } from '@/utils/date';

import { TimeGrid } from './TimeGrid';

const HOUR_HEIGHT = 64;

interface DayViewProps {
  dateKey: string;
  onChangeDate: (dateKey: string) => void;
}

function DayPage({ dateKey, width }: { dateKey: string; width: number }) {
  const { colors, spacing, type } = useTheme();
  const activities = useActivitiesForDate(dateKey);
  const categoryMap = useCategoryMap();
  const untimed = activities.filter((a) => !a.startTime);

  const initialOffset = Math.max(0, (new Date().getHours() - 2) * HOUR_HEIGHT);

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={{ paddingBottom: 160 }}
      contentOffset={{ x: 0, y: dateKey === todayKey() ? initialOffset : HOUR_HEIGHT * 6 }}
    >
      {untimed.length > 0 && (
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.xs }}>
          {untimed.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => router.push(`/activity/${a.id}`)}
              style={[styles.untimedChip, { backgroundColor: colors.surfaceAlt, borderRadius: 8 }]}
            >
              <Text
                style={[
                  type.bodySmall,
                  { color: colors.textPrimary, textDecorationLine: a.status === 'COMPLETED' ? 'line-through' : 'none' },
                ]}
              >
                {a.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {activities.length === 0 && (
        <View style={{ paddingTop: initialOffset }}>
          <EmptyState title="Tu día está libre." message="Planifica algo nuevo o disfruta el espacio." />
        </View>
      )}

      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
        <TimeGrid
          columns={[{ dateKey, activities: activities.filter((a) => !!a.startTime) }]}
          categoryMap={categoryMap}
          onPressActivity={(id) => router.push(`/activity/${id}`)}
          hourHeight={HOUR_HEIGHT}
        />
      </View>
    </ScrollView>
  );
}

export function DayView({ dateKey, onChangeDate }: DayViewProps) {
  const { colors, spacing, type } = useTheme();
  const { width } = useWindowDimensions();
  const hScrollRef = useRef<ScrollView>(null);
  // A 3-page sliding window (yesterday/selected/tomorrow) gives infinite paging without
  // an extra pager dependency: after each swipe we recenter silently on the new date.
  const [centerDate, setCenterDate] = useState(dateKey);
  const pages = [addDaysToKey(centerDate, -1), centerDate, addDaysToKey(centerDate, 1)];

  if (centerDate !== dateKey) {
    // dateKey changed from outside (arrow button, Mes/Año selection) — recenter the window
    setCenterDate(dateKey);
  }

  const date = parseDateKey(dateKey);
  const isToday = dateKey === todayKey();
  const label = `${WEEKDAY_LABELS_LONG[date.getDay()]}, ${date.getDate()} de ${MONTH_LABELS[date.getMonth()]}`;

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    if (page === 0) onChangeDate(addDaysToKey(centerDate, -1));
    else if (page === 2) onChangeDate(addDaysToKey(centerDate, 1));
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.nav, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
        <Pressable onPress={() => onChangeDate(addDaysToKey(dateKey, -1))} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={[type.bodyMedium, { color: colors.textPrimary }]}>{label}</Text>
          {isToday && <Text style={[type.caption, { color: colors.primary }]}>HOY</Text>}
        </View>
        <Pressable onPress={() => onChangeDate(addDaysToKey(dateKey, 1))} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        ref={hScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: width, y: 0 }}
        onMomentumScrollEnd={handleMomentumEnd}
        key={centerDate}
      >
        {pages.map((d) => (
          <DayPage key={d} dateKey={d} width={width} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  untimedChip: { paddingHorizontal: 12, paddingVertical: 8 },
});
