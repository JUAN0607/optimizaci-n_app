import { getDb, newId, nowIso } from '@/db/client';
import type { Category } from '@/types/entities';

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_active: number;
  created_at: string;
}

function fromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

export function listCategories(includeInactive = false): Category[] {
  const db = getDb();
  const rows = includeInactive
    ? db.getAllSync<CategoryRow>('SELECT * FROM category ORDER BY created_at ASC')
    : db.getAllSync<CategoryRow>('SELECT * FROM category WHERE is_active = 1 ORDER BY created_at ASC');
  return rows.map(fromRow);
}

export function getCategory(id: string): Category | null {
  const db = getDb();
  const row = db.getFirstSync<CategoryRow>('SELECT * FROM category WHERE id = ?', [id]);
  return row ? fromRow(row) : null;
}

export function createCategory(input: { name: string; icon: string; color: string }): Category {
  const db = getDb();
  const category: Category = {
    id: newId(),
    name: input.name,
    icon: input.icon,
    color: input.color,
    isActive: true,
    createdAt: nowIso(),
  };
  db.runSync(
    'INSERT INTO category (id, name, icon, color, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [category.id, category.name, category.icon, category.color, 1, category.createdAt],
  );
  return category;
}

export function updateCategory(id: string, input: Partial<Pick<Category, 'name' | 'icon' | 'color' | 'isActive'>>): void {
  const db = getDb();
  const existing = getCategory(id);
  if (!existing) return;
  const merged = { ...existing, ...input };
  db.runSync('UPDATE category SET name = ?, icon = ?, color = ?, is_active = ? WHERE id = ?', [
    merged.name,
    merged.icon,
    merged.color,
    merged.isActive ? 1 : 0,
    id,
  ]);
}

export function deleteCategory(id: string): void {
  getDb().runSync('DELETE FROM category WHERE id = ?', [id]);
}
