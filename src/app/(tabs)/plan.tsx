import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SegmentedControl } from '@/components/SegmentedControl';
import { DayView } from '@/features/planner/DayView';
import { MonthView } from '@/features/planner/MonthView';
import { WeekView } from '@/features/planner/WeekView';
import { YearView } from '@/features/planner/YearView';
import { useTheme } from '@/theme/ThemeProvider';
import { todayKey } from '@/utils/date';

type ViewMode = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export default function PlanScreen() {
  const { colors, spacing } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('DAY');
  const [dateKey, setDateKey] = useState(todayKey());

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

      {viewMode === 'DAY' && <DayView dateKey={dateKey} onChangeDate={setDateKey} />}
      {viewMode === 'WEEK' && <WeekView dateKey={dateKey} onChangeDate={setDateKey} />}
      {viewMode === 'MONTH' && <MonthView dateKey={dateKey} onSelectDate={selectDateAndGoToDay} />}
      {viewMode === 'YEAR' && <YearView dateKey={dateKey} onSelectMonth={selectMonthAndGoToMonth} />}
    </SafeAreaView>
  );
}
