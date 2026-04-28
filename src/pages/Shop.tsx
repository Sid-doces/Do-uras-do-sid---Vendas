import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '../hooks/useFirestore';
import { Product } from '../types';
import { useCart } from '../components/CartProvider';
import { ShoppingCart, Search, Filter, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Shop() {
  const { data: products, loading } = useCollection<Product>('products');
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Todos', 'Tortas', 'Kits', 'Embalagens'];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return p.isActive && matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">Nossa Loja</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Escolha suas delícias e agende sua entrega. Tudo feito de maneira artesanal sob demanda.</p>
      </div>

      <div className="sticky top-20 z-30 flex flex-col md:flex-row gap-4 py-4 backdrop-blur-md">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="O que você está procurando?"
            className="w-full pl-12 pr-4 py-4 bg-white border border-orange-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-orange outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-brand-orange text-white shadow-lg' 
                  : 'bg-white text-gray-500 border border-orange-100 hover:border-brand-orange'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card flex flex-col h-full"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Star size={40} />
                  </div>
                )}
                {product.isBestSeller && (
                  <div className="absolute top-4 left-4 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> MAIS PEDIDO
                  </div>
                )}
                {product.stock <= 5 && (
                   <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                    SÓ RESTAM {product.stock}
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">{product.category}</span>
                    <div className="flex text-orange-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Preço</p>
                    <p className="text-2xl font-display font-bold text-brand-brown">R$ {product.price.toFixed(2)}</p>
                  </div>
                  <button
                    disabled={product.stock <= 0}
                    onClick={() => addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1
                    })}
                    className={`p-4 text-white rounded-2xl shadow-lg transition-all ${
                      product.stock > 0 
                        ? 'bg-brand-orange hover:shadow-xl hover:scale-110 active:scale-95' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Oops! Nada encontrado</h3>
          <p className="text-gray-500">Não encontramos produtos nessa categoria ou busca no momento.</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-brand-orange/5 border border-brand-orange/10 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-brand-orange/10 rounded-3xl text-brand-orange shrink-0">
            <Info size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-bold">Produção Limitada</h4>
            <p className="text-brand-brown/60">Produzimos apenas 20 unidades por dia para garantir a frescura máxima. Reserve a sua com antecedência!</p>
          </div>
        </div>
        <Link to="/carrinho" className="btn-primary whitespace-nowrap">Ver Carrinho</Link>
      </div>
    </div>
  );
}
