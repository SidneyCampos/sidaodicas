"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  LayoutGrid,
  Rows3,
  X,
  Zap,
} from "lucide-react";
import Header from "./Header";
import ProductCard from "./ProductCard";
import CouponsSection from "./CouponsSection";

const PAGE_SIZE = 12;

const STORES = [
  { id: "Todas", label: "🔥 Todas", activeClass: "bg-[#FFE600] text-slate-950 border-[#FFE600]" },
  { id: "Amazon", label: "📦 Amazon", activeClass: "bg-[#FF9900] text-slate-950 border-[#FF9900]" },
  { id: "Mercado Livre", label: "🤝 Mercado Livre", activeClass: "bg-[#FFE600] text-slate-950 border-[#FFE600]" },
  { id: "Shopee", label: "🛍️ Shopee", activeClass: "bg-[#EE4D2D] text-white border-[#EE4D2D]" },
];

const CATEGORIES = ["Todas", "Mais Vendidos", "Eletrônicos", "Games", "Casa"];

export default function OffersShowcase({ ofertas = [], cupons = [] }) {
  const [selectedStore, setSelectedStore] = useState("Todas");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  const [mobileTwoCols, setMobileTwoCols] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reseta a paginação para 12 itens sempre que o usuário mudar filtro ou busca
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedStore, selectedCategory, searchQuery]);

  // Filtra e ordena da oferta mais recente para a mais antiga
  const sortedAndFilteredOffers = useMemo(() => {
    const filtered = ofertas.filter((item) => {
      const matchesStore =
        selectedStore === "Todas" ||
        (item.loja && item.loja.toLowerCase() === selectedStore.toLowerCase());

      const matchesCategory =
        selectedCategory === "Todas" ||
        (item.categoria &&
          item.categoria.toLowerCase() === selectedCategory.toLowerCase());

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (item.titulo && item.titulo.toLowerCase().includes(query)) ||
        (item.loja && item.loja.toLowerCase().includes(query)) ||
        (item.categoria && item.categoria.toLowerCase().includes(query)) ||
        (item.cupomOpcional && item.cupomOpcional.toLowerCase().includes(query));

      return matchesStore && matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const timeA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
      const timeB = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [ofertas, selectedStore, selectedCategory, searchQuery]);

  const visibleOffers = useMemo(() => {
    return sortedAndFilteredOffers.slice(0, visibleCount);
  }, [sortedAndFilteredOffers, visibleCount]);

  const hasMoreOffers = visibleCount < sortedAndFilteredOffers.length;
  const remainingCount = sortedAndFilteredOffers.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const clearFilters = () => {
    setSelectedStore("Todas");
    setSelectedCategory("Todas");
    setSearchQuery("");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      {/* Header Unificado Estilo Marketplace (Busca + Segurança + Botão de Cupons + VIP) */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cuponsCount={cupons.length}
        isCouponsOpen={isCouponsOpen}
        onToggleCoupons={() => setIsCouponsOpen((prev) => !prev)}
      />

      <main className="flex-grow px-3 sm:px-4 pt-3 sm:pt-5 max-w-7xl w-full mx-auto">
        {/* Barra de Filtros Rápidos Horizontal (1 Linha no Mobile igual App Shopee/Meli) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 mb-3">
          {/* Lojas Oficiais */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {STORES.map((store) => {
              const active = selectedStore === store.id;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => setSelectedStore(store.id)}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    active
                      ? `${store.activeClass} shadow-sm`
                      : "bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {store.label}
                </button>
              );
            })}

            <span className="text-slate-700 mx-1 hidden sm:inline">|</span>

            {/* Categorias na mesma faixa rolável no mobile */}
            {CATEGORIES.filter((c) => c !== "Todas").map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(active ? "Todas" : category)
                  }
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    active
                      ? "bg-yellow-400/20 border-yellow-400 text-yellow-300"
                      : "bg-slate-900/60 border-slate-800/90 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Controles Direitos: Status do Radar + Alternador de Grade Mobile */}
          <div className="flex items-center justify-between lg:justify-end gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Zap size={14} className="text-[#FFE600] fill-[#FFE600]" />
              <span>Radar de Ofertas em Tempo Real</span>
              <span className="text-slate-500">({sortedAndFilteredOffers.length})</span>
            </div>

            <div className="flex items-center gap-1.5">
              {(selectedStore !== "Todas" ||
                selectedCategory !== "Todas" ||
                searchQuery.trim() !== "") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-[#FFE600] hover:underline flex items-center gap-1 cursor-pointer mr-1"
                >
                  <X size={13} />
                  <span>Limpar</span>
                </button>
              )}

              {/* Botão para alternar 2 colunas vs 1 coluna no celular */}
              <button
                type="button"
                onClick={() => setMobileTwoCols((prev) => !prev)}
                className="sm:hidden bg-slate-900 border border-slate-800 text-slate-300 p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold"
                title="Alternar visualização"
              >
                {mobileTwoCols ? <Rows3 size={14} /> : <LayoutGrid size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Barra Opcional/Retrátil de Cupons (Fica fechada em 1 linha fina até clicar!) */}
        <CouponsSection
          cupons={cupons}
          isOpenExternal={isCouponsOpen}
          onToggleExternal={setIsCouponsOpen}
        />

        {/* VITRINE DE PRODUTOS IMEDIATA (Estilo Marketplace: 2 cols no mobile, 3 no tablet, 4 no desktop) */}
        <section aria-label="Ofertas em Destaque">
          {visibleOffers.length > 0 ? (
            <>
              <div
                className={`grid ${
                  mobileTwoCols ? "grid-cols-2" : "grid-cols-1"
                } sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4`}
              >
                {visibleOffers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Botão de Paginação: Carregar mais ofertas (+12 a cada clique) */}
              {hasMoreOffers && (
                <div className="mt-8 flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="bg-slate-900 hover:bg-slate-800 text-white border border-yellow-400/50 hover:border-[#FFE600] font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl inline-flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Carregar mais ofertas</span>
                    <span className="bg-[#FFE600] text-slate-950 text-xs font-black px-2 py-0.5 rounded-full">
                      +{Math.min(PAGE_SIZE, remainingCount)}
                    </span>
                    <ChevronDown size={16} className="text-[#FFE600]" />
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Exibindo {visibleOffers.length} de {sortedAndFilteredOffers.length} ofertas verificadas
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto my-6">
              <p className="text-base font-bold text-white mb-1.5">
                Nenhuma oferta encontrada
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Tente buscar por outro termo ou limpar os filtros selecionados.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="bg-[#FFE600] hover:bg-yellow-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Ver Todas as Ofertas
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
