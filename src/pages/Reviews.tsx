import React, { useState } from 'react';
import { useCollection } from '../hooks/useFirestore';
import { Review } from '../types';
import { Star, MessageSquare, CheckCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { where } from 'firebase/firestore';

export default function Reviews() {
  const { data: reviews, add } = useCollection<Review>('reviews', [where('isApproved', '==', true)]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    comment: '',
    rating: 5,
  });

  const approvedReviews = reviews.filter(r => r.isApproved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await add({
      ...formData,
      isApproved: false,
      isFeatured: false,
      createdAt: null as any,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setFormData({ customerName: '', comment: '', rating: 5 });
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-20">
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold">O que dizem sobre nossas doçuras</h1>
        <p className="text-gray-500 text-lg">A opinião dos nossos clientes é o que nos motiva a entregar o melhor sempre.</p>
        {!showForm && !submitted && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-brand-brown text-white rounded-2xl font-bold hover:bg-brand-orange transition-all shadow-lg"
          >
            Escrever Avaliação
          </button>
        )}
      </div>

      {showForm && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-[40px] shadow-2xl border border-orange-100 animate-in fade-in zoom-in duration-300">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold">Obrigado!</h3>
              <p className="text-gray-500">Sua avaliação foi enviada e será moderada em breve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Sua Experiência</h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-orange"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Avaliação</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-2 transition-transform hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        fill={formData.rating >= star ? '#f97316' : 'none'} 
                        className={formData.rating >= star ? 'text-brand-orange' : 'text-gray-300'} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Comentário</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Conte-nos o que achou da torta!"
                  className="w-full px-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-orange"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="flex-grow py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-brand-orange text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Enviar Avaliação
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {approvedReviews.map((review) => (
          <div key={review.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-orange-100 flex flex-col gap-6 hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
               <div className="flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#f97316" className="text-brand-orange" />
                ))}
              </div>
              <div className="bg-brand-orange/10 p-3 rounded-2xl">
                <MessageSquare className="text-brand-orange" size={20} />
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed italic">"{review.comment}"</p>
            
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-brand-brown">{review.customerName}</p>
                <p className="text-xs text-gray-400">Cliente Verificado</p>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                {review.createdAt?.toDate ? format(review.createdAt.toDate(), "MMM 'de' yyyy", { locale: ptBR }) : 'Recentemente'}
              </p>
            </div>
          </div>
        ))}
        {approvedReviews.length === 0 && !showForm && (
          <div className="col-span-full py-20 text-center opacity-50 space-y-4">
            <Star className="mx-auto" size={48} />
            <p>Seja o primeiro a avaliar!</p>
          </div>
        )}
      </div>

      <div className="bg-brand-brown text-white p-12 rounded-[50px] text-center space-y-6">
        <h2 className="text-3xl font-bold">Ficou com vontade?</h2>
        <p className="text-brand-beige/60 max-w-md mx-auto">Peça sua Torta de Manteiga Escocesa agora e venha deixar seu depoimento aqui também.</p>
        <button className="btn-primary">Ver Produtos</button>
      </div>
    </div>
  );
}
