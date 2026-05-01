import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, ShoppingCart } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed bottom-24 left-1/2 z-[100] min-w-[280px]"
        >
          <div className="bg-brand-brown text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-white/10">
            <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center">
              <CheckCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">{message}</p>
              <div className="flex items-center gap-1 text-[10px] text-brand-orange font-bold uppercase tracking-wider">
                <ShoppingCart size={10} />
                Item adicionado
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
