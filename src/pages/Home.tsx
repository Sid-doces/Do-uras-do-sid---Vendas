import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Star, MapPin, Clock, ArrowRight, Instagram, MessageSquare, Store, Newspaper } from 'lucide-react';
import { useCollection, useDocument } from '../hooks/useFirestore';
import { Product, City, Settings, Post } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Home() {
  const { data: products } = useCollection<Product>('products');
  const { data: cities } = useCollection<City>('cities');
  const { data: posts } = useCollection<Post>('posts');
  const { data: settings } = useDocument<Settings>('settings', 'general');

  const bestSellers = products.filter(p => p.isBestSeller && p.isActive).slice(0, 3);
  const recentPosts = posts.slice(0, 3);
  const activeCitiesCount = cities.filter(c => c.isActive).length;

  // Scarcity simulation
  const today = format(new Date(), 'yyyy-MM-dd');
  const productionLimit = settings?.dailyProductionLimit || 20;
  const unitsLeft = Math.max(2, productionLimit - 15); // Simulated logic for home page teaser

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-brown/90 to-brand-brown/40 z-10" />
          <img 
            src={settings?.heroImageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"} 
            alt="Delicious Pie" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl text-white space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange rounded-full text-sm font-bold shadow-lg animate-bounce">
              <Star size={16} fill="currentColor" />
              <span>A melhor da região</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
              Torta de Manteiga <br />
              <span className="text-brand-orange">Escocesa</span>
            </h1>
            <p className="text-xl text-brand-beige/80 max-w-lg">
              Receita artesanal que derrete na boca. Crocante por fora, cremosa por dentro e feita com manteiga de verdade.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/loja" className="btn-primary flex items-center gap-2 text-lg">
                <ShoppingCart size={20} />
                Peça Agora
              </Link>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <MapPin size={20} className="text-brand-orange" />
                <span className="font-medium">{activeCitiesCount} cidades atendidas</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Urgency Badge */}
        <div className="absolute bottom-8 right-4 md:right-8 z-30">
          <div className="glass p-6 rounded-3xl shadow-2xl space-y-2 border-brand-orange/30">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Urgência</p>
            <p className="text-2xl font-bold text-brand-brown">Restam apenas {unitsLeft} unidades!</p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-orange transition-all duration-1000" style={{ width: '85%' }} />
            </div>
            <p className="text-[10px] text-red-500 font-bold">Últimas encomendas para hoje</p>
          </div>
        </div>
      </section>

      {/* Featured Cities */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Onde Entregamos</h2>
          <span className="text-brand-orange font-bold flex items-center gap-2">
            Ver todas <ArrowRight size={18} />
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {cities.filter(c => c.isActive).map(city => (
            <div key={city.id} className="min-w-[280px] bg-white p-6 rounded-3xl shadow-sm border border-orange-100 flex items-center gap-4">
              <div className="p-3 bg-brand-orange/10 rounded-2xl text-brand-orange">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">{city.name}</h4>
                <p className="text-sm text-gray-500">Agenda aberta</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <p className="text-brand-orange font-bold uppercase tracking-widest text-sm">Favoritos</p>
          <h2 className="text-4xl md:text-5xl font-bold">Os mais pedidos</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bestSellers.map((product) => (
            <Link to="/loja" key={product.id} className="card group">
              <div className="aspect-square relative overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                    <Store size={48} />
                  </div>
                )}
                {product.isBestSeller && (
                  <div className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    MAIS VENDIDO
                  </div>
                )}
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-2xl font-bold">{product.name}</h3>
                <p className="text-gray-500 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between pt-4">
                  <p className="text-2xl font-display font-bold text-brand-orange">R$ {product.price.toFixed(2)}</p>
                  <button className="p-3 bg-brand-brown text-white rounded-xl hover:bg-brand-orange transition-colors">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* News Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-4">
            <p className="text-brand-orange font-bold uppercase tracking-widest text-sm">Novidades</p>
            <h2 className="text-4xl font-bold">Acompanhe nosso Blog</h2>
          </div>
          <Link to="/novidades" className="text-brand-orange font-bold flex items-center gap-2 hover:gap-3 transition-all">
            Ver tudo <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <Link to="/novidades" key={post.id} className="group space-y-4">
              <div className="aspect-video rounded-3xl overflow-hidden bg-gray-100">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Newspaper size={48} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  {post.createdAt?.toDate ? format(post.createdAt.toDate(), "dd 'de' MMMM", { locale: ptBR }) : 'Recentemente'}
                </p>
                <h3 className="text-xl font-bold text-brand-brown group-hover:text-brand-orange transition-colors">{post.title}</h3>
                <p className="text-gray-500 line-clamp-2 text-sm">{post.content}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-brand-brown text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Junte-se aos mais de <span className="text-brand-orange text-6xl">+{settings?.followerCount || '2k'}</span> apaixonados
            </h2>
            <p className="text-brand-beige/60 text-lg">
              Nossa comunidade no Instagram compartilha momentos doces todos os dias. Siga-nos e fique por dentro das fornadas.
            </p>
            <div className="flex flex-wrap gap-6">
              <a 
                href={settings?.instagramUrl || '#'} 
                target="_blank" 
                className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"
              >
                <Instagram size={24} className="text-brand-orange" />
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">Instagram</p>
                  <p className="font-bold">@docurasdosid</p>
                </div>
              </a>
              <a 
                href={`https://wa.me/${settings?.whatsappUrl || ''}`} 
                target="_blank" 
                className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"
              >
                <MessageSquare size={24} className="text-green-400" />
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">WhatsApp</p>
                  <p className="font-bold">Chamar no Whats</p>
                </div>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
               <div className="aspect-[3/4] bg-brand-orange rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1519340241574-2dec39624824?auto=format&fit=crop&w=400&q=80" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>
               <div className="aspect-square bg-brand-beige rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>
            </div>
            <div className="space-y-4">
               <div className="aspect-square bg-brand-beige rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>
               <div className="aspect-[3/4] bg-brand-orange rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
