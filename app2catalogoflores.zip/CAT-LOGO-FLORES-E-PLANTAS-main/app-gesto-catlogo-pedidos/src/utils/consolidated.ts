import type { Order } from '../types';

export type AlertKind = 'abaixo_minimo' | 'fora_multiplo';

export interface ConsolidatedAlert {
  codigo: string;
  nome: string;
  total: number;          // soma de todas as lojas (pedidos pendentes)
  minimo: number;         // quantidade_minima_camada
  vasosBandeja: number;
  lojas: number;          // quantas lojas pediram esse produto
  kinds: AlertKind[];
  faltam: number;         // quanto falta para o mínimo (0 se não aplicável)
  sugerido: number;       // quantidade sugerida (arredondada p/ cima em bandejas)
}

/**
 * Analisa o TOTAL consolidado por produto (todos os pedidos informados) e devolve
 * os produtos com problema:
 *  - abaixo_minimo : total < quantidade_minima_camada
 *  - fora_multiplo : total não é múltiplo de vasos_bandeja
 */
export function computeConsolidatedAlerts(orders: Order[]): ConsolidatedAlert[] {
  const map = new Map<string, { nome: string; total: number; minimo: number; vb: number; users: Set<string> }>();

  const sorted = [...orders].sort(
    (a, b) => (new Date(a?.dataISO).getTime() || 0) - (new Date(b?.dataISO).getTime() || 0),
  );

  sorted.forEach(o => {
    if (!o || !Array.isArray(o.itens)) return;
    o.itens.forEach(it => {
      if (!it?.codigo_produto) return;
      const cur = map.get(it.codigo_produto) ?? { nome: it.nome, total: 0, minimo: 0, vb: 1, users: new Set<string>() };
      cur.nome   = it.nome || cur.nome;
      cur.total += Number(it.quantidade) || 0;
      cur.minimo = Number(it.quantidade_minima_camada) || 0;   // snapshot mais recente
      cur.vb     = Math.max(1, Number(it.vasos_bandeja) || 1);
      cur.users.add(o.usuario);
      map.set(it.codigo_produto, cur);
    });
  });

  const out: ConsolidatedAlert[] = [];
  map.forEach((v, codigo) => {
    const kinds: AlertKind[] = [];
    if (v.minimo > 0 && v.total < v.minimo) kinds.push('abaixo_minimo');
    if (v.vb > 1 && v.total % v.vb !== 0)   kinds.push('fora_multiplo');
    if (kinds.length === 0) return;

    const alvo = kinds.includes('abaixo_minimo') ? Math.max(v.minimo, v.total) : v.total;
    out.push({
      codigo, nome: v.nome, total: v.total, minimo: v.minimo, vasosBandeja: v.vb,
      lojas: v.users.size, kinds,
      faltam: Math.max(0, v.minimo - v.total),
      sugerido: Math.ceil(alvo / v.vb) * v.vb,
    });
  });

  // abaixo do mínimo primeiro, depois por nome
  return out.sort((a, b) => {
    const pa = a.kinds.includes('abaixo_minimo') ? 0 : 1;
    const pb = b.kinds.includes('abaixo_minimo') ? 0 : 1;
    return pa - pb || a.nome.localeCompare(b.nome);
  });
}
