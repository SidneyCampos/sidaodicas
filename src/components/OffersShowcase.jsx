"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
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
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cuponsCount={cupons.length}
        onOpenCoupons={() => setIsCouponsModalOpen(true)}
        savedCount={savedIds.length}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={() => setShowSavedOnly((prev) => !prev)}
      />

      <main className="flex-grow px-4 pt-5 pb-10 max-w-7xl w-full mx-auto">
        {/* Faixa Editorial de Estúdio (Ultra-Compacta, 100% alinhada ao banner do YouTube!) */}
        <section
          aria-label="Apresentação Sidão Dicas Ofertas"
          className="relative overflow-hidden rounded-2xl border border-[#e7d7bf]/[0.09] bg-[#0e141c] mb-6 h-[104px] sm:h-[132px] flex items-center shadow-xl shadow-black/30"
        >
          {/* Imagem real do estúdio ancorada à direita */}
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-right opacity-90 sm:opacity-100"
            style={{ backgroundImage: "url('/studio-banner.jpg')" }}
            aria-hidden="true"
          />
          {/* Gradiente cinematográfico suave para leitura limpa à esquerda */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0d1218] via-[#0d1218]/90 sm:via-[#0d1218]/75 to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 px-5 sm:px-7 max-w-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e5ad5e]" />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e5ad5e]">
                Curadoria Oficial • Estúdio Sidão Dicas
              </span>
            </div>

            <h1 className="text-base sm:text-2xl font-bold text-[#f2ede4] tracking-tight leading-snug">
              Dicas e ofertas selecionadas pra você.
            </h1>

            <div className="hidden sm:flex items-center gap-3 mt-1.5 text-xs text-[#929ca8]">
              <span>Preços auditados na Amazon, Mercado Livre e Shopee</span>
              <span className="text-[#3e4856]">•</span>
              <a
                href="https://youtube.com/@SidãoDicasOfertas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[#e5ad5e] hover:text-[#f2c985] font-medium transition-colors"
              >
                <span>Canal no YouTube</span>
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </section>

        {/* Barra Única e Clean de Filtros + Ordenação + Segurança Discreta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {STORES.map((store) => {
              const active = selectedStore === store;
              return (
                <button
                  key={store}
                  type="button"
                  onClick={() => setSelectedStore(store)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                    active
                      ? "bg-[#d89643] text-[#0b0f14] border-[#d89643] font-bold shadow-sm"
                      : "bg-[#121820] text-[#b4bdc8] border-[#e7d7bf]/[0.07] hover:border-[#d89643]/35 hover:text-[#f2ede4]"
                  }`}
                >
                  {store}
                </button>
              );
            })}

            <span className="h-4 w-px bg-[#e7d7bf]/10 mx-1.5 shrink-0" />

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
                      ? "bg-[#f2ede4] text-[#0b0f14] font-semibold"
                      : "text-[#8b95a3] hover:text-[#f2ede4] hover:bg-white/[0.04]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowTrustInfo((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#8b95a3] hover:text-[#e5ad5e] transition-colors cursor-pointer"
            >
              <ShieldCheck size={14} className="text-[#5ed3a2]" />
              <span>Links 100% oficiais</span>
            </button>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#e5ad5e] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X size={13} />
                  <span>Limpar</span>
                </button>
              )}

              <div className="relative flex items-center">
                <ArrowDownUp
                  size={12}
                  className="absolute left-2.5 text-[#8b95a3] pointer-events-none"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Ordenar ofertas"
                  className="bg-[#121820] hover:bg-[#161e28] border border-[#e7d7bf]/[0.08] text-xs font-medium text-[#d5dce4] pl-7 pr-3 py-1.5 rounded-full focus:outline-none focus:border-[#d89643]/50 cursor-pointer"
                >
                  <option value="recentes" className="bg-[#121820]">
                    Mais recentes
                  </option>
                  <option value="desconto" className="bg-[#121820]">
                    Maior desconto
                  </option>
                  <option value="menor-preco" className="bg-[#121820]">
                    Menor preço
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Popover Discreto de Segurança */}
        {showTrustInfo && (
          <div className="mb-6 bg-[#121820] border border-[#e7d7bf]/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#b4bdc8]">
            <div className="flex items-start sm:items-center gap-2.5">
              <ShieldCheck size={18} className="text-[#5ed3a2] shrink-0" />
              <p>
                <strong className="text-[#f2ede4]">Compra Segura:</strong> O
                Sidão Dicas não é uma loja e nunca pede seus dados bancários.
                Você escolhe a oferta selecionada aqui e finaliza direto no site
                ou app oficial da{" "}
                <strong className="text-[#f2ede4]">Amazon</strong>,{" "}
                <strong className="text-[#f2ede4]">Mercado Livre</strong> ou{" "}
                <strong className="text-[#f2ede4]">Shopee</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTrustInfo(false)}
              className="text-[#8b95a3] hover:text-[#f2ede4] font-semibold shrink-0 self-end sm:self-center cursor-pointer"
            >
              Entendi ✕
            </button>
          </div>
        )}

        {/* Aviso quando visualizando apenas salvos */}
        {showSavedOnly && (
          <div className="mb-5 flex items-center justify-between bg-[#d89643]/10 border border-[#d89643]/25 rounded-xl px-4 py-2.5 text-xs text-[#f2dec0]">
            <span>
              Exibindo suas{" "}
              <strong>{sortedAndFilteredOffers.length} ofertas salvas</strong>.
            </span>
            <button
              type="button"
              onClick={() => setShowSavedOnly(false)}
              className="font-bold text-[#f2ede4] hover:underline cursor-pointer"
            >
              Ver todas as ofertas
            </button>
          </div>
        )}

        {/* VITRINE EDITORIAL DE PRODUTOS */}
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

              {hasMoreOffers && (
                <div className="mt-10 flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="bg-[#121820] hover:bg-[#19212c] text-[#f2ede4] border border-[#e7d7bf]/15 hover:border-[#d89643]/50 font-semibold text-xs sm:text-sm px-6 py-3 rounded-full inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>
                      Carregar mais ofertas (+
                      {Math.min(PAGE_SIZE, remainingCount)})
                    </span>
                    <ChevronDown size={15} className="text-[#e5ad5e]" />
                  </button>
                  <span className="text-[11px] text-[#6e7885]">
                    {visibleOffers.length} de {sortedAndFilteredOffers.length}{" "}
                    ofertas
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#121820] border border-[#e7d7bf]/[0.07] rounded-2xl p-10 text-center max-w-md mx-auto my-8">
              <p className="text-sm font-semibold text-[#f2ede4] mb-1.5">
                {showSavedOnly
                  ? "Você ainda não salvou nenhuma oferta"
                  : "Nenhuma oferta encontrada"}
              </p>
              <p className="text-xs text-[#8b95a3] mb-4">
                {showSavedOnly
                  ? "Toque no coração em qualquer produto para guardar aqui."
                  : "Tente buscar outro termo ou limpar os filtros."}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="bg-[#d89643] hover:bg-[#e5ad5e] text-[#0b0f14] font-bold text-xs px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                Ver Todas as Ofertas
              </button>
            </div>
          )}
        </section>
      </main>

      <CouponsSection
        cupons={cupons}
        isOpen={isCouponsModalOpen}
        onClose={() => setIsCouponsModalOpen(false)}
      />
    </>
  );
}
