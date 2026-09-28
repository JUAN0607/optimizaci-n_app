import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EMPTY_PLAN_FILTERS, PlanFilterModal, countActiveFilters, type PlanFilters } from '@/components/PlanFilterModal';
import { SegmentedControl } from '@/components/SegmentedControl';
import { DayView } from '@/features/planner/DayView';
import { MonthView } from '@/features/planner/MonthView';
import { WeekView } from '@/features/planner/WeekView';
import { YearView } from '@/features/planner/YearView';
import { useTheme } from '@/theme/ThemeProvider';
import { todayKey } from '@/utils/date';

type ViewMode = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export default function PlanScreen() {
  const { colors, spacing, type, shadow } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('DAY');
  const [dateKey, setDateKey] = useState(todayKey());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PlanFilters>(EMPTY_PLAN_FILTERS);
  const activeFilterCount = countActiveFilters(filters);

  const selectDateAndGoToDay = (key: string) => {
    setDateKey(key);
    setViewMode('DAY');
  };

  const selectMonthAndGoToMonth = (key: string) => {
    setDateKey(key);
    setViewMode('MONTH');
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
            style={[
              shadow.card,
              {
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primary,
                borderRadius: 20,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.onPrimary} />
          </Pressable>
          <Pressable
            onPress={() => setShowFilters(true)}
            accessibilityRole="button"
            accessibilityLabel="Filtros"
            style={[
              shadow.card,
              {
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primary,
                borderRadius: 20,
              },
            ]}
          >
            <Ionicons name="options" size={20} color={colors.onPrimary} />
            {activeFilterCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  paddingHorizontal: 3,
                  backgroundColor: colors.accentGold,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

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

      {viewMode === 'DAY' && <DayView dateKey={dateKey} onChangeDate={setDateKey} filters={filters} />}
      {viewMode === 'WEEK' && <WeekView dateKey={dateKey} onChangeDate={setDateKey} filters={filters} />}
      {viewMode === 'MONTH' && <MonthView dateKey={dateKey} onSelectDate={selectDateAndGoToDay} />}
      {viewMode === 'YEAR' && <YearView dateKey={dateKey} onSelectMonth={selectMonthAndGoToMonth} />}

      <PlanFilterModal
        visible={showFilters}
        filters={filters}
        onApply={setFilters}
        onClose={() => setShowFilters(false)}
        dateKey={dateKey}
        onChangeDate={setDateKey}
      />
    </SafeAreaView>
  );
}
