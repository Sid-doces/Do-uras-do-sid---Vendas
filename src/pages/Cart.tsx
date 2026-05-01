import React, { useState, useEffect } from 'react';
import { useCart } from '../components/CartProvider';
import { useCollection, useDocument } from '../hooks/useFirestore';
import { doc, getDocFromServer, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { City, Settings, Order, DeliveryRange } from '../types';
import { ShoppingBag, Trash2, Plus, Minus, MapPin, Calendar, Clock, ArrowRight, MessageSquare, CheckCircle, Navigation, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isSameDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatWhatsAppUrl } from '../lib/utils';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function Cart() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { data: cities } = useCollection<City>('cities');
  const { add: addOrder } = useCollection<Order>('orders');
  const { data: settings } = useDocument<Settings>('settings', 'general');
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'city' | 'local'>('city');
  const [distance, setDistance] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    cityId: '',
    deliveryDate: '',
    deliveryTime: '',
  });

  const selectedCity = cities.find(c => c.id === formData.cityId);
  const shopCoords = settings?.shopCoordinates || { lat: -23.5702, lng: -46.2941 };

  const getDistancePrice = (km: number) => {
    if (!settings?.deliveryRanges) return 0;
    const range = settings.deliveryRanges.find(r => km >= r.minKm && (r.maxKm === 0 ? true : km <= r.maxKm));
    return range?.price || 0;
  };

  const deliveryFee = deliveryType === 'local' && distance !== null ? getDistancePrice(distance) : 0;
  const finalTotal = total + deliveryFee;

  // Generate next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i + 1));
  
  const filteredDates = availableDates.filter(date => {
    // Local delivery always available (Sundays off by default or based on shop)
    if (deliveryType === 'local') return getDay(date) !== 0; // No sunday
    
    if (!selectedCity) return false;
    const dayOfWeek = getDay(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const isRecurring = selectedCity.deliveryDays.includes(dayOfWeek);
    const isSpecific = selectedCity.specificDates?.includes(dateStr);
    return isRecurring || isSpecific;
  });

  const handleGetLocation = () => {
    setCalculating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const d = calculateDistance(
          shopCoords.lat, 
          shopCoords.lng, 
          position.coords.latitude, 
          position.coords.longitude
        );
        setDistance(d);
        setCalculating(false);
        if (d > 10.5) {
          alert('Ops! Você está fora do nosso raio de 10km para entrega local. Entre em contato para verificar entrega em sua cidade.');
          setDeliveryType('city');
          setDistance(null);
        }
      },
      (error) => {
        setCalculating(false);
        console.error(error);
        alert('Não conseguimos obter sua localização. Por favor, permita o acesso ou selecione uma cidade da lista.');
      }
    );
  };

  const handleCheckout = async () => {
    if (!formData.name || !formData.phone || !formData.address || (deliveryType === 'city' && !formData.cityId) || !formData.deliveryDate || !formData.deliveryTime) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (deliveryType === 'local' && (distance === null || distance > 10.5)) {
      alert('Por favor, calcule sua distância para prosseguir com a entrega local (máx 10km).');
      return;
    }

    setIsSubmitting(true);

    const orderData: Omit<Order, 'id'> = {
      customerName: formData.name,
      customerPhone: formData.phone,
      address: formData.address,
      cityId: deliveryType === 'city' ? formData.cityId : 'local',
      deliveryType,
      deliveryFee,
      distanceKm: distance || 0,
      items: items,
      total: finalTotal,
      deliveryDate: formData.deliveryDate,
      deliveryTime: formData.deliveryTime,
      status: 'pendente',
      createdAt: null // Will be set by the hook
    };

    try {
      console.log("Adding order:", orderData);
      await addOrder(orderData);
      console.log("Order added successfully");
      
      // Try to update stock, but don't block the order if it fails
      try {
        for (const item of items) {
          const productRef = doc(db, 'products', item.productId);
          const productSnap = await getDocFromServer(productRef);
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock || 0;
            // Only update if it won't crash (should be allowed by rules)
            await updateDoc(productRef, { stock: Math.max(0, currentStock - item.quantity) });
          }
        }
      } catch (stockError) {
        console.warn("Stock update failed (expected if rules are strict)", stockError);
      }
      
      const itemsText = items.map(i => `• ${i.quantity}x ${i.name}`).join('\n');
      const deliveryInfo = deliveryType === 'local' 
        ? `*Entrega Local (Suzano)*\nDistância: ${distance?.toFixed(1)}km\nTaxa: R$ ${deliveryFee.toFixed(2)}`
        : `*Entrega via Rota*\nCidade: ${selectedCity?.name}`;

      const text = `🍰 *NOVO PEDIDO - Doçuras do Sid*\n\n*Cliente:* ${formData.name}\n*Fone:* ${formData.phone}\n\n*Itens:*\n${itemsText}\n\n*Total:* R$ ${finalTotal.toFixed(2)}\n\n*Entrega:*\n${deliveryInfo}\n*Endereço:* ${formData.address}\n*Data:* ${formData.deliveryDate}\n*Horário:* ${formData.deliveryTime}\n\n_Por favor, confirme meu pedido!_`;
      
      const whatsappContact = settings?.whatsappNumber || settings?.whatsappUrl || '5511999999999';
      const url = formatWhatsAppUrl(whatsappContact, text);
      
      // Redirect to Step 3 first to ensure the user sees success
      setStep(3);
      clearCart();
      
      // Small timeout before opening WhatsApp to ensure state update
      setTimeout(() => {
        const win = window.open(url, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          console.warn("Popup blocked or failed to open");
        }
      }, 800);
      
    } catch (error: any) {
      console.error("Order failed details:", error);
      alert(`Houve um erro ao processar seu pedido: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-bold">Seu carrinho está vazio</h2>
        <p className="text-gray-500">Que tal explorar nossas delícias e escolher sua favorita?</p>
        <button onClick={() => navigate('/loja')} className="btn-primary inline-flex items-center gap-2">
          Ir para a Loja <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2 relative flex-grow">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${
                step >= s ? 'text-brand-orange' : 'text-gray-400'
              }`}>
                {s === 1 ? 'Carrinho' : s === 2 ? 'Entrega' : 'Sucesso'}
              </span>
              {s < 3 && (
                <div className={`absolute left-[60%] right-[-40%] top-5 h-[2px] -z-10 ${
                  step > s ? 'bg-brand-orange' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xl font-bold">Resumo do Pedido</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.productId} className="p-6 flex items-center justify-between gap-4">
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-brand-orange font-bold">R$ {item.price.toFixed(2)} / un</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 hover:bg-white rounded-lg transition-colors">
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 hover:bg-white rounded-lg transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-brand-brown text-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <p className="text-sm opacity-60 font-bold uppercase tracking-widest">Valor Total</p>
                  <p className="text-4xl font-display font-bold">R$ {total.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="bg-brand-orange w-full md:w-auto px-10 py-5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  Continuar <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl p-8 border border-orange-100 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Dados de Entrega</h2>
                <p className="text-gray-500">Onde e quando devemos entregar sua doçura?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Seu Nome</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-orange"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Seu WhatsApp (com DDD)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 5511999999999"
                    className="w-full px-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-orange"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Endereço Completo</label>
                  <textarea
                    required
                    placeholder="Rua, Número, Complemento, Bairro"
                    className="w-full px-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-orange"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-4">Como deseja receber?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('city')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        deliveryType === 'city' 
                          ? 'border-brand-orange bg-orange-50' 
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <MapPin size={24} className={deliveryType === 'city' ? 'text-brand-orange' : 'text-gray-400'} />
                      <div className="mt-2">
                        <p className="font-bold">Rota por Cidade</p>
                        <p className="text-xs text-gray-500">Cidades selecionadas com datas específicas.</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('local')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        deliveryType === 'local' 
                          ? 'border-brand-orange bg-orange-50' 
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <Navigation size={24} className={deliveryType === 'local' ? 'text-brand-orange' : 'text-gray-400'} />
                      <div className="mt-2">
                        <p className="font-bold">Entrega Local (Suzano)</p>
                        <p className="text-xs text-gray-500">Raio de até 10km da nossa confeitaria.</p>
                      </div>
                    </button>
                  </div>
                </div>

                {deliveryType === 'city' ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cidade</label>
                    <select
                      required
                      className="w-full px-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-orange"
                      value={formData.cityId}
                      onChange={(e) => setFormData({ ...formData, cityId: e.target.value, deliveryDate: '', deliveryTime: '' })}
                    >
                      <option value="">Selecione a cidade</option>
                      {cities.filter(c => c.isActive).map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Calculadora de Entrega Local</label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={calculating}
                      className="w-full py-4 bg-white border-2 border-brand-orange text-brand-orange rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-all disabled:opacity-50"
                    >
                      {calculating ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
                      {distance !== null ? 'Recalcular Minha Localização' : 'Calcular Minha Localização'}
                    </button>
                    {distance !== null && (
                      <div className="p-4 bg-green-50 rounded-2xl border border-green-100 animate-in fade-in zoom-in">
                        <p className="text-sm font-bold text-green-700 flex items-center gap-2">
                          <CheckCircle size={16} /> Você está a {distance.toFixed(1)}km da Sid!
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Taxa de entrega: <span className="font-bold">R$ {deliveryFee.toFixed(2)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Data Disponível</label>
                  <select
                    disabled={deliveryType === 'city' && !formData.cityId}
                    required
                    className="w-full px-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-orange disabled:opacity-50"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  >
                    <option value="">Selecione a data</option>
                    {filteredDates.map(date => (
                      <option key={date.toISOString()} value={format(date, 'yyyy-MM-dd')}>
                        {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Horário</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(deliveryType === 'local' ? ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'] : selectedCity?.availableHours || []).map(time => (
                      <button
                        key={time}
                        onClick={() => setFormData({ ...formData, deliveryTime: time })}
                        className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                          formData.deliveryTime === time 
                            ? 'bg-brand-orange text-white border-brand-orange shadow-md' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-brand-orange'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-brand-brown/5 rounded-3xl space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm text-brand-orange font-bold">
                    <span>Taxa de Entrega {deliveryType === 'local' ? `(${distance?.toFixed(1)}km)` : ''}</span>
                    <span>+ R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-brand-brown pt-3 border-t border-brand-brown/10">
                  <span>Total</span>
                  <span>R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-grow py-5 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="flex-[2] py-5 bg-green-500 text-white rounded-2xl font-bold shadow-xl shadow-green-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <MessageSquare size={20} />
                  )}
                  {isSubmitting ? 'Processando...' : 'Finalizar no WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-10 translate-y-0 animate-in fade-in zoom-in duration-500">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500 mb-8 border-4 border-green-50">
              <CheckCircle size={64} />
            </div>
            <h2 className="text-4xl font-bold mb-4 font-display">Pedido Registrado!</h2>
            <p className="text-gray-500 max-w-md mx-auto text-lg mb-8">
              Parabéns! Seu pedido foi salvo. Agora falta só um passo: enviar para nosso WhatsApp para confirmação.
            </p>
            
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-green-100 mb-12 max-w-md mx-auto space-y-6">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-tight">Instruções</p>
              <p className="text-gray-600">Se o WhatsApp não abriu automaticamente, clique no botão abaixo para nos enviar os detalhes do seu pedido.</p>
              
              <button 
                onClick={() => {
                  const itemsText = items.map(i => `• ${i.quantity}x ${i.name}`).join('\n');
                  const deliveryInfo = deliveryType === 'local' 
                    ? `*Entrega Local (Suzano)*\nDistância: ${distance?.toFixed(1)}km\nTaxa: R$ ${deliveryFee.toFixed(2)}`
                    : `*Entrega via Rota*\nCidade: ${selectedCity?.name}`;
                  const text = `🍰 *NOVO PEDIDO - Doçuras do Sid*\n\n*Cliente:* ${formData.name}\n*Fone:* ${formData.phone}\n\n*Itens:*\n${itemsText}\n\n*Total:* R$ ${finalTotal.toFixed(2)}\n\n*Entrega:*\n${deliveryInfo}\n*Endereço:* ${formData.address}\n*Data:* ${formData.deliveryDate}\n*Horário:* ${formData.deliveryTime}\n\n_Por favor, confirme meu pedido!_`;
                  const whatsappContact = settings?.whatsappNumber || settings?.whatsappUrl || '5511999999999';
                  window.open(formatWhatsAppUrl(whatsappContact, text), '_blank');
                }}
                className="w-full py-5 bg-green-500 text-white rounded-2xl font-bold shadow-xl shadow-green-100 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
              >
                <MessageSquare size={24} />
                Enviar para WhatsApp
                <ExternalLink size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <button onClick={() => navigate('/')} className="text-brand-orange font-bold hover:underline">
                Voltar para o Início
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
