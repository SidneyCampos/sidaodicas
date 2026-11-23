"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUp,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  PlusCircle,
  Rocket,
  Search,
  ShieldCheck,
  Ticket,
  Trash2,
  User,
  Wand2,
  Zap,
} from "lucide-react";
import {
  calculateDiscountPercentage,
  formatRelativeVerifiedTime,
} from "./ProductCard";

const STORES = ["Amazon", "Mercado Livre", "Shopee"];
const CATEGORIES = ["Mais Vendidos", "Eletrônicos", "Games", "Casa"];
const HIGHLIGHT_TAGS = [
  "OFERTA VERIFICADA",
  "ESQUENTA BLACK FRIDAY",
  "MAIS VENDIDO",
  "MENOR PREÇO EM 30 DIAS",
];

const INITIAL_OFFER_FORM = {
  id: null,
  urlExtracao: "",
  titulo: "",
  loja: "Amazon",
  categoria: "Mais Vendidos",
  precoAntigo: "",
  precoAtual: "",
  destaqueTag: "OFERTA VERIFICADA",
  cupomOpcional: "",
  imagemUrl: "",
  linkAfiliado: "",
};

const INITIAL_COUPON_FORM = {
  id: null,
  loja: "Amazon",
  codigo: "",
  descricao: "",
  validade: "Ativo agora • Estoque limitado",
  linkAfiliadoLoja: "",
};

