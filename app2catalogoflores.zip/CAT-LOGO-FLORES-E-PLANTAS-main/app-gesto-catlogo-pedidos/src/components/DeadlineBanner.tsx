import { useEffect, useState } from 'react';
import { Clock, Lock } from 'lucide-react';
import { AppSettings } from '../types';
import { getDeadlineDate, formatDeadline, formatRemaining } from '../utils/deadline';

interface Props {
  settings: AppSettings;
  isAdmin: boolean;
}

/** Faixa fina abaixo do cabeçalho mostrando o prazo de pedidos. Só aparece se o prazo estiver ativo. */
export default function DeadlineBanner({ settings, isAdmin }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const deadline = getDeadlineDate(settings);
  if (!deadline) return null;

  const blocking = !!settings.prazoPedidos?.bloquear;
  const left     = deadline.getTime() - now;
  const closed   = left <= 0;
  const urgent   = !closed && left < 24 * 3600 * 1000;

  let bg = '#dcfce7', border = '#86efac', color = '#166534';
  let icon = <Clock size={14} style={{ flexShrink: 0 }} />;
  let text: string;

  if (closed && blocking) {
    bg = '#fee2e2'; border = '#fca5a5'; color = '#991b1b';
    icon = <Lock size={14} style={{ flexShrink: 0 }} />;
    text = isAdmin
      ? `Prazo encerrado (${formatDeadline(deadline)}) — lojas bloqueadas; você ainda pode pedir`
      : `Prazo de pedidos encerrado (${formatDeadline(deadline)})`;
  } else if (closed) {
    bg = '#fef3c7'; border = '#fcd34d'; color = '#92400e';
    text = `Prazo passou (${formatDeadline(deadline)}) — pedidos ainda sendo aceitos`;
  } else if (urgent) {
    bg = '#fef3c7'; border = '#fcd34d'; color = '#92400e';
    text = `Pedidos até ${formatDeadline(deadline)} · faltam ${formatRemaining(left)}`;
  } else {
    text = `Pedidos até ${formatDeadline(deadline)} · faltam ${formatRemaining(left)}`;
  }

  return (
    <div
      role="status"
      style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', fontSize: 12, fontWeight: 700, lineHeight: 1.3,
        background: bg, color, borderBottom: `1px solid ${border}`,
      }}
    >
      {icon}
      <span style={{ minWidth: 0 }}>{text}</span>
    </div>
  );
}
