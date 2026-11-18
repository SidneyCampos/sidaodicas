"use client";

import React, { useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal, Sparkles, Store, X } from "lucide-react";
import ProductCard from "./ProductCard";
import CouponsSection from "./CouponsSection";

const STORES = ["Todas", "Amazon", "Mercado Livre", "Shopee"];
const CATEGORIES = ["Todas", "Mais Vendidos", "Eletrônicos", "Games", "Casa"];

export default function OffersShowcase({ ofertas = [], cupons = [] }) {
  const [selectedStore, setSelectedStore] = useState("Todas");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOffers = useMemo(() => {
    return ofertas.filter((item) => {
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
  }, [ofertas, selectedStore, selectedCategory, searchQuery]);

  const clearFilters = () => {
    setSelectedStore("Todas");
    setSelectedCategory("Todas");
    setSearchQuery("");
  };

  return (
    <div>
      {/* 3. SEÇÃO DE CUPONS DE DESCONTO ATIVOS */}
      <CouponsSection cupons={cupons} />

      {/* 4. VITRINE DE OFERTAS COM FILTROS RÁPIDOS E BUSCA */}
      <section aria-labelledby="vitrine-heading" className="mt-8">
        {/* Barra de Controle: Título + Busca */}
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2
                id="vitrine-heading"
                className="text-xl sm:text-2xl font-black text-white flex items-center gap-2"
              >
                <span>🔥 Ofertas Verificadas em Destaque</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Filtre por loja oficial, categoria ou pesquise o produto que você procura.
              </p>
            </div>

            {/* Campo de Busca */}
            <div className="relative w-full lg:w-80">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produto, loja ou cupom..."
                aria-label="Buscar ofertas"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-yellow-400 focus:outline-none text-sm text-white placeholder-slate-400 pl-10 pr-9 py-2.5 rounded-xl transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filtros Rápidos por Loja e Categoria */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-700/60">
            {/* Filtro por Loja Oficial */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                <Store size={14} className="text-yellow-400" />
                Loja:
              </span>
              {STORES.map((store) => {
                const active = selectedStore === store;
                return (
                  <button
                    key={store}
                    type="button"
                    onClick={() => setSelectedStore(store)}
                    className={`text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? "bg-[#facc15] border-[#facc15] text-slate-950 font-black shadow-md shadow-yellow-400/15"
                        : "bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                    }`}
                  >
                    {store}
                  </button>
                );
              })}
            </div>

            {/* Filtro por Categoria */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                <SlidersHorizontal size={14} className="text-yellow-400" />
                Categoria:
              </span>
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      active
                        ? "bg-yellow-400/15 border-yellow-400 text-yellow-300"
                        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Exibindo <strong className="text-white">{filteredOffers.length}</strong>{" "}
            {filteredOffers.length === 1 ? "oferta verificada" : "ofertas verificadas"}
            {selectedStore !== "Todas" && (
              <>
                {" "}
                em <strong className="text-yellow-400">{selectedStore}</strong>
              </>
            )}
            {selectedCategory !== "Todas" && (
              <>
                {" "}
                na categoria <strong className="text-yellow-400">{selectedCategory}</strong>
              </>
            )}
          </p>

          {(selectedStore !== "Todas" ||
            selectedCategory !== "Todas" ||
            searchQuery.trim() !== "") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X size={14} />
              Limpar filtros
            </button>
          )}
        </div>

        {/* Grid de Produtos */}
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredOffers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-10 text-center max-w-lg mx-auto my-6">
            <p className="text-lg font-bold text-white mb-2">
              Nenhuma oferta encontrada com esses filtros
            </p>
            <p className="text-sm text-slate-400 mb-5">
              Tente buscar por outro termo ou limpar os filtros selecionados para ver todas as promoções ativas.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              Ver Todas as Ofertas
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
