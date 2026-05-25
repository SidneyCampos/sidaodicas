import React from 'react';
import ProductCard from '../components/ProductCard';
import { mockProducts } from '../data/mockProducts';
import { MessageCircleWarning, Zap } from 'lucide-react';

export const metadata = {
  title: 'Sidão Dicas | Melhores Ofertas e Bugs da Internet',
  description: 'As melhores ofertas, bugs e achados da internet você encontra aqui. Economize de verdade!',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20">
      {/* Header Fixo */}
      <header className="fixed top-0 w-full bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-400" fill="currentColor" size={28} />
            <h1 className="text-2xl font-black text-yellow-400 tracking-tight">
              Sidão Dicas
            </h1>
          </div>
          
          <a 
            href="https://chat.whatsapp.com/C1Ryp7KvesNEgmowEZu2TS" 
            className="bg-[#25D366] hover:bg-[#1fae54] text-white text-sm font-bold py-2.5 px-5 rounded-full flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-900/30"
          >
            <MessageCircleWarning size={20} />
            <span className="hidden sm:inline">Entrar no Grupo VIP</span>
            <span className="sm:hidden">VIP</span>
          </a>
        </div>
      </header>

      {/* Espaçamento para o header fixo */}
      <main className="pt-24 px-4 max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <section className="text-center mb-12 mt-4 sm:mt-8">
          <div className="inline-block bg-red-600 text-white text-xs sm:text-sm font-black px-4 py-1.5 rounded-full mb-6 animate-pulse shadow-lg shadow-red-900/50 uppercase tracking-wide">
            URGENTE: Ofertas por tempo limitado!
          </div>
          <h2 className="text-4xl sm:text-6xl font-black mb-6 leading-tight text-slate-100">
            Encontramos os <br className="hidden sm:block" />
            <span className="text-yellow-400 drop-shadow-md">Maiores Descontos</span> do Dia.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Esses preços podem mudar a qualquer momento. Se gostar de algo, seja rápido e garanta antes que o estoque acabe!
          </p>
        </section>

        {/* Grid de Produtos */}
        <section>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <span className="text-3xl">🔥</span> 
              <span>Em Alta Agora</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold bg-slate-800 px-3 py-1.5 rounded-md uppercase tracking-wider">
              Atualizado hoje
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
