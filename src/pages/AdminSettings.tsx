import React, { useState, useEffect } from 'react';
import { useDocument } from '../hooks/useFirestore';
import { Settings, DeliveryRange } from '../types';
import { Plus, Trash2, MapPin, Navigation, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';

export default function AdminSettings() {
  const { data: settings, save } = useDocument<Settings>('settings', 'general');
  const [ranges, setRanges] = useState<DeliveryRange[]>([]);
  const [heroUrl, setHeroUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [banners, setBanners] = useState<string[]>([]);

  useEffect(() => {
    if (settings?.deliveryRanges) {
      setRanges(settings.deliveryRanges);
    }
    if (settings?.heroImageUrl) setHeroUrl(settings.heroImageUrl);
    if (settings?.logoUrl) setLogoUrl(settings.logoUrl);
    if (settings?.banners) setBanners(settings.banners);
  }, [settings]);

  const addBanner = (url: string) => {
    if (url) setBanners([...banners, url]);
  };

  const removeBanner = (index: number) => {
    setBanners(banners.filter((_, i) => i !== index));
  };

  const addRange = () => {
    setRanges([...ranges, { minKm: 0, maxKm: 0, price: 0 }]);
  };

  const removeRange = (index: number) => {
    setRanges(ranges.filter((_, i) => i !== index));
  };

  const updateRange = (index: number, field: keyof DeliveryRange, value: number) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setRanges(newRanges);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await save({
      instagramUrl: formData.get('instagramUrl') as string,
      whatsappUrl: formData.get('whatsappUrl') as string,
      whatsappNumber: formData.get('whatsappUrl') as string,
      followerCount: parseInt(formData.get('followerCount') as string),
      dailyProductionLimit: parseInt(formData.get('dailyProductionLimit') as string),
      shopAddress: formData.get('shopAddress') as string,
      localDeliveryEnabled: formData.get('localDeliveryEnabled') === 'on',
      deliveryRanges: ranges.sort((a, b) => a.minKm - b.minKm),
      shopCoordinates: settings?.shopCoordinates || { lat: -23.5702, lng: -46.2941 },
      heroImageUrl: heroUrl,
      logoUrl: logoUrl,
      banners: banners
    });
    alert('Configurações salvas!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações Gerais</h1>
        <p className="text-gray-500">Links, produção e entrega local.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="text-brand-orange" size={20} />
            Identidade Visual
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Logo da Confeitaria</label>
              <div className="w-32 h-32">
                <ImageUpload 
                  currentImage={logoUrl} 
                  onUpload={setLogoUrl} 
                  folder="branding" 
                />
              </div>
              <p className="text-xs text-gray-500">Aparece no cabeçalho e rodapé.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Banner Principal (Hero)</label>
              <ImageUpload 
                currentImage={heroUrl} 
                onUpload={setHeroUrl} 
                folder="branding" 
              />
              <p className="text-xs text-gray-500">Banner de destaque na página inicial.</p>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Galeria de Banners (Opcional)
            </h3>
            <p className="text-sm text-gray-500">Adicione imagens extras para destacar promoções ou novidades.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {banners.map((url, index) => (
                <div key={index} className="relative aspect-video rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                  <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => removeBanner(index)}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="aspect-video">
                <ImageUpload 
                  onUpload={addBanner} 
                  folder="banners" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Informações da Loja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Endereço da Loja (Referência para Delivery)</label>
              <input
                name="shopAddress"
                type="text"
                defaultValue={settings?.shopAddress || 'Rua Flor de Narciso, 532, Jardim Ikeda, Suzano'}
                className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp (DDD + Número)</label>
              <input
                name="whatsappUrl"
                type="text"
                defaultValue={settings?.whatsappUrl}
                placeholder="Ex: 5511999999999"
                className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Instagram URL</label>
              <input
                name="instagramUrl"
                type="text"
                defaultValue={settings?.instagramUrl}
                className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Navigation className="text-brand-orange" size={20} />
              Delivery Local (por distância)
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="localDeliveryEnabled"
                className="sr-only peer" 
                defaultChecked={settings?.localDeliveryEnabled} 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">Ativado</span>
            </label>
          </div>

          <p className="text-sm text-gray-500">Defina os valores de entrega baseados na distância em KM da loja.</p>

          <div className="space-y-4">
            {ranges.map((range, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-4 p-4 bg-gray-50 rounded-2xl relative group">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Km Inicial</label>
                  <input
                    type="number"
                    step="0.1"
                    value={range.minKm}
                    onChange={(e) => updateRange(index, 'minKm', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-white border-gray-100 rounded-xl text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Km Final</label>
                  <input
                    type="number"
                    step="0.1"
                    value={range.maxKm}
                    onChange={(e) => updateRange(index, 'maxKm', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-white border-gray-100 rounded-xl text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={range.price}
                    onChange={(e) => updateRange(index, 'price', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-white border-gray-100 rounded-xl text-sm text-brand-orange font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRange(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRange}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-brand-orange hover:text-brand-orange transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Adicionar Faixa de Preço
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold">Produção e Metas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Seguidores (Exibição)</label>
              <input
                name="followerCount"
                type="number"
                defaultValue={settings?.followerCount}
                className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Limite de Produção Diário</label>
              <input
                name="dailyProductionLimit"
                type="number"
                defaultValue={settings?.dailyProductionLimit}
                className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-brand-brown text-white rounded-3xl font-bold shadow-xl shadow-brown-100 hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
        >
          <div className="w-2 h-2 bg-brand-orange rounded-full group-hover:scale-150 transition-transform" />
          Salvar Todas as Configurações
        </button>
      </form>
    </div>
  );
}

// Redundant exports removed as they are in their own files
