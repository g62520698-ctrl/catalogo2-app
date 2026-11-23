import type { AppSettings } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');

/** Date → 'YYYY-MM-DDTHH:mm' (horário local, formato do <input type="datetime-local">) */
export function toInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getDeadlineDate(settings: AppSettings): Date | null {
  const p = settings.prazoPedidos;
  if (!p || !p.ativo || !p.ate) return null;
  const d = new Date(p.ate);
  return isNaN(d.getTime()) ? null : d;
}

/** true quando o prazo está ativo, é "bloqueante" e já passou. (Admin é tratado fora daqui.) */
export function isOrderingClosed(settings: AppSettings, now: number = Date.now()): boolean {
  const p = settings.prazoPedidos;
  const d = getDeadlineDate(settings);
  return !!(p && p.bloquear && d && now > d.getTime());
}

/** 'qui 27/11 às 18:00' */
export function formatDeadline(d: Date): string {
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  return `${wd} ${pad(d.getDate())}/${pad(d.getMonth() + 1)} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** '2d 3h' · '5h 20min' · '12 min' */
export function formatRemaining(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${pad(mins)}min`;
  return `${Math.max(1, mins)} min`;
}

/** Soma 7 dias ao prazo (repetindo, se necessário) até ele ficar no futuro. */
export function advanceDeadline(ate: string, now: number = Date.now()): string {
  const d = new Date(ate);
  if (isNaN(d.getTime())) {
    const n = new Date(now); n.setDate(n.getDate() + 7); n.setHours(18, 0, 0, 0);
    return toInputValue(n);
  }
  do { d.setDate(d.getDate() + 7); } while (d.getTime() <= now);
  return toInputValue(d);
}
