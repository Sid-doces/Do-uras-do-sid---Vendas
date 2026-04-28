import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, MapPin, 
  Star, FileText, Settings as SettingsIcon, LogOut, Menu, X 
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Produtos', path: '/admin/produtos', icon: Package },
    { name: 'Pedidos', path: '/admin/pedidos', icon: ShoppingBag },
    { name: 'Cidades', path: '/admin/cidades', icon: MapPin },
    { name: 'Avaliações', path: '/admin/avaliacoes', icon: Star },
    { name: 'Posts', path: '/admin/posts', icon: FileText },
    { name: 'Configurações', path: '/admin/configuracoes', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-brand-brown text-brand-beige">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-display text-white">S</div>
        <span className="font-display font-bold text-lg">Sid Admin</span>
      </div>
      
      <nav className="flex-grow px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
              location.pathname === item.path 
                ? 'bg-brand-orange text-white shadow-lg' 
                : 'hover:bg-white/5'
            }`}
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-2 mb-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full bg-brand-orange" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-xs font-bold">
              {user?.displayName?.[0] || 'A'}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.displayName || 'Admin'}</p>
            <p className="text-xs opacity-60 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 font-medium transition-colors"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-64 border-r border-gray-200 sticky top-0 h-screen">
        <NavContent />
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {/* Topbar Mobile */}
        <header className="lg:hidden h-16 bg-brand-brown text-white flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-display text-white">S</div>
            <span className="font-display font-bold text-lg">Sid Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <div className={`
          lg:hidden fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="w-64 h-full shadow-2xl">
            <NavContent />
          </div>
          <div className="absolute inset-0 bg-black/50 -z-10" onClick={() => setIsMobileMenuOpen(false)} />
        </div>

        <main className="p-4 lg:p-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
