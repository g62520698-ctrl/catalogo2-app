export type Category = 'Flor' | 'Planta' | 'Maços' | 'Ofertas';
export type UserRole = 'admin' | 'loja' | 'analista';
export type OrderStatus = 'pendente' | 'concluido';

export interface Product {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: Category;
  imagem: string;
  quantidade_minima_camada: number;
  vasos_bandeja: number;
  /** Somente categoria 'Ofertas': última data válida (YYYY-MM-DD). Vazio = sem prazo. */
  validade_oferta?: string;
}

export interface User {
  id: string;
  nome: string;
  login: string;
  senha: string;
  email: string;
  role: UserRole;
}

export interface CartItem {
  produto: Product;
  quantidade: number;
}

export interface OrderItem {
  codigo_produto: string;
  nome: string;
  descricao: string;
  quantidade: number;
  quantidade_minima_camada: number;
  vasos_bandeja: number;
  bandejas: number;
  imagem: string;
}

export interface Order {
  id: string;
  numero: number;
  usuario: string;
  usuarioNome: string;
  usuarioRole: UserRole;
  data: string;
  hora: string;
  dataISO: string;
  itens: OrderItem[];
  status: OrderStatus;
}

export type TabId = 'catalogo' | 'carrinho' | 'pedidos' | 'relatorios' | 'usuarios' | 'configuracoes';

/** Prazo de pedidos (definido pelo admin e sincronizado com todas as lojas). */
export interface PrazoPedidos {
  ativo: boolean;
  /** Data/hora final no formato local 'YYYY-MM-DDTHH:mm' */
  ate: string;
  /** Se true, lojas não conseguem finalizar pedidos após o prazo */
  bloquear: boolean;
}

export interface AppSettings {
  emailLogistica: string;
  nomeEmpresa: string;
  darkMode: boolean;
  prazoPedidos?: PrazoPedidos;
}
