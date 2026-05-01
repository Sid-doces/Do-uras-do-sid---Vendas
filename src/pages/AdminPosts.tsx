import React, { useState } from 'react';
import { useCollection } from '../hooks/useFirestore';
import { Post } from '../types';
import { ImageUpload } from '../components/ImageUpload';
import { Plus, Edit2, Trash2, Calendar, Star, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminPosts() {
  const { data: posts, add, update, remove, loading } = useCollection<Post>('posts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Post>>({
    title: '',
    content: '',
    imageUrl: '',
    isFeatured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      await update(editingPost.id, formData);
    } else {
      await add(formData as any);
    }
    closeModal();
  };

  const openModal = (post?: Post) => {
    if (post) {
      setEditingPost(post);
      setFormData(post);
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        content: '',
        imageUrl: '',
        isFeatured: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novidades / Blog</h1>
          <p className="text-gray-500">Crie conteúdo para engajar seus clientes.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Novo Post
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar posts..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-orange"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredPosts.map((post) => (
            <div key={post.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50 transition-colors group">
              <div className="w-full md:w-48 aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-sm bg-gray-100 flex-shrink-0">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Calendar size={48} />
                  </div>
                )}
              </div>
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-3">
                  {post.isFeatured && (
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> DESTAQUE
                    </span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {post.createdAt?.toDate ? format(post.createdAt.toDate(), "dd/MM/yyyy", { locale: ptBR }) : 'Recentemente'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                <p className="text-gray-500 line-clamp-2 text-sm">{post.content}</p>
                
                <div className="pt-4 flex gap-2">
                  <button onClick={() => openModal(post)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors">
                    <Edit2 size={14} /> Editar
                  </button>
                  <button onClick={() => remove(post.id)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && filteredPosts.length === 0 && (
            <div className="p-20 text-center text-gray-400">Nenhum post encontrado.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold">{editingPost ? 'Editar Post' : 'Novo Post'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full"><Plus className="rotate-45" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Imagem de Capa</label>
                <ImageUpload 
                  folder="posts"
                  currentImage={formData.imageUrl}
                  onUploading={setIsUploading}
                  onUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                />
                <div className="mt-2 text-xs">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Ou Link Direto</label>
                  <input
                    type="text"
                    placeholder="https://colar-imagem.jpg"
                    className="w-full px-3 py-2 bg-gray-50 border-gray-100 rounded-xl focus:ring-1 focus:ring-brand-orange"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Título</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Conteúdo</label>
                <textarea
                  required
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-brand-orange focus:ring-brand-orange"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  />
                  <span className="text-sm font-bold text-gray-700">Destaque (Aparecerá no banner principal)</span>
                </label>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <button type="button" onClick={closeModal} className="flex-grow py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="flex-[2] py-4 bg-brand-orange text-white rounded-2xl font-bold shadow-lg disabled:opacity-50"
                >
                  {isUploading ? 'Enviando...' : 'Salvar Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
