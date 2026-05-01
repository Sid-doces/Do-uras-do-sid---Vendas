import React from 'react';
import { ShoppingBag, DollarSign, Clock, Package } from 'lucide-react';
import { useCollection, useDocument } from '../hooks/useFirestore';
import { Order, Product, Settings } from '../types';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data: orders } = useCollection<Order>('orders');
  const { data: products } = useCollection<Product>('products');
  const { data: settings } = useDocument<Settings>('settings', 'general');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const orderDate = o.createdAt.toDate ? format(o.createdAt.toDate(), 'yyyy-MM-dd') : null;
    return orderDate === today;
  });

  const dailyRevenue = todayOrders.reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pendente').length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  
  const dailyProductionUsed = todayOrders.length;
  const remainingProduction = (settings?.dailyProductionLimit || 0) - dailyProductionUsed;

  const stats = [
    { name: 'Pedidos Hoje', value: todayOrders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Faturamento Hoje', value: `R$ ${dailyRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Pendentes', value: pendingOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Total em Estoque', value: totalStock, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Bem-vindo ao centro de comando da Doçuras do Sid.</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${remainingProduction <= 5 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${remainingProduction <= 5 ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className="font-medium">Vagas de hoje: {Math.max(0, remainingProduction)} restantes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Últimos Pedidos</h3>
          <div className="space-y-4">
            {orders
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
              .slice(0, 5)
              .map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.items.length} itens • R$ {order.total.toFixed(2)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  order.status === 'pendente' ? 'bg-orange-100 text-orange-600' :
                  order.status === 'confirmado' ? 'bg-blue-100 text-blue-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {order.status}
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center text-gray-400 py-8">Nenhum pedido ainda.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Top Produtos</h3>
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                    <Package size={20} />
                  </div>
                )}
                <div className="flex-grow">
                  <p className="font-bold text-gray-900">{product.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-brand-orange h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{product.stock}</p>
                  <p className="text-[10px] text-gray-500">em estoque</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
