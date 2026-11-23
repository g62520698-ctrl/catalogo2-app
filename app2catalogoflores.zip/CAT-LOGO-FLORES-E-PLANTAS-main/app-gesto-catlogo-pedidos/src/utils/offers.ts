import type { Product } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');

/** Data local de hoje no formato YYYY-MM-DD */
export function todayISO(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Uma oferta é válida até o FIM do dia informado em `validade_oferta`. */
export function isOfferExpired(p: Pick<Product, 'categoria' | 'validade_oferta'>, now: Date = new Date()): boolean {
  if (p.categoria !== 'Ofertas' || !p.validade_oferta) return false;
  return todayISO(now) > p.validade_oferta;
}

/** true se hoje é o último dia da oferta */
export function isOfferLastDay(p: Pick<Product, 'categoria' | 'validade_oferta'>, now: Date = new Date()): boolean {
  return p.categoria === 'Ofertas' && !!p.validade_oferta && todayISO(now) === p.validade_oferta;
}

/** '2026-11-30' → '30/11' (inclui o ano se não for o ano atual) */
export function formatOfferDate(iso: string, now: Date = new Date()): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const base = `${m[3]}/${m[2]}`;
  return Number(m[1]) === now.getFullYear() ? base : `${base}/${m[1]}`;
}

/**
 * Converte valores vindos do Excel em YYYY-MM-DD.
 * Aceita: número serial do Excel, "DD/MM/AAAA" ou "AAAA-MM-DD". Retorna '' se não entender.
 */
export function parseLooseDate(v: unknown): string {
  if (typeof v === 'number' && isFinite(v) && v > 20000) {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const s = String(v ?? '').trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (m) return `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;
  return '';
}
