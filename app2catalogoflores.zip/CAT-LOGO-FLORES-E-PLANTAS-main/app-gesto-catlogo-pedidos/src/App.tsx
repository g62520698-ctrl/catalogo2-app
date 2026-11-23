import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useStore } from './store/useStore';
import { TabId, User, Order } from './types';

import LoginScreen       from './components/LoginScreen';
import CatalogScreen     from './components/CatalogScreen';
import CartScreen        from './components/CartScreen';
import OrdersScreen      from './components/OrdersScreen';
import ReportsScreen     from './components/ReportsScreen';
import UsersScreen       from './components/UsersScreen';
import SettingsScreen    from './components/SettingsScreen';
import BottomNav         from './components/BottomNav';
import TopHeader         from './components/TopHeader';
import OrderSuccessToast from './components/OrderSuccessToast';
import DeadlineBanner   from './components/DeadlineBanner';
import { isOrderingClosed } from './utils/deadline';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<TabId>('catalogo');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const darkMode = store.settings.darkMode;

  // Re-renderiza a cada 30s para o bloqueio por prazo valer mesmo com a tela parada
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Último pedido do usuário logado (mais recente, qualquer status)
  const myLastOrder = useMemo<Order | null>(() => {
    const login = store.currentUser?.login;
    if (!login) return null;
    const mine = store.orders.filter(
      o => o?.usuario === login && Array.isArray(o.itens) && o.itens.length > 0,
    );
    if (mine.length === 0) return null;
    const ts = (o: Order) => new Date(o.dataISO).getTime() || 0;
    return mine.reduce((a, b) => (ts(b) > ts(a) ? b : a));
  }, [store.orders, store.currentUser]);

  const handleLogin = useCallback((user: User, keepLoggedIn: boolean) => {
    store.setCurrentUser(user, keepLoggedIn);
    setActiveTab('catalogo');
  }, [store]);

  const handleLogout = useCallback(() => {
    store.setCurrentUser(null, false);
    setActiveTab('catalogo');
  }, [store]);

  const handleFinalizeOrder = useCallback(() => {
    if (!store.currentUser) return;
    // Prazo encerrado: lojas não finalizam (admin é isento)
    if (store.currentUser.role !== 'admin' && isOrderingClosed(store.settings)) return;
    const order = store.finalizeOrder(store.currentUser, store.cart);
    if (order) {
      setLastOrder(order);
      setActiveTab('pedidos');
    }
  }, [store]);

  const handleTabChange = useCallback((tab: TabId) => {
    const user = store.currentUser;
    if (!user) return;
    if (user.role === 'analista' && (tab === 'carrinho' || tab === 'usuarios')) return;
    if (user.role === 'loja' && tab === 'usuarios') return;
    setActiveTab(tab);
  }, [store.currentUser]);

  // ── Not logged in ─────────────────────────────────────────────
  if (!store.currentUser) {
    return (
      <div className="h-full overflow-y-auto">
        <LoginScreen
          users={store.users}
          onLogin={handleLogin}
          firebaseStatus={store.firebaseStatus}
        />
      </div>
    );
  }

  const currentUser = store.currentUser;
  const orderingClosed = currentUser.role !== 'admin' && isOrderingClosed(store.settings);

  const renderScreen = () => {
    const wrap = (node: React.ReactNode) => (
      <ErrorBoundary key={activeTab}>{node}</ErrorBoundary>
    );

    switch (activeTab) {
      case 'catalogo':
        return wrap(
          <CatalogScreen
            products={store.products}
            currentUser={currentUser}
            cart={store.cart}
            onAddToCart={store.addToCart}
            onAddProduct={store.addProduct}
            onUpdateProduct={store.updateProduct}
            onDeleteProduct={store.deleteProduct}
            darkMode={darkMode}
            orderingClosed={orderingClosed}
            lastOrder={myLastOrder}
            onRepeatLastOrder={() => myLastOrder ? store.repeatOrder(myLastOrder) : { added: 0, skipped: [] }}
          />
        );
      case 'carrinho':
        return wrap(
          <CartScreen
            cart={store.cart}
            currentUser={currentUser}
            onUpdateItem={store.updateCartItem}
            onRemoveItem={store.removeFromCart}
            onClearCart={store.clearCart}
            onFinalizeOrder={handleFinalizeOrder}
            orderingClosed={orderingClosed}
          />
        );
      case 'pedidos':
        return wrap(
          <OrdersScreen
            orders={store.orders}
            currentUser={currentUser}
            onCompleteOrder={store.completeOrder}
            onDeleteOrder={store.deleteOrder}
            settings={store.settings}
            onUpdateSettings={store.setSettings}
          />
        );
      case 'relatorios':
        return wrap(
          <ReportsScreen
            orders={store.orders}
            currentUser={currentUser}
            users={store.users.map(u => ({ login: u.login, nome: u.nome }))}
          />
        );
      case 'usuarios':
        return wrap(
          <UsersScreen
            users={store.users}
            currentUser={currentUser}
            onAddUser={store.addUser}
            onUpdateUser={store.updateUser}
            onDeleteUser={store.deleteUser}
            darkMode={darkMode}
          />
        );
      case 'configuracoes':
        return wrap(
          <SettingsScreen
            settings={store.settings}
            currentUser={currentUser}
            onUpdateSettings={store.setSettings}
            onLogout={handleLogout}
            darkMode={darkMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: '#f5faf7' }}>

      {/* ── Global Top Header ─────────────────────────────────── */}
      <TopHeader
        currentUser={currentUser}
        activeTab={activeTab}
        cartCount={store.cartItemCount}
        darkMode={darkMode}
        onCartClick={() => handleTabChange('carrinho')}
        firebaseStatus={store.firebaseStatus}
      />

      {/* ── Prazo de pedidos ──────────────────────────────────── */}
      <DeadlineBanner settings={store.settings} isAdmin={currentUser.role === 'admin'} />

      {/* ── Success toast ─────────────────────────────────────── */}
      {lastOrder && (
        <OrderSuccessToast order={lastOrder} onClose={() => setLastOrder(null)} />
      )}

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {renderScreen()}
      </div>

      {/* ── Bottom navigation ─────────────────────────────────── */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        cartCount={store.cartItemCount}
        userRole={currentUser.role}
      />
    </div>
  );
}
