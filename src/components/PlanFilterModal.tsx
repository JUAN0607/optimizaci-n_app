import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { ACTIVITY_TYPE_LABELS, PRIORITY_LABELS } from '@/constants/labels';
import { useCategories } from '@/hooks/useCategories';
import { useTheme } from '@/theme/ThemeProvider';
import type { ActivityType, Priority } from '@/types/entities';
import { parseDateKey, toDateKey } from '@/utils/date';

import { DateTimeField } from './DateTimeField';
import { FilterChip } from './FilterChip';

export type ActivityStateFilter = 'PENDING' | 'COMPLETED';

export interface PlanFilters {
  categoryIds: string[];
  types: ActivityType[];
  priorities: Priority[];
  states: ActivityStateFilter[];
}

export const EMPTY_PLAN_FILTERS: PlanFilters = { categoryIds: [], types: [], priorities: [], states: [] };

export function countActiveFilters(filters: PlanFilters): number {
  return filters.categoryIds.length + filters.types.length + filters.priorities.length + filters.states.length;
}

const STATE_LABELS: Record<ActivityStateFilter, string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
};

interface PlanFilterModalProps {
  visible: boolean;
  filters: PlanFilters;
  onApply: (filters: PlanFilters) => void;
  onClose: () => void;
  dateKey: string;
  onChangeDate: (dateKey: string) => void;
}

export function PlanFilterModal({ visible, filters, onApply, onClose, dateKey, onChangeDate }: PlanFilterModalProps) {
  const { colors, radius, spacing, type, shadow } = useTheme();
  const categories = useCategories();

  const toggle = <T,>(list: T[], value: T): T[] => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const update = (patch: Partial<PlanFilters>) => onApply({ ...filters, ...patch });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
        <View
          style={[
            shadow.floating,
            {
              backgroundColor: colors.background,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              maxHeight: '82%',
            },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: spacing.xl,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={[type.h3, { color: colors.textPrimary }]}>Filtros</Text>
            <Pressable onPress={onClose} accessibilityLabel="Cerrar" hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
            <View style={{ gap: spacing.xs }}>
              <Text style={[type.label, { color: colors.textSecondary }]}>FECHA</Text>
              <DateTimeField
                label="Ir a una fecha"
                mode="date"
                value={parseDateKey(dateKey)}
                onChange={(d) => onChangeDate(toDateKey(d))}
              />
            </View>

            <View style={{ gap: spacing.xs }}>
              <Text style={[type.label, { color: colors.textSecondary }]}>CATEGORÍA</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {categories.map((c) => (
                  <FilterChip
                    key={c.id}
                    label={c.name}
                    selected={filters.categoryIds.includes(c.id)}
                    onPress={() => update({ categoryIds: toggle(filters.categoryIds, c.id) })}
                    color={c.color}
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.xs }}>
              <Text style={[type.label, { color: colors.textSecondary }]}>TIPO</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {(Object.keys(ACTIVITY_TYPE_LABELS) as ActivityType[]).map((t) => (
                  <FilterChip
                    key={t}
                    label={ACTIVITY_TYPE_LABELS[t]}
                    selected={filters.types.includes(t)}
                    onPress={() => update({ types: toggle(filters.types, t) })}
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.xs }}>
              <Text style={[type.label, { color: colors.textSecondary }]}>PRIORIDAD</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                  <FilterChip
                    key={p}
                    label={PRIORITY_LABELS[p]}
                    selected={filters.priorities.includes(p)}
                    onPress={() => update({ priorities: toggle(filters.priorities, p) })}
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.xs }}>
              <Text style={[type.label, { color: colors.textSecondary }]}>ESTADO</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {(Object.keys(STATE_LABELS) as ActivityStateFilter[]).map((s) => (
                  <FilterChip
                    key={s}
                    label={STATE_LABELS[s]}
                    selected={filters.states.includes(s)}
                    onPress={() => update({ states: toggle(filters.states, s) })}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <View
            style={{
              flexDirection: 'row',
              gap: spacing.md,
              padding: spacing.xl,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Pressable
              onPress={() => onApply(EMPTY_PLAN_FILTERS)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 14,
                borderRadius: radius.pill,
                backgroundColor: colors.surfaceAlt,
              }}
            >
              <Text style={[type.bodyMedium, { color: colors.textPrimary }]}>Limpiar</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 14,
                borderRadius: radius.pill,
                backgroundColor: colors.primaryStrong,
              }}
            >
              <Text style={[type.bodyMedium, { color: colors.onPrimaryStrong }]}>Aplicar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
