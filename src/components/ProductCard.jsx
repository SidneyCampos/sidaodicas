import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <article className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-700 flex flex-col group relative">
      {/* Tag FOMO */}
      {product.tag && (
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full z-10 animate-pulse shadow-lg">
          {product.tag}
        </div>
      )}

      {/* Imagem do Produto */}
      <div className="w-full h-56 bg-white overflow-hidden flex items-center justify-center p-4">
        <img 
          src={product.urlImagem} 
          alt={product.titulo} 
          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Detalhes do Produto */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-slate-200 font-medium text-sm sm:text-base line-clamp-2 mb-4 flex-grow">
          {product.titulo}
        </h3>

        <div className="flex flex-col gap-1 mb-5">
          <span className="text-slate-400 text-xs sm:text-sm line-through">
            De: {formatPrice(product.precoOriginal)}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-yellow-400 font-bold">Por:</span>
            <span className="text-3xl font-black text-yellow-400">
              {formatPrice(product.precoDesconto)}
            </span>
          </div>
          <span className="text-xs text-green-400 font-semibold mt-1">
            ✓ Pix ou Cartão Sem Juros
          </span>
        </div>

        {/* Botão de Compra - CTA */}
        <button className="w-full bg-[#25D366] hover:bg-[#1fae54] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg shadow-green-900/50 active:scale-95">
          <ShoppingCart size={22} />
          <span className="text-lg">GARANTIR OFERTA</span>
        </button>
      </div>
    </article>
  );
}
