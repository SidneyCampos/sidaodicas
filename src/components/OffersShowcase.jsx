"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  ShieldCheck,
  X,
} from "lucide-react";
import Header from "./Header";
import ProductCard, { calculateDiscountPercentage } from "./ProductCard";
import CouponsSection from "./CouponsSection";

const PAGE_SIZE = 12;
const SAVED_STORAGE_KEY = "sidao_saved_offers";

const STORES = ["Todas", "Amazon", "Mercado Livre", "Shopee"];
const CATEGORIES = ["Todas", "Mais Vendidos", "Eletrônicos", "Games", "Casa"];

export default function OffersShowcase({ ofertas = [], cupons = [] }) {
  const [selectedStore, setSelectedStore] = useState("Todas");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortBy, setSortBy] = useState("recentes");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [showTrustInfo, setShowTrustInfo] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sistema de Favoritos/Salvos em localStorage (Retenção na página)
  const [savedIds, setSavedIds] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSavedIds(parsed);
      }
    } catch {
      // ignora
    }
  }, []);

  const toggleSaveOffer = (id) => {
    setSavedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignora
      }
      return next;
    });
  };

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedStore, selectedCategory, searchQuery, sortBy, showSavedOnly]);

  const sortedAndFilteredOffers = useMemo(() => {
    const filtered = ofertas.filter((item) => {
      if (showSavedOnly && !savedIds.includes(item.id)) {
        return false;
      }

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
      if (sortBy === "desconto") {
        const discA = calculateDiscountPercentage(
          a.precoAntigo,
          a.precoAtual,
          a.descontoPercentual
        );
        const discB = calculateDiscountPercentage(
          b.precoAntigo,
          b.precoAtual,
          b.descontoPercentual
        );
        return discB - discA;
      }
      if (sortBy === "menor-preco") {
        return (Number(a.precoAtual) || 0) - (Number(b.precoAtual) || 0);
      }
      // Padrão: Mais recentes primeiro
      const timeA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
      const timeB = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [
    ofertas,
    selectedStore,
    selectedCategory,
    searchQuery,
    sortBy,
    showSavedOnly,
    savedIds,
  ]);

  const visibleOffers = useMemo(() => {
    return sortedAndFilteredOffers.slice(0, visibleCount);
  }, [sortedAndFilteredOffers, visibleCount]);

  const hasMoreOffers = visibleCount < sortedAndFilteredOffers.length;
  const remainingCount = sortedAndFilteredOffers.length - visibleCount;

  const hasActiveFilters =
    selectedStore !== "Todas" ||
    selectedCategory !== "Todas" ||
    searchQuery.trim() !== "" ||
    showSavedOnly;

  const clearFilters = () => {
    setSelectedStore("Todas");
    setSelectedCategory("Todas");
    setSearchQuery("");
    setShowSavedOnly(false);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      {/* Header Clean (Sem sub-barra poluída) */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cuponsCount={cupons.length}
        onOpenCoupons={() => setIsCouponsModalOpen(true)}
        savedCount={savedIds.length}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={() => setShowSavedOnly((prev) => !prev)}
      />

      <main className="flex-grow px-4 pt-5 pb-8 max-w-7xl w-full mx-auto">
        {/* Barra Única e Clean de Filtros + Ordenação + Selo Discreto de Segurança */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          {/* Lojas + Categorias em uma única faixa limpa sem emojis exagerados */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {STORES.map((store) => {
              const active = selectedStore === store;
              return (
                <button
                  key={store}
                  type="button"
                  onClick={() => setSelectedStore(store)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                    active
                      ? "bg-[#facc15] text-slate-950 font-bold"
                      : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {store}
                </button>
              );
            })}

            <span className="h-4 w-px bg-white/10 mx-1.5 shrink-0" />

            {CATEGORIES.filter((c) => c !== "Todas").map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(active ? "Todas" : category)
                  }
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                    active
                      ? "bg-white text-slate-950 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Ordenação + Selo de Segurança Minimalista */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowTrustInfo((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Links 100% oficiais</span>
            </button>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#facc15] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X size={13} />
                  <span>Limpar</span>
                </button>
              )}

              <div className="relative flex items-center">
                <ArrowDownUp
                  size={12}
                  className="absolute left-2.5 text-slate-400 pointer-events-none"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Ordenar ofertas"
                  className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 pl-7 pr-3 py-1.5 rounded-full focus:outline-none focus:border-white/20 cursor-pointer"
                >
                  <option value="recentes" className="bg-slate-900">
                    Mais recentes
                  </option>
                  <option value="desconto" className="bg-slate-900">
                    Maior desconto
                  </option>
                  <option value="menor-preco" className="bg-slate-900">
                    Menor preço
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Popover Discreto de Segurança (Só aparece se clicar em "Links 100% oficiais") */}
        {showTrustInfo && (
          <div className="mb-6 bg-[#111827] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-start sm:items-center gap-2.5">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
              <p>
                <strong className="text-white">Compra Segura:</strong> O Sidão
                Dicas não é uma loja e nunca pede seus dados. Você escolhe a
                oferta aqui e finaliza a compra direto no site ou app oficial da{" "}
                <strong className="text-white">Amazon</strong>,{" "}
                <strong className="text-white">Mercado Livre</strong> ou{" "}
                <strong className="text-white">Shopee</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTrustInfo(false)}
              className="text-slate-400 hover:text-white font-semibold shrink-0 self-end sm:self-center cursor-pointer"
            >
              Entendi ✕
            </button>
          </div>
        )}

        {/* Aviso quando visualizando apenas favoritos */}
        {showSavedOnly && (
          <div className="mb-5 flex items-center justify-between bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 text-xs text-rose-200">
            <span>
              Exibindo suas <strong>{sortedAndFilteredOffers.length} ofertas salvas</strong>.
            </span>
            <button
              type="button"
              onClick={() => setShowSavedOnly(false)}
              className="font-bold text-white hover:underline cursor-pointer"
            >
              Ver todas as ofertas
            </button>
          </div>
        )}

        {/* VITRINE CLEAN DE PRODUTOS (Espaço para respirar!) */}
        <section aria-label="Ofertas em Destaque">
          {visibleOffers.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {visibleOffers.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSaved={savedIds.includes(product.id)}
                    onToggleSave={toggleSaveOffer}
                  />
                ))}
              </div>

              {/* Paginação "Carregar mais ofertas" (+12 a cada clique) */}
              {hasMoreOffers && (
                <div className="mt-10 flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 font-semibold text-xs sm:text-sm px-6 py-3 rounded-full inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>
                      Carregar mais ofertas (+{Math.min(PAGE_SIZE, remainingCount)})
                    </span>
                    <ChevronDown size={15} className="text-[#facc15]" />
                  </button>
                  <span className="text-[11px] text-slate-500">
                    {visibleOffers.length} de {sortedAndFilteredOffers.length} ofertas
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center max-w-md mx-auto my-8">
              <p className="text-sm font-semibold text-white mb-1.5">
                {showSavedOnly
                  ? "Você ainda não salvou nenhuma oferta"
                  : "Nenhuma oferta encontrada"}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                {showSavedOnly
                  ? "Toque no coração em qualquer produto para guardar aqui."
                  : "Tente buscar outro termo ou limpar os filtros."}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="bg-[#facc15] hover:bg-yellow-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                Ver Todas as Ofertas
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modal Clean de Cupons (Aberto pelo botão no Header — zero poluição na página!) */}
      <CouponsSection
        cupons={cupons}
        isOpen={isCouponsModalOpen}
        onClose={() => setIsCouponsModalOpen(false)}
      />
    </>
  );
}
