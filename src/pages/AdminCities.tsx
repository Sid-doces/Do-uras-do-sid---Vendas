import React, { useState } from 'react';
import { useCollection } from '../hooks/useFirestore';
import { City } from '../types';
import { Plus, Edit2, Trash2, MapPin, Calendar, Clock, Users, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminCities() {
  const { data: cities, add, update, remove, loading } = useCollection<City>('cities');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newHour, setNewHour] = useState('');

  const [formData, setFormData] = useState<Partial<City>>({
    name: '',
    deliveryDays: [],
    specificDates: [],
    availableHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
    maxDailyOrders: 10,
    isActive: true,
  });

  const days = [
    { label: 'Dom', value: 0 },
    { label: 'Seg', value: 1 },
    { label: 'Ter', value: 2 },
    { label: 'Qua', value: 3 },
    { label: 'Qui', value: 4 },
    { label: 'Sex', value: 5 },
    { label: 'Sáb', value: 6 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCity) {
      await update(editingCity.id, formData);
    } else {
      await add(formData as any);
    }
    closeModal();
  };

  const toggleDay = (day: number) => {
    setFormData(prev => {
      const current = prev.deliveryDays || [];
      if (current.includes(day)) {
        return { ...prev, deliveryDays: current.filter(d => d !== day) };
      }
      return { ...prev, deliveryDays: [...current, day] };
    });
  };

  const addSpecificDate = () => {
    if (!newDate) return;
    if (formData.specificDates?.includes(newDate)) return;
    setFormData(prev => ({
      ...prev,
      specificDates: [...(prev.specificDates || []), newDate].sort()
    }));
    setNewDate('');
  };

  const removeSpecificDate = (date: string) => {
    setFormData(prev => ({
      ...prev,
      specificDates: (prev.specificDates || []).filter(d => d !== date)
    }));
  };

  const addHour = () => {
    if (!newHour) return;
    if (formData.availableHours?.includes(newHour)) return;
    setFormData(prev => ({
      ...prev,
      availableHours: [...(prev.availableHours || []), newHour].sort()
    }));
    setNewHour('');
  };

  const removeHour = (hour: string) => {
    setFormData(prev => ({
      ...prev,
      availableHours: (prev.availableHours || []).filter(h => h !== hour)
    }));
  };

  const openModal = (city?: City) => {
    if (city) {
      setEditingCity(city);
      setFormData({
        ...city,
        specificDates: city.specificDates || []
      });
    } else {
      setEditingCity(null);
      setFormData({
        name: '',
        deliveryDays: [],
        specificDates: [],
        availableHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
        maxDailyOrders: 10,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCity(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cidades e Agendas</h1>
          <p className="text-gray-500">Defina onde e quando você entrega.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center justify-center gap-2">
          <Plus size={20} />
          Nova Cidade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city) => (
          <div key={city.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-2xl">
                <MapPin size={24} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(city)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => remove(city.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">{city.name}</h3>
            
            <div className="space-y-3 mt-4 flex-grow">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Calendar size={16} className="text-brand-orange mt-1 shrink-0" />
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {days.map(d => (
                      <span 
                        key={d.value}
                        className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold ${
                          city.deliveryDays.includes(d.value) ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {d.label[0]}
                      </span>
                    ))}
                  </div>
                  {city.specificDates && city.specificDates.length > 0 && (
                    <div className="text-[10px] text-gray-400">
                      + {city.specificDates.length} datas específicas
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Clock size={16} className="text-brand-orange" />
                <span> {city.availableHours.length} horários: {city.availableHours.slice(0, 3).join(', ')}{city.availableHours.length > 3 ? '...' : ''}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users size={16} className="text-brand-orange" />
                <span>Limite: {city.maxDailyOrders} pedidos/dia</span>
              </div>
            </div>

            <button
              onClick={() => update(city.id, { isActive: !city.isActive })}
              className={`mt-6 w-full py-3 rounded-xl font-bold transition-all ${
                city.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              {city.isActive ? 'Ativo' : 'Inativo'}
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold">{editingCity ? 'Editar Cidade' : 'Nova Cidade'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Cidade</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: São Paulo"
                      className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Dias de Atendimento (Recorrente)</label>
                    <div className="flex flex-wrap gap-2">
                      {days.map(d => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => toggleDay(d.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            formData.deliveryDays?.includes(d.value) 
                              ? 'bg-brand-orange text-white shadow-md' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Datas Específicas</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="date"
                        className="flex-grow px-4 py-2 bg-gray-50 border-gray-100 rounded-xl text-sm"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={addSpecificDate}
                        className="p-2 bg-brand-orange text-white rounded-xl"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specificDates?.map(date => (
                        <span key={date} className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-brand-orange rounded-full text-xs font-bold">
                          {format(parseISO(date), "dd/MM", { locale: ptBR })}
                          <button type="button" onClick={() => removeSpecificDate(date)}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Horários Disponíveis</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="time"
                        className="flex-grow px-4 py-2 bg-gray-50 border-gray-100 rounded-xl text-sm"
                        value={newHour}
                        onChange={(e) => setNewHour(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={addHour}
                        className="p-2 bg-brand-orange text-white rounded-xl"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.availableHours?.map(hour => (
                        <span key={hour} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                          {hour}
                          <button type="button" onClick={() => removeHour(hour)}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Configurações Gerais</label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Limite Diário de Pedidos</label>
                        <input
                          required
                          type="number"
                          className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
                          value={formData.maxDailyOrders}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxDailyOrders: parseInt(e.target.value) }))}
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded text-brand-orange focus:ring-brand-orange"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <span className="text-sm font-bold text-gray-700">Canal de Venda Ativo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <button type="button" onClick={closeModal} className="flex-grow py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold transition-colors hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-brand-orange text-white rounded-2xl font-bold shadow-lg shadow-orange-200 transition-transform active:scale-95">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
