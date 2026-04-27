import React from 'react';
import { useCollection } from '../hooks/useFirestore';
import { Review } from '../types';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';

export default function AdminReviews() {
  const { data: reviews, update, remove, loading } = useCollection<Review>('reviews');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Avaliações</h1>
        <p className="text-gray-500">Modere os comentários e destaque os melhores.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-grow space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex text-orange-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={review.rating > i ? 'currentColor' : 'none'} className={review.rating > i ? '' : 'text-gray-200'} />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-900">{review.customerName}</span>
              </div>
              <p className="text-gray-600 italic">"{review.comment}"</p>
              <div className="flex gap-2">
                {review.isApproved ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">Aprovado</span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded">Pendente</span>
                )}
                {review.isFeatured && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">Em Destaque</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!review.isApproved && (
                <button
                  onClick={() => update(review.id, { isApproved: true })}
                  className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                  title="Aprovar"
                >
                  <CheckCircle size={20} />
                </button>
              )}
              {review.isApproved && (
                 <button
                  onClick={() => update(review.id, { isFeatured: !review.isFeatured })}
                  className={`p-3 rounded-xl transition-colors ${review.isFeatured ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}
                  title="Destacar"
                >
                  <Star size={20} />
                </button>
              )}
              <button
                onClick={() => update(review.id, { isApproved: false })}
                className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-colors"
                title="Reprovar"
              >
                <XCircle size={20} />
              </button>
              <button
                onClick={() => remove(review.id)}
                className="p-3 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
                title="Excluir"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {!loading && reviews.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">Nenhuma avaliação recebida.</p>
          </div>
        )}
      </div>
    </div>
  );
}