export default function AdminDashboard({ initialAuthenticated = false }) {
  // Estado de Autenticação (Usuário e Senha)
  const [isLoggedIn, setIsLoggedIn] = useState(initialAuthenticated);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState("nova-oferta");
  const [ofertas, setOfertas] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado do formulário de Oferta
  const [offerForm, setOfferForm] = useState(INITIAL_OFFER_FORM);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSavingOffer, setIsSavingOffer] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Estado do formulário de Cupom
  const [couponForm, setCouponForm] = useState(INITIAL_COUPON_FORM);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  // Estado da lista de Ofertas Ativas & WhatsApp Copy
  const [adminSearch, setAdminSearch] = useState("");
  const [copiedWhatsAppId, setCopiedWhatsAppId] = useState(null);

  // Estado do Auto Deploy (Git Push / Cloud Sync)
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showMessage = (type, text, details = "") => {
    setFeedback({ type, text, details });
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [resOfertas, resCupons] = await Promise.all([
        fetch("/api/admin/ofertas"),
        fetch("/api/admin/cupons"),
      ]);

      if (resOfertas.status === 401 || resCupons.status === 401) {
        setIsLoggedIn(false);
        return;
      }

      const dataOfertas = await resOfertas.json();
      const dataCupons = await resCupons.json();

      if (dataOfertas.ofertas) setOfertas(dataOfertas.ofertas);
      if (dataCupons.cupons) setCupons(dataCupons.cupons);
    } catch (error) {
      console.error("Erro ao carregar dados no painel admin:", error);
      showMessage("error", "Falha ao carregar as ofertas e cupons.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Usuário ou senha incorretos.");
        return;
      }

      setIsLoggedIn(true);
      setPassword("");
    } catch {
      setLoginError("Erro de conexão ao tentar entrar.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } finally {
      setIsLoggedIn(false);
      setUsername("");
      setPassword("");
    }
  };

  // Cálculo em tempo real da % de desconto no formulário
  const previewDiscount = useMemo(() => {
    return calculateDiscountPercentage(
      offerForm.precoAntigo,
      offerForm.precoAtual,
      0
    );
  }, [offerForm.precoAntigo, offerForm.precoAtual]);

  const formatBRL = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  // Gerador de Copy Persuasiva para WhatsApp
  const generateWhatsAppCopy = (product) => {
    const precoAntigo = Number(product.precoAntigo) || 0;
    const precoAtual = Number(product.precoAtual) || 0;
    const desconto = calculateDiscountPercentage(
      precoAntigo,
      precoAtual,
      product.descontoPercentual
    );

    const storeEmoji =
      product.loja === "Amazon"
        ? "📦"
        : product.loja === "Mercado Livre"
        ? "🤝"
        : "🛍️";

    const lines = [
      `🔥 *${product.destaqueTag || "OFERTA VERIFICADA"}* ${storeEmoji} *${
        product.loja
      }*`,
      ``,
      `📌 *${product.titulo}*`,
      ``,
    ];

    if (precoAntigo > precoAtual) {
      lines.push(
        `❌ De: ~${formatBRL(precoAntigo)}~`,
        `✅ *Por apenas: ${formatBRL(precoAtual)}* ${
          desconto > 0 ? `(_-${desconto}% OFF_)` : ""
        }`
      );
    } else {
      lines.push(`✅ *Por apenas: ${formatBRL(precoAtual)}*`);
    }

    if (product.cupomOpcional) {
      lines.push(`🎟️ Use o cupom: *${product.cupomOpcional}*`);
    }

    lines.push(
      ``,
      `🛒 *Compre direto na loja oficial:*`,
      `${product.linkAfiliado}`,
      ``,
      `⚡ _Preços e estoque sujeitos a alteração a qualquer momento!_`
    );

    return lines.join("\n");
  };

  const handleCopyWhatsApp = async (product) => {
    const copyText = generateWhatsAppCopy(product);
    try {
      await navigator.clipboard.writeText(copyText);
      setCopiedWhatsAppId(product.id);
      setTimeout(() => {
        setCopiedWhatsAppId((prev) => (prev === product.id ? null : prev));
      }, 3000);
    } catch (err) {
      console.error("Erro ao copiar texto para WhatsApp:", err);
    }
  };

  // Extrair Título e Foto da URL
  const handleExtractFromUrl = async () => {
    const targetUrl = offerForm.urlExtracao.trim();
    if (!targetUrl) {
      showMessage("error", "Cole a URL original do produto antes de extrair.");
      return;
    }

    setIsExtracting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await response.json();

      setOfferForm((prev) => ({
        ...prev,
        titulo: data.titulo || prev.titulo,
        imagemUrl: data.imagemUrl || prev.imagemUrl,
        loja: data.loja || prev.loja,
        precoAtual:
          data.precoSugerido && !prev.precoAtual
            ? String(data.precoSugerido)
            : prev.precoAtual,
        linkAfiliado: prev.linkAfiliado || targetUrl,
      }));
      setImagePreviewError(false);

      if (data.success) {
        showMessage(
          "success",
          "✨ Dados extraídos da URL! Confira o título, a foto e preencha os preços."
        );
      } else {
        showMessage(
          "warning",
          data.error ||
            "Não foi possível extrair todos os campos automaticamente. Complete manualmente abaixo."
        );
      }
    } catch {
      showMessage(
        "warning",
        "Não foi possível acessar a URL informada. Preencha os campos manualmente."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // Salvar Nova Oferta ou Editar Oferta Existente
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (
      !offerForm.titulo.trim() ||
      !offerForm.precoAtual ||
      !offerForm.linkAfiliado.trim()
    ) {
      showMessage(
        "error",
        "Preencha pelo menos o Título, Preço Atual e Link de Afiliado."
      );
      return;
    }

    setIsSavingOffer(true);
    setFeedback(null);
    try {
      const isEditing = Boolean(offerForm.id);
      const response = await fetch("/api/admin/ofertas", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar oferta");
      }

      setOfertas(data.ofertas || []);
      setOfferForm(INITIAL_OFFER_FORM);
      setImagePreviewError(false);

      showMessage(
        "success",
        isEditing
          ? "✅ Oferta atualizada com sucesso!"
          : "✅ Nova oferta cadastrada no topo da vitrine!"
      );
      setActiveTab("ofertas-ativas");
    } catch (error) {
      showMessage("error", error.message || "Falha ao salvar a oferta.");
    } finally {
      setIsSavingOffer(false);
    }
  };

  // Mover Oferta para o Topo
  const handleMoveOfferToTop = async (id) => {
    try {
      const response = await fetch("/api/admin/ofertas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "move_to_top", id }),
      });
      const data = await response.json();
      if (data.ofertas) {
        setOfertas(data.ofertas);
        showMessage(
          "success",
          "⬆️ Oferta movida para o topo e marcada como 'Verificado agora'!"
        );
      }
    } catch {
      showMessage("error", "Falha ao mover oferta para o topo.");
    }
  };

  // Excluir Oferta
  const handleDeleteOffer = async (id) => {
    try {
      const response = await fetch(`/api/admin/ofertas?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.ofertas) {
        setOfertas(data.ofertas);
        showMessage("success", "🗑️ Oferta removida com sucesso.");
      }
    } catch {
      showMessage("error", "Falha ao excluir oferta.");
    }
  };

  // Carregar Oferta para Edição
  const handleEditOffer = (product) => {
    setOfferForm({
      id: product.id,
      urlExtracao: "",
      titulo: product.titulo || "",
      loja: product.loja || "Amazon",
      categoria: product.categoria || "Mais Vendidos",
      precoAntigo: product.precoAntigo ?? "",
      precoAtual: product.precoAtual ?? "",
      destaqueTag: product.destaqueTag || "OFERTA VERIFICADA",
      cupomOpcional: product.cupomOpcional || "",
      imagemUrl: product.imagemUrl || "",
      linkAfiliado: product.linkAfiliado || "",
    });
    setImagePreviewError(false);
    setActiveTab("nova-oferta");
  };

  // Salvar ou Editar Cupom
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.codigo.trim() || !couponForm.descricao.trim()) {
      showMessage("error", "Informe o Código e a Descrição do cupom.");
      return;
    }

    setIsSavingCoupon(true);
    setFeedback(null);
    try {
      const isEditing = Boolean(couponForm.id);
      const response = await fetch("/api/admin/cupons", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(couponForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar cupom");
      }

      setCupons(data.cupons || []);
      setCouponForm(INITIAL_COUPON_FORM);
      showMessage(
        "success",
        isEditing
          ? "✅ Cupom atualizado com sucesso!"
          : "✅ Novo cupom adicionado com sucesso!"
      );
    } catch (error) {
      showMessage("error", error.message || "Falha ao salvar cupom.");
    } finally {
      setIsSavingCoupon(false);
    }
  };

  // Excluir Cupom
  const handleDeleteCoupon = async (id) => {
    try {
      const response = await fetch(`/api/admin/cupons?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.cupons) {
        setCupons(data.cupons);
        showMessage("success", "🗑️ Cupom excluído com sucesso.");
      }
    } catch {
      showMessage("error", "Falha ao remover cupom.");
    }
  };

  // Publicação Automática (Cloud Sync / Auto Git Push)
  const handlePublishToSite = async () => {
    setIsPublishing(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/publish", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        showMessage("success", data.message, data.details);
      } else {
        showMessage(
          "error",
          data.error || "Erro ao executar o deploy automático.",
          data.details
        );
      }
    } catch {
      showMessage(
        "error",
        "Erro de comunicação ao tentar executar o Auto Deploy."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredAdminOffers = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    const list = !q
      ? ofertas
      : ofertas.filter(
          (o) =>
            (o.titulo && o.titulo.toLowerCase().includes(q)) ||
            (o.loja && o.loja.toLowerCase().includes(q)) ||
            (o.cupomOpcional && o.cupomOpcional.toLowerCase().includes(q))
        );

    return [...list].sort((a, b) => {
      const timeA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
      const timeB = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [ofertas, adminSearch]);

  // =========================================================================
  // TELA DE LOGIN COM USUÁRIO E SENHA (ACESSÍVEL DE QUALQUER COMPUTADOR)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#080d1a] text-white font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FFE600]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#FFE600] text-slate-950 flex items-center justify-center font-black shadow-lg shadow-yellow-500/20 mb-3">
              <Zap size={30} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Sidão Dicas <span className="text-[#FFE600]">Admin</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Entre com seu usuário e senha para gerenciar ofertas de qualquer computador.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-bold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Usuário
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white pl-10 pr-4 py-3 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white pl-10 pr-10 py-3 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label="Mostrar ou ocultar senha"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#FFE600] hover:bg-yellow-300 disabled:opacity-60 text-slate-950 font-black text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/15 transition-all active:scale-95 cursor-pointer mt-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Lock size={17} />
                  <span>Entrar no Painel Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck size={14} /> Sessão Criptografada
            </span>
            <a href="/" className="hover:text-[#FFE600] font-bold">
              ← Voltar para a Vitrine
            </a>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAINEL ADMIN AUTENTICADO
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#080d1a] text-white font-sans pb-16">
      {/* Top Bar do Painel Admin com Botão de Auto Deploy e Logout */}
      <header className="sticky top-0 z-50 bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFE600] text-slate-950 flex items-center justify-center font-black shadow">
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white leading-none">
                    Sidão Dicas <span className="text-[#FFE600]">Admin</span>
                  </h1>
                  <span className="text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    🌐 Acesso Web Seguro
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gerenciador Remoto de Ofertas &amp; Cupons
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:hidden">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-300 hover:text-[#FFE600] inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg"
              >
                <span>Site</span>
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-bold text-red-300 bg-red-950/60 border border-red-500/30 px-2.5 py-1.5 rounded-lg"
                title="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-xl transition-colors"
            >
              <span>Ver Vitrine</span>
              <ExternalLink size={14} />
            </a>

            <button
              type="button"
              onClick={handlePublishToSite}
              disabled={isPublishing}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-[#FFE600] via-amber-400 to-[#FF9900] hover:brightness-105 disabled:opacity-60 text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <Rocket size={17} />
                  <span>🚀 Salvar e Publicar no Site (Auto Deploy)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-red-300 bg-slate-900 hover:bg-red-950/50 border border-slate-700 hover:border-red-500/40 px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
              title="Encerrar sessão neste computador"
            >
              <LogOut size={15} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        {/* Banner de Feedback / Status do Deploy */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-start justify-between gap-3 ${
              feedback.type === "success"
                ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-200"
                : feedback.type === "warning"
                ? "bg-amber-950/70 border-amber-500/40 text-amber-200"
                : "bg-red-950/70 border-red-500/40 text-red-200"
            }`}
          >
            <div className="text-xs sm:text-sm leading-relaxed">
              <p className="font-bold">{feedback.text}</p>
              {feedback.details && (
                <pre className="mt-2 p-2.5 rounded-lg bg-slate-950/80 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  {feedback.details}
                </pre>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs font-bold opacity-75 hover:opacity-100 px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navegação das 3 Abas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("nova-oferta")}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              activeTab === "nova-oferta"
                ? "bg-[#FFE600] text-slate-950 border-[#FFE600] shadow-lg shadow-yellow-400/15"
                : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
          >
            <PlusCircle size={17} />
            <span>
              {offerForm.id ? "✏️ Editando Oferta" : "➕ Nova Oferta"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cupons")}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              activeTab === "cupons"
                ? "bg-[#FFE600] text-slate-950 border-[#FFE600] shadow-lg shadow-yellow-400/15"
                : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
          >
            <Ticket size={17} />
            <span>🎟️ Gerenciar Cupons ({cupons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ofertas-ativas")}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              activeTab === "ofertas-ativas"
                ? "bg-[#FFE600] text-slate-950 border-[#FFE600] shadow-lg shadow-yellow-400/15"
                : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
          >
            <MessageCircle size={17} />
            <span>📋 Ofertas Ativas ({ofertas.length})</span>
          </button>
        </div>

        {/* ===================================================================
            ABA A: ➕ NOVA OFERTA
        =================================================================== */}
        {activeTab === "nova-oferta" && (
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-6 border-b border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {offerForm.id
                    ? "✏️ Editar Oferta Existente"
                    : "➕ Cadastrar Nova Oferta"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cole o link para extrair título e foto ou preencha os campos abaixo. A porcentagem de desconto é calculada sozinha!
                </p>
              </div>

              {offerForm.id && (
                <button
                  type="button"
                  onClick={() => setOfferForm(INITIAL_OFFER_FORM)}
                  className="text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl self-start sm:self-auto"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            {/* Extrator Automático de Título e Foto via OpenGraph */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#FFE600] mb-2">
                ⚡ Extrator Rápido de Produto (Opcional)
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="url"
                  value={offerForm.urlExtracao}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, urlExtracao: e.target.value })
                  }
                  placeholder="Cole aqui a URL original do produto (Amazon, Mercado Livre ou Shopee)..."
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleExtractFromUrl}
                  disabled={isExtracting}
                  className="bg-slate-800 hover:bg-slate-700 border border-yellow-400/40 text-[#FFE600] font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Extraindo...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} />
                      <span>🔍 Tentar Extrair Título e Foto</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Formulário Principal da Oferta */}
            <form onSubmit={handleSaveOffer} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Título do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={offerForm.titulo}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, titulo: e.target.value })
                  }
                  placeholder="Ex: Smart TV 55” 4K UHD LED Samsung Crystal Gaming Hub"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Loja Oficial *
                  </label>
                  <select
                    value={offerForm.loja}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, loja: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                  >
                    {STORES.map((loja) => (
                      <option key={loja} value={loja}>
                        {loja}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Categoria *
                  </label>
                  <select
                    value={offerForm.categoria}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, categoria: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Tag de Destaque *
                  </label>
                  <select
                    value={offerForm.destaqueTag}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        destaqueTag: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                  >
                    {HIGHLIGHT_TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Preço Antigo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={offerForm.precoAntigo}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        precoAntigo: e.target.value,
                      })
                    }
                    placeholder="Ex: 3399.00"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Preço Atual (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={offerForm.precoAtual}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        precoAtual: e.target.value,
                      })
                    }
                    placeholder="Ex: 2299.00"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">
                    Desconto:
                  </span>
                  <span
                    className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                      previewDiscount > 0
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    -{previewDiscount}% OFF
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Cupom Opcional
                  </label>
                  <input
                    type="text"
                    value={offerForm.cupomOpcional}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        cupomOpcional: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Ex: BLACK10 (ou vazio)"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm font-mono uppercase text-yellow-400 px-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      URL da Imagem do Produto *
                    </label>
                    <input
                      type="url"
                      required
                      value={offerForm.imagemUrl}
                      onChange={(e) => {
                        setOfferForm({
                          ...offerForm,
                          imagemUrl: e.target.value,
                        });
                        setImagePreviewError(false);
                      }}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      Seu Link de Afiliado *
                    </label>
                    <input
                      type="url"
                      required
                      value={offerForm.linkAfiliado}
                      onChange={(e) =>
                        setOfferForm({
                          ...offerForm,
                          linkAfiliado: e.target.value,
                        })
                      }
                      placeholder="Cole seu link de afiliado da Amazon, Mercado Livre ou Shopee..."
                      className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-white rounded-xl h-40 p-3 relative overflow-hidden border-2 border-slate-700">
                  {offerForm.imagemUrl && !imagePreviewError ? (
                    <img
                      src={offerForm.imagemUrl}
                      alt="Preview do produto"
                      onError={() => setImagePreviewError(true)}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400 flex flex-col items-center gap-1.5">
                      <ImageIcon size={28} className="text-slate-300" />
                      <span className="text-xs font-bold text-slate-500">
                        {imagePreviewError
                          ? "⚠️ Imagem quebrada ou bloqueada"
                          : "Preview da Foto"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingOffer}
                  className="w-full sm:w-auto bg-[#FFE600] hover:bg-yellow-300 text-slate-950 font-black text-sm px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  {isSavingOffer ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      <span>
                        {offerForm.id
                          ? "Salvar Alterações da Oferta"
                          : "Adicionar Oferta na Vitrine"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ===================================================================
            ABA B: 🎟️ GERENCIAR CUPONS
        =================================================================== */}
        {activeTab === "cupons" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl self-start">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {couponForm.id ? "✏️ Editar Cupom" : "🎟️ Novo Cupom Ativo"}
                </h2>
                {couponForm.id && (
                  <button
                    type="button"
                    onClick={() => setCouponForm(INITIAL_COUPON_FORM)}
                    className="text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Loja *
                  </label>
                  <select
                    value={couponForm.loja}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, loja: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                  >
                    {STORES.map((loja) => (
                      <option key={loja} value={loja}>
                        {loja}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Código do Cupom *
                  </label>
                  <input
                    type="text"
                    required
                    value={couponForm.codigo}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        codigo: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Ex: MELI30"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm font-mono uppercase text-[#FFE600] px-3.5 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Descrição do Benefício *
                  </label>
                  <input
                    type="text"
                    required
                    value={couponForm.descricao}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        descricao: e.target.value,
                      })
                    }
                    placeholder="Ex: R$ 30 OFF em compras acima de R$ 299"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Texto de Validade
                  </label>
                  <input
                    type="text"
                    value={couponForm.validade}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        validade: e.target.value,
                      })
                    }
                    placeholder="Ex: Válido hoje • Estoque limitado"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Link de Afiliado da Loja *
                  </label>
                  <input
                    type="url"
                    required
                    value={couponForm.linkAfiliadoLoja}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        linkAfiliadoLoja: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingCoupon}
                  className="w-full bg-[#FFE600] hover:bg-yellow-300 text-slate-950 font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Ticket size={17} />
                  <span>
                    {couponForm.id ? "Atualizar Cupom" : "Adicionar Cupom"}
                  </span>
                </button>
              </form>
            </section>

            <section className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h2 className="text-base sm:text-lg font-black text-white mb-4 pb-3 border-b border-slate-800">
                Cupons Cadastrados ({cupons.length})
              </h2>

              <div className="space-y-3">
                {cupons.map((cupom) => (
                  <div
                    key={cupom.id}
                    className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black uppercase bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded">
                          {cupom.loja}
                        </span>
                        <code className="text-sm font-mono font-black text-[#FFE600] bg-slate-900 px-2.5 py-0.5 rounded border border-dashed border-yellow-400/40">
                          {cupom.codigo}
                        </code>
                        <span className="text-[11px] text-slate-400">
                          {cupom.validade}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-100">
                        {cupom.descricao}
                      </p>
                      <a
                        href={cupom.linkAfiliadoLoja}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-slate-400 hover:text-yellow-400 truncate block max-w-md mt-0.5"
                      >
                        {cupom.linkAfiliadoLoja}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCouponForm(cupom)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={14} />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(cupom.id)}
                        className="bg-red-950/80 hover:bg-red-900/80 border border-red-500/30 text-red-300 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}

                {cupons.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">
                    Nenhum cupom ativo no momento.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ===================================================================
            ABA C: 📋 OFERTAS ATIVAS (GERENCIAR + COPIAR PARA WHATSAPP)
        =================================================================== */}
        {activeTab === "ofertas-ativas" && (
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white">
                  📋 Ofertas Ativas na Vitrine ({ofertas.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Copie o texto formatado para o Grupo VIP do WhatsApp, mova ofertas para o topo ou exclua promoções encerradas.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Filtrar ofertas cadastradas..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-xs text-white pl-8 pr-3 py-2 rounded-xl"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin text-[#FFE600]" />
                <span>Carregando ofertas...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAdminOffers.map((item, idx) => {
                  const discount = calculateDiscountPercentage(
                    item.precoAntigo,
                    item.precoAtual,
                    item.descontoPercentual
                  );
                  const isCopied = copiedWhatsAppId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                          <img
                            src={item.imagemUrl}
                            alt={item.titulo}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-black uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] font-black uppercase bg-yellow-400/15 text-[#FFE600] px-2 py-0.5 rounded">
                              {item.loja}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                              {item.categoria}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              •{" "}
                              {formatRelativeVerifiedTime(
                                item.criadoEm,
                                item.verificadoEm
                              )}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white truncate">
                            {item.titulo}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {Number(item.precoAntigo) >
                              Number(item.precoAtual) && (
                              <span className="text-xs text-slate-500 line-through">
                                {formatBRL(item.precoAntigo)}
                              </span>
                            )}
                            <span className="text-sm font-black text-[#FFE600]">
                              {formatBRL(item.precoAtual)}
                            </span>
                            {discount > 0 && (
                              <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.2 rounded">
                                -{discount}% OFF
                              </span>
                            )}
                            {item.cupomOpcional && (
                              <span className="text-[11px] font-mono font-bold text-yellow-300 bg-yellow-400/10 border border-dashed border-yellow-400/40 px-2 py-0.2 rounded">
                                🎟️ {item.cupomOpcional}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyWhatsApp(item)}
                          className={`text-xs font-black px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                            isCopied
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-[#25D366] hover:bg-[#1fae54] text-slate-950 shadow-md shadow-green-950/30"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check size={14} strokeWidth={3} />
                              <span>✅ Copy Copiada!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>📲 Copiar Copy WhatsApp</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMoveOfferToTop(item.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
                          title="Mover para o topo da vitrine"
                        >
                          <ArrowUp size={14} className="text-[#FFE600]" />
                          <span>⬆️ Mover para o Topo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditOffer(item)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={14} />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteOffer(item.id)}
                          className="bg-red-950/80 hover:bg-red-900 border border-red-500/30 text-red-300 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={14} />
                          <span>🗑️ Excluir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
