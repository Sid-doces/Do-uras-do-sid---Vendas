import React, { useState } from 'react';
import { useCollection } from '../hooks/useFirestore';
import { Product } from '../types';
import { ImageUpload } from '../components/ImageUpload';
import { Plus, Edit2, Trash2, Search, Filter, Star, Eye, EyeOff } from 'lucide-react';

export default function AdminProducts() {
  const { data: products, add, update, remove, loading } = useCollection<Product>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'Tortas',
    stock: 0,
    imageUrl: '',
    isBestSeller: false,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await update(editingProduct.id, formData);
    } else {
      await add(formData as any);
    }
    closeModal();
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Tortas',
        stock: 0,
        imageUrl: '',
        isBestSeller: false,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-500">Gerencie seu catálogo de delícias.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-orange"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100 flex items-center gap-2">
              <Filter size={18} />
              Filtro
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Produto</th>
                <th className="px-6 py-4 font-bold">Categoria</th>
                <th className="px-6 py-4 font-bold">Preço</th>
                <th className="px-6 py-4 font-bold">Estoque</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Plus size={12} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 flex items-center gap-1">
                          {p.name}
                          {p.isBestSeller && <Star size={12} className="fill-orange-400 text-orange-400" />}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600 font-medium">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 border-none focus:ring-2 focus:ring-brand-orange">
                    R$ {p.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-900'}`}>
                        {p.stock}
                      </span>
                      {p.stock <= 5 && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => update(p.id, { isActive: !p.isActive })}
                      className={`p-2 rounded-lg transition-colors ${p.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      {p.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => remove(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full"><Plus className="rotate-45" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">Imagem do Produto</label>
      <ImageUpload 
        folder="products" 
        currentImage={formData.imageUrl} 
        onUploading={setIsUploading}
        onUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} 
      />
      <div className="mt-2">
        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Ou Link da Imagem</label>
        <input
          type="text"
          placeholder="https://colar-link-da-imagem.jpg"
          className="w-full px-4 py-2 bg-gray-50 border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-brand-orange"
          value={formData.imageUrl || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
        />
      </div>
    </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nome</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preço (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Estoque Inicial</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  >
                    <option value="Tortas">Tortas</option>
                    <option value="Kits">Kits</option>
                    <option value="Embalagens">Embalagens</option>
                  </select>
                </div>
                <div className="flex items-center gap-8 px-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded text-brand-orange focus:ring-brand-orange"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                    />
                    <span className="text-sm font-bold text-gray-700">Destaque</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-grow py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold transition-all hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-grow py-4 bg-brand-orange text-white rounded-2xl font-bold transition-all hover:bg-brand-orange/90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Aguarde o Upload...' : (editingProduct ? 'Salvar Alterações' : 'Criar Produto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
