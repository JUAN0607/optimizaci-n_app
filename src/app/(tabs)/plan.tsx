import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '@/components/FilterChip';
import { SegmentedControl } from '@/components/SegmentedControl';
import { DayView } from '@/features/planner/DayView';
import { MonthView } from '@/features/planner/MonthView';
import { WeekView } from '@/features/planner/WeekView';
import { YearView } from '@/features/planner/YearView';
import { useCategories } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';
import { todayKey } from '@/utils/date';

type ViewMode = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export default function PlanScreen() {
  const { colors, spacing, type } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('DAY');
  const [dateKey, setDateKey] = useState(todayKey());
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const categories = useCategories();

  const selectDateAndGoToDay = (key: string) => {
    setDateKey(key);
    setViewMode('DAY');
  };

  const selectMonthAndGoToMonth = (key: string) => {
    setDateKey(key);
    setViewMode('MONTH');
  };

  const toggleCategory = (id: string) => {
    setCategoryFilter((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
        }}
      >
        <Text style={[type.h2, { color: colors.textPrimary }]}>Plan</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pressable
            onPress={() => router.push('/search')}
            accessibilityRole="button"
            accessibilityLabel="Buscar"
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surfaceAlt,
              borderRadius: 20,
            }}
          >
            <Ionicons name="search-outline" size={20} color={colors.primaryStrong} />
          </Pressable>
          <Pressable
            onPress={() => setShowFilters((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="Filtros"
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: categoryFilter.length > 0 ? colors.primary : colors.surfaceAlt,
              borderRadius: 20,
            }}
          >
            <Ionicons name="options-outline" size={20} color={categoryFilter.length > 0 ? colors.onPrimary : colors.primaryStrong} />
          </Pressable>
        </View>
      </View>

      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.sm }}
        >
          {categories.map((c) => (
            <FilterChip key={c.id} label={c.name} selected={categoryFilter.includes(c.id)} onPress={() => toggleCategory(c.id)} color={c.color} />
          ))}
        </ScrollView>
      )}

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <SegmentedControl
          options={[
            { value: 'DAY', label: 'Día' },
            { value: 'WEEK', label: 'Semana' },
            { value: 'MONTH', label: 'Mes' },
            { value: 'YEAR', label: 'Año' },
          ]}
          value={viewMode}
          onChange={setViewMode}
        />
      </View>

      {viewMode === 'DAY' && <DayView dateKey={dateKey} onChangeDate={setDateKey} categoryFilter={categoryFilter} />}
      {viewMode === 'WEEK' && <WeekView dateKey={dateKey} onChangeDate={setDateKey} categoryFilter={categoryFilter} />}
      {viewMode === 'MONTH' && <MonthView dateKey={dateKey} onSelectDate={selectDateAndGoToDay} />}
      {viewMode === 'YEAR' && <YearView dateKey={dateKey} onSelectMonth={selectMonthAndGoToMonth} />}
    </SafeAreaView>
  );
}
