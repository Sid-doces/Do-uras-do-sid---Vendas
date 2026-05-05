import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useCollection } from '../hooks/useFirestore';
import { Order, City } from '../types';
import { ShoppingBag, Phone, MapPin, Calendar, Clock, MessageSquare, CheckCircle, Truck, XCircle, Filter, Search, ChevronRight, Bell, BellOff, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';

export default function AdminOrders() {
  const { data: orders, update, remove, loading } = useCollection<Order>('orders');
  const { data: cities } = useCollection<City>('cities');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);

  const previousOrderIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (loading) return;

    const currentIds = new Set(orders.map(o => o.id));

    // On first load, just record the existing IDs
    if (!initialLoadDone.current) {
      previousOrderIds.current = currentIds;
      initialLoadDone.current = true;
      return;
    }

    // Check for new IDs
    const newAddedIds = [...currentIds].filter(id => !previousOrderIds.current.has(id));

    if (newAddedIds.length > 0) {
      const newOrder = orders.find(o => o.id === newAddedIds[0]);
      if (newOrder) {
        toast.success(`Novo pedido recebido!`, {
          description: `${newOrder.customerName} - R$ ${newOrder.total.toFixed(2)}`,
          action: {
            label: 'Ver Pedido',
            onClick: () => {
              const element = document.getElementById(`order-${newOrder.id}`);
              element?.scrollIntoView({ behavior: 'smooth' });
            }
          },
          duration: 10000,
        });

        if (soundEnabled) {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {
            // Browsers often block auto-play until user interaction
            console.log('Audio notification blocked by browser');
          });
        }
      }
    }

    previousOrderIds.current = currentIds;
  }, [orders, loading, soundEnabled]);

  const getCityName = (id: string) => {
    if (id === 'local') return 'Suzano (Local)';
    return cities.find(c => c.id === id)?.name || 'Desconhecida';
  };

  const dates = useMemo(() => {
    const uniqueDates = [...new Set(orders.map(o => o.deliveryDate))];
    return uniqueDates.sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const matchesCity = selectedCity === 'all' || order.cityId === selectedCity;
        const matchesDate = selectedDate === 'all' || order.deliveryDate === selectedDate;
        const matchesSearch = 
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerPhone.includes(searchTerm);
        return matchesCity && matchesDate && matchesSearch;
      })
      .sort((a, b) => {
        // Sort by date first, then time
        if (a.deliveryDate !== b.deliveryDate) {
          return a.deliveryDate.localeCompare(b.deliveryDate);
        }
        return a.deliveryTime.localeCompare(b.deliveryTime);
      });
  }, [orders, selectedCity, selectedDate, searchTerm]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const revenue = filteredOrders.filter(o => o.status !== 'cancelado').reduce((acc, o) => acc + o.total, 0);
    return { total, revenue };
  }, [filteredOrders]);

  const sendToWhatsApp = (order: Order) => {
    const itemsText = order.items.map(i => `• ${i.quantity}x ${i.name}`).join('\n');
    const deliveryInfo = order.deliveryType === 'local' 
      ? `Local (Suzano - ${order.distanceKm?.toFixed(1)}km)`
      : `Rota (${getCityName(order.cityId)})`;
    
    let text = `Olá ${order.customerName}! Referente ao seu pedido:\n\n${itemsText}\n\nTotal: R$ ${order.total.toFixed(2)}\nEntrega: ${deliveryInfo}\nData: ${order.deliveryDate} às ${order.deliveryTime}\nEndereço: ${order.address}\n\nStatus Atual: *${order.status.toUpperCase()}*`;
    
    if (order.status === 'entregue') {
      text += `\n\nFicamos muito felizes em te atender! Se puder postar um story e nos marcar (@docurasdosid), isso nos ajuda imensamente a voltar mais vezes para sua cidade! ❤️`;
    }

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500">Gerencie e organize suas rotas de entrega.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-100 shadow-sm transition-all ${
              soundEnabled ? 'bg-green-50 text-green-600 border-green-100' : 'bg-white text-gray-400'
            }`}
            title={soundEnabled ? "Notificações sonoras ativadas" : "Ativar notificações sonoras"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span className="text-xs font-bold uppercase hidden sm:inline">
              Som {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Filtrados</p>
            <p className="text-xl font-display font-bold text-brand-brown">{stats.total} pedidos</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Faturamento</p>
            <p className="text-xl font-display font-bold text-brand-orange">R$ {stats.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl min-w-[200px]">
              <MapPin size={18} className="text-gray-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full"
              >
                <option value="all">Todas as Cidades</option>
                <option value="local">Suzano (Local)</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl min-w-[200px]">
              <Calendar size={18} className="text-gray-400" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full"
              >
                <option value="all">Todas as Datas</option>
                {dates.map(date => (
                  <option key={date} value={date}>
                    {format(new Date(date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const StatusIcon = statusIcons[order.status].icon;
          return (
            <div 
              key={order.id} 
              id={`order-${order.id}`}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-md"
            >
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
                        className={`${order.status === 'cancelado' ? 'col-span-1' : 'col-span-2'} py-2 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold`}
                        value={order.status}
                        onChange={(e) => update(order.id, { status: e.target.value as any })}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                      {order.status === 'cancelado' && (
                        <button
                          onClick={async () => {
                            if (window.confirm('Tem certeza que deseja excluir permanentemente este pedido cancelado?')) {
                              try {
                                await remove(order.id);
                                toast.success('Pedido excluído com sucesso');
                              } catch (error) {
                                toast.error('Erro ao excluir pedido');
                                console.error(error);
                              }
                            }
                          }}
                          className="flex items-center justify-center p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                          title="Excluir pedido"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">Nenhum pedido encontrado para os filtros selecionados.</p>
            <button 
              onClick={() => { setSelectedCity('all'); setSelectedDate('all'); setSearchTerm(''); }}
              className="mt-4 text-brand-orange font-bold text-sm"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
