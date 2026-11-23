import type { Category } from '../types';

// Lista única de categorias — para adicionar uma nova no futuro, basta incluir aqui
// (e em `Category`, em types/index.ts) e definir seu visual em CATEGORY_META.
export const CATEGORIES: Category[] = ['Flor', 'Planta', 'Maços', 'Ofertas'];

export interface CategoryMeta {
  emoji: string;
  plural: string;      // título da seção no catálogo
  solid: string;       // cor do selo no card
  bg: string;          // fundo do cabeçalho da seção
  border: string;
  text: string;
  countBg: string;
  countText: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Flor:    { emoji: '🌸', plural: 'FLORES',  solid: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8', text: '#be185d', countBg: '#fbcfe8', countText: '#9d174d' },
  Planta:  { emoji: '🌿', plural: 'PLANTAS', solid: '#059669', bg: '#f0faf4', border: '#bbf7d0', text: '#15803d', countBg: '#bbf7d0', countText: '#166534' },
  Maços:   { emoji: '💐', plural: 'MAÇOS',   solid: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', countBg: '#ddd6fe', countText: '#5b21b6' },
  Ofertas: { emoji: '🏷️', plural: 'OFERTAS', solid: '#ea580c', bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', countBg: '#fed7aa', countText: '#9a3412' },
};

export function isCategory(v: unknown): v is Category {
  return typeof v === 'string' && (CATEGORIES as string[]).includes(v);
}

export function getCategoryEmoji(c: Category | string): string {
  return isCategory(c) ? CATEGORY_META[c].emoji : '🌿';
}

/** Converte texto livre (ex.: coluna "Categoria" do Excel) em uma categoria válida. */
export function normalizeCategory(raw: unknown): Category {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (s.startsWith('planta')) return 'Planta';
  if (s.startsWith('maco'))   return 'Maços';
  if (s.startsWith('oferta')) return 'Ofertas';
  return 'Flor';
}
