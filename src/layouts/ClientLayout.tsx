import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Home, Store, MessageSquare, Newspaper, Instagram } from 'lucide-react';
import { CartProvider, useCart } from '../components/CartProvider';
import { useDocument } from '../hooks/useFirestore';
import { motion, AnimatePresence } from 'motion/react';
import { formatWhatsAppUrl } from '../lib/utils';

const Header = () => {
  const { itemCount } = useCart();
  const location = useLocation();
  const { data: settings } = useDocument<any>('settings', 'general');
  const logoUrl = settings?.logoUrl;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Loja', path: '/loja', icon: Store },
    { name: 'Avaliações', path: '/avaliacoes', icon: MessageSquare },
    { name: 'Novidades', path: '/novidades', icon: Newspaper },
  ];

  return (
    <header className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white font-display text-xl overflow-hidden">
            {logoUrl && logoUrl.trim() !== '' ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              'S'
            )}
          </div>
          <span className="font-display text-xl font-bold text-brand-brown hidden sm:block">
            Doçuras do Sid
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-medium transition-colors hover:text-brand-orange ${
                location.pathname === item.path ? 'text-brand-orange' : 'text-brand-brown'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <Link to="/carrinho" className="relative p-2 text-brand-brown hover:text-brand-orange transition-colors">
          <ShoppingCart size={24} />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-cream">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

const MobileNav = () => {
  const location = useLocation();
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Loja', path: '/loja', icon: Store },
    { name: 'Blog', path: '/novidades', icon: Newspaper },
    { name: 'Review', path: '/avaliacoes', icon: MessageSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-orange-100 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              location.pathname === item.path ? 'text-brand-orange' : 'text-brand-brown/60'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

const WhatsAppButton = () => {
  const { data: settings } = useDocument<any>('settings', 'general');
  const whatsappContact = settings?.whatsappNumber || settings?.whatsappUrl;
  
  return (
    <a
      href={formatWhatsAppUrl(whatsappContact)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40 flex items-center justify-center"
      title="Falar no WhatsApp"
    >
      <MessageSquare size={24} fill="currentColor" />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
    </a>
  );
};

const Footer = () => (
  <footer className="bg-brand-brown text-brand-beige pt-12 pb-24 md:pb-12">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-2xl font-bold mb-4">Doçuras do Sid</h3>
        <p className="text-brand-beige/80">
          A melhor Torta de Manteiga Escocesa da região. Artesanal, fresca e feita com amor.
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-4">Links</h4>
        <div className="flex flex-col gap-2">
          <Link to="/loja" className="hover:text-brand-orange transition-colors">Loja</Link>
          <Link to="/avaliacoes" className="hover:text-brand-orange transition-colors">Avaliações</Link>
          <Link to="/novidades" className="hover:text-brand-orange transition-colors">Novidades</Link>
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-4">Redes Sociais</h4>
        <div className="flex gap-4">
          <a href="#" className="p-2 bg-brand-orange/20 rounded-lg hover:bg-brand-orange/40 transition-colors">
            <Instagram size={20} />
          </a>
          <a href="#" className="p-2 bg-brand-orange/20 rounded-lg hover:bg-brand-orange/40 transition-colors">
            <MessageSquare size={20} />
          </a>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-brand-beige/10 text-center text-sm text-brand-beige/60">
      © {new Date().getFullYear()} Doçuras do Sid. Todos os direitos reservados.
    </div>
  </footer>
);

export default function ClientLayout() {
  const location = useLocation();

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-brand-cream overflow-x-hidden">
        <Header />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        <MobileNav />
        <WhatsAppButton />
      </div>
    </CartProvider>
  );
}
