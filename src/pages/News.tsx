import React from 'react';
import { useCollection } from '../hooks/useFirestore';
import { Post } from '../types';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function News() {
  const { data: posts, loading } = useCollection<Post>('posts');

  const featuredPost = posts.find(p => p.isFeatured) || posts[0];
  const otherPosts = posts.filter(p => p.id !== featuredPost?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-20">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold">Novidades do Sid</h1>
        <p className="text-gray-500 text-lg">Acompanhe nosso blog para saber mais sobre novos sabores, kits e histórias da confeitaria.</p>
      </div>

      {featuredPost && (
        <section className="relative h-[60vh] min-h-[400px] rounded-[50px] overflow-hidden group shadow-2xl bg-brand-brown">
          {featuredPost.imageUrl ? (
            <img src={featuredPost.imageUrl} alt={featuredPost.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" referrerPolicy="no-referrer" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white opacity-20">
              <BookOpen size={100} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-brown via-brand-brown/40 to-transparent flex flex-col justify-end p-8 md:p-12 space-y-4">
            <div className="flex items-center gap-4 text-brand-orange text-sm font-bold uppercase tracking-widest">
              <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-[10px]">DESTAQUE</span>
              {featuredPost.createdAt?.toDate && format(featuredPost.createdAt.toDate(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white max-w-3xl leading-tight">{featuredPost.title}</h2>
            <p className="text-brand-beige/80 max-w-2xl line-clamp-2 text-lg">{featuredPost.content}</p>
            <button className="flex items-center gap-2 text-brand-orange font-bold text-lg pt-4 hover:gap-4 transition-all">
              Ler post completo <ArrowRight size={24} />
            </button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {otherPosts.map((post) => (
          <div key={post.id} className="space-y-6 group cursor-pointer">
            <div className="aspect-[16/10] overflow-hidden rounded-[32px] shadow-sm group-hover:shadow-xl transition-all bg-gray-100">
              {post.imageUrl ? (
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <BookOpen size={48} />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-orange uppercase tracking-widest">
                <Calendar size={14} />
                {post.createdAt?.toDate && format(post.createdAt.toDate(), 'dd MMM, yyyy', { locale: ptBR })}
              </div>
              <h3 className="text-2xl font-bold text-brand-brown group-hover:text-brand-orange transition-colors">{post.title}</h3>
              <p className="text-gray-500 line-clamp-3 leading-relaxed">{post.content}</p>
              <button className="flex items-center gap-2 text-brand-brown font-bold hover:text-brand-orange transition-all">
                Continuar lendo <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 space-y-4 opacity-50">
          <BookOpen className="mx-auto" size={48} />
          <p className="text-xl font-medium">Nenhum post publicado ainda.</p>
        </div>
      )}
    </div>
  );
}
