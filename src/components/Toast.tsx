import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, ShoppingCart, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, type = 'success', onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000); // 5 seconds for visibility
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const config = {
    success: {
      bg: 'bg-brand-brown',
      iconBg: 'bg-brand-orange',
      icon: <CheckCircle size={18} className="text-white" />,
      sub: 'Sucesso'
    },
    error: {
      bg: 'bg-red-900',
      iconBg: 'bg-red-500',
      icon: <AlertCircle size={18} className="text-white" />,
      sub: 'Erro Falha'
    },
    info: {
      bg: 'bg-blue-900',
      iconBg: 'bg-blue-500',
      icon: <Info size={18} className="text-white" />,
      sub: 'Aviso'
    }
  };

  const current = config[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed bottom-24 left-1/2 z-[100] min-w-[300px] max-w-[90vw]"
        >
          <div className={`${current.bg} text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-white/10`}>
            <div className={`w-8 h-8 ${current.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
              {current.icon}
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">{message}</p>
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${type === 'success' ? 'text-brand-orange' : 'text-white/60'}`}>
                {current.sub}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
