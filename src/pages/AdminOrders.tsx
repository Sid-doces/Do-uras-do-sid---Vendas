import React from 'react';
import { useCollection } from '../hooks/useFirestore';
import { Order, City } from '../types';
import { ShoppingBag, Phone, MapPin, Calendar, Clock, MessageSquare, CheckCircle, Truck, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminOrders() {
  const { data: orders, update, loading } = useCollection<Order>('orders');
  const { data: cities } = useCollection<City>('cities');

  const getCityName = (id: string) => {
    if (id === 'local') return 'Entrega Local (Suzano)';
    return cities.find(c => c.id === id)?.name || 'Desconhecida';
  };

  const sendToWhatsApp = (order: Order) => {
    const itemsText = order.items.map(i => `• ${i.quantity}x ${i.name}`).join('\n');
    const deliveryInfo = order.deliveryType === 'local' 
      ? `Local (Suzano - ${order.distanceKm?.toFixed(1)}km)`
      : `Rota (${getCityName(order.cityId)})`;
    
    const text = `Olá ${order.customerName}! Referente ao seu pedido:\n\n${itemsText}\n\nTotal: R$ ${order.total.toFixed(2)}\nEntrega: ${deliveryInfo}\nData: ${order.deliveryDate} às ${order.deliveryTime}\nEndereço: ${order.address}\n\nStatus Atual: *${order.status.toUpperCase()}*`;
    const url = `https://wa.me/55${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const statusIcons = {
    pendente: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    confirmado: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
    entregue: { icon: Truck, color: 'text-green-500', bg: 'bg-green-50' },
    cancelado: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500">Gerencie e acompanhe todas as vendas.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        }).map((order) => {
          const StatusIcon = statusIcons[order.status].icon;
          return (
            <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-grow space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <ShoppingBag size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{order.customerName}</h3>
                        <p className="text-sm font-medium text-brand-orange flex items-center gap-1">
                          <Phone size={14} /> {order.customerPhone}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${statusIcons[order.status].bg} ${statusIcons[order.status].color} border-current/10`}>
                      <StatusIcon size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">{order.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Entrega</p>
                        <p className="text-sm text-gray-700">{order.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            order.deliveryType === 'local' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {order.deliveryType === 'local' ? 'Local' : 'Rota'}
                          </span>
                          <span className="text-xs text-brand-brown/60 font-bold">{getCityName(order.cityId)}</span>
                          {order.distanceKm && (
                            <span className="text-[10px] text-gray-400 font-medium">({order.distanceKm.toFixed(1)}km)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Data de Entrega</p>
                        <p className="text-sm text-gray-700">{order.deliveryDate}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Horário</p>
                        <p className="text-sm text-gray-700">{order.deliveryTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase px-1">Itens do Pedido</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 px-3 py-2 rounded-xl text-sm shadow-sm">
                          <span className="font-bold text-brand-orange">{item.quantity}x</span> {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:w-64 flex flex-col justify-between p-4 bg-brand-brown/5 rounded-2xl border border-brand-brown/10">
                  <div className="text-center mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase">Total do Pedido</p>
                    <p className="text-3xl font-display font-bold text-brand-brown">R$ {order.total.toFixed(2)}</p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => sendToWhatsApp(order)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                    >
                      <MessageSquare size={18} />
                      WhatsApp
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="col-span-2 py-2 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                        value={order.status}
                        onChange={(e) => update(order.id, { status: e.target.value as any })}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">Nenhum pedido realizado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
