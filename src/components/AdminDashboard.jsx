"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUp,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  PlusCircle,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  TrendingUp,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import {
  calculateDiscountPercentage,
  formatRelativeVerifiedTime,
} from "./ProductCard";
import WhatsAppCreativeStudio, {
  buildInstagramCaption,
  buildViralWhatsAppCopy,
  formatBRLPrice,
} from "./WhatsAppCreativeStudio";

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
  linkAfiliado: "",
  titulo: "",
  subtitulo: "",
  loja: "Amazon",
  categoria: "Mais Vendidos",
  precoAntigo: "",
  precoAtual: "",
  destaqueTag: "OFERTA VERIFICADA",
  cupomOpcional: "",
  nota: "",
  vendidos: "",
  imagemUrl: "",
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

  // Estado do formulário de Oferta & Extração Automática
  const [offerForm, setOfferForm] = useState(INITIAL_OFFER_FORM);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionReport, setExtractionReport] = useState(null);
  const [isSavingOffer, setIsSavingOffer] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const lastExtractedUrlRef = useRef("");

  // Estado do formulário de Cupom + Automação de Cupons
  const [couponForm, setCouponForm] = useState(INITIAL_COUPON_FORM);
  const [showManualCouponForm, setShowManualCouponForm] = useState(false);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [isSyncingCoupons, setIsSyncingCoupons] = useState(false);
  const [affiliateConfig, setAffiliateConfig] = useState({
    Amazon: "https://www.amazon.com.br/deals?tag=sidaodicas-20",
    "Mercado Livre": "https://www.mercadolivre.com.br/social/casi3341967",
    Shopee: "https://shopee.com.br/m/cupons-diarios",
    autoSyncEnabled: true,
    lastAutoSyncAt: null,
  });

  // Estado da lista de Ofertas Ativas & Modal de Kit WhatsApp
  // Estado da lista de Ofertas Ativas (Paginação escalável + Filtro + Kit WhatsApp/Instagram)
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStoreFilter, setAdminStoreFilter] = useState("Todas");
  const [adminVisibleCount, setAdminVisibleCount] = useState(20);
  const [copiedWhatsAppId, setCopiedWhatsAppId] = useState(null);
  const [copiedInstagramId, setCopiedInstagramId] = useState(null);
  const [studioModalOffer, setStudioModalOffer] = useState(null);

  // Estado do Auto Deploy (Git Push / Cloud Sync) & Diagnóstico de Salvamento
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAuditingOffers, setIsAuditingOffers] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);

  const showMessage = (type, text, details = "") => {
    setFeedback({ type, text, details });
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [resOfertas, resCupons, resConfig] = await Promise.all([
        fetch("/api/admin/ofertas"),
        fetch("/api/admin/cupons"),
        fetch("/api/admin/cupons/sync"),
      ]);

      if (resOfertas.status === 401 || resCupons.status === 401) {
        setIsLoggedIn(false);
        return;
      }

      const dataOfertas = await resOfertas.json();
      const dataCupons = await resCupons.json();
      const dataConfig = resConfig.ok ? await resConfig.json() : {};

      if (dataOfertas.storageStatus) setStorageStatus(dataOfertas.storageStatus);
      if (dataOfertas.ofertas) setOfertas(dataOfertas.ofertas);
      if (dataCupons.cupons) setCupons(dataCupons.cupons);
      if (dataConfig.config) setAffiliateConfig(dataConfig.config);
      if (!resOfertas.ok && dataOfertas.error) {
        showMessage("error", dataOfertas.error);
      }
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

  const handleCopyWhatsApp = async (product) => {
    const copyText = buildViralWhatsAppCopy(product);
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

  const handleCopyInstagram = async (product) => {
    const captionText = buildInstagramCaption(product);
    try {
      await navigator.clipboard.writeText(captionText);
      setCopiedInstagramId(product.id);
      setTimeout(() => {
        setCopiedInstagramId((prev) => (prev === product.id ? null : prev));
      }, 3000);
    } catch (err) {
      console.error("Erro ao copiar legenda para Instagram:", err);
    }
  };

  // Extração Automática Completa a partir do Link de Associado
  const runAutoExtraction = async (rawUrl) => {
    const targetUrl = String(rawUrl || "").trim();
    if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
      showMessage(
        "error",
        "Cole um link de associado válido (Amazon, Shopee ou Mercado Livre)."
      );
      return;
    }

    lastExtractedUrlRef.current = targetUrl;
    setIsExtracting(true);
    setExtractionReport(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (response.status === 401) {
        setIsLoggedIn(false);
        return;
      }

      const data = await response.json();

      setOfferForm((prev) => ({
        ...prev,
        linkAfiliado: targetUrl,
        loja: data.loja || prev.loja,
        categoria: data.categoria || prev.categoria,
        titulo: data.titulo || "",
        subtitulo: data.subtitulo || "",
        imagemUrl: data.imagemUrl || "",
        precoAtual:
          data.precoAtual !== null && data.precoAtual !== undefined
            ? String(data.precoAtual)
            : "",
        precoAntigo:
          data.precoAntigo !== null && data.precoAntigo !== undefined
            ? String(data.precoAntigo)
            : "",
        nota: data.nota || "",
        vendidos: data.vendidos || "",
        destaqueTag: data.destaqueTag || "OFERTA VERIFICADA",
      }));
      setImagePreviewError(false);

      setExtractionReport({
        loja: data.loja,
        loadedFields: data.loadedFields || [],
        missingFields: data.missingFields || [],
        warningMessage: data.warningMessage || "",
        success: Boolean(data.success),
      });
    } catch {
      setExtractionReport({
        loja: null,
        loadedFields: [],
        missingFields: [
          "Loja",
          "Título do Produto",
          "URL da Imagem (Foto)",
          "Preço Atual",
          "Preço Antigo",
          "Nota",
          "Qtd. Vendidos",
        ],
        warningMessage:
          "Erro ao conectar com a página do link informado. Preencha os campos manualmente ou verifique se a loja alterou o formato da página.",
        success: false,
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Dispara a extração automaticamente no exato momento em que o usuário cola o link!
  const handleAffiliateUrlPaste = (e) => {
    const pasted = e.clipboardData?.getData("text")?.trim();
    if (pasted && /^https?:\/\//i.test(pasted)) {
      e.preventDefault();
      setOfferForm((prev) => ({ ...prev, linkAfiliado: pasted }));
      runAutoExtraction(pasted);
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
        "Preencha pelo menos o Link de Associado, Título e Preço Atual para publicar."
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
      const savedOffer = data.oferta || offerForm;
      setOfferForm(INITIAL_OFFER_FORM);
      setExtractionReport(null);
      setImagePreviewError(false);

      showMessage(
        "success",
        isEditing
          ? "✅ Oferta atualizada na vitrine com sucesso!"
          : `✅ Oferta "${savedOffer.titulo}" publicada no topo da vitrine! Clique em "🚀 Salvar e Publicar no Site" se quiser forçar o deploy no Git.`
      );
      setActiveTab("ofertas-ativas");
    } catch (error) {
      showMessage("error", error.message || "Falha ao salvar a oferta.");
    } finally {
      setIsSavingOffer(false);
    }
  };

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

  const handleEditOffer = (product) => {
    setOfferForm({
      id: product.id,
      linkAfiliado: product.linkAfiliado || "",
      titulo: product.titulo || "",
      subtitulo: product.subtitulo || "",
      loja: product.loja || "Amazon",
      categoria: product.categoria || "Mais Vendidos",
      precoAntigo: product.precoAntigo ?? "",
      precoAtual: product.precoAtual ?? "",
      destaqueTag: product.destaqueTag || "OFERTA VERIFICADA",
      cupomOpcional: product.cupomOpcional || "",
      nota: product.nota || "",
      vendidos: product.vendidos || "",
      imagemUrl: product.imagemUrl || "",
    });
    setExtractionReport(null);
    setImagePreviewError(false);
    setActiveTab("nova-oferta");
  };

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

  const handleSyncCouponsAuto = async (onlySaveConfig = false) => {
    setIsSyncingCoupons(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/cupons/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: affiliateConfig,
          onlySaveConfig,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao sincronizar cupons.");
      }
      if (data.cupons) setCupons(data.cupons);
      if (data.config) setAffiliateConfig(data.config);
      showMessage("success", data.message);
    } catch (err) {
      showMessage("error", err.message || "Erro na sincronização automática.");
    } finally {
      setIsSyncingCoupons(false);
    }
  };

  const handleAuditOffersNow = async () => {
    setIsAuditingOffers(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/ofertas/sync", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao verificar preços e links.");
      }
      if (data.ofertas) setOfertas(data.ofertas);
      showMessage("success", data.message, data.details || "");
    } catch (err) {
      showMessage(
        "error",
        err.message || "Erro ao verificar preços e links."
      );
    } finally {
      setIsAuditingOffers(false);
    }
  };

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

  useEffect(() => {
    setAdminVisibleCount(20);
  }, [adminSearch, adminStoreFilter]);

  const filteredAdminOffers = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    const list = ofertas.filter((o) => {
      const matchesStore =
        adminStoreFilter === "Todas" ||
        (o.loja && o.loja.toLowerCase() === adminStoreFilter.toLowerCase());
      const matchesSearch =
        !q ||
        (o.titulo && o.titulo.toLowerCase().includes(q)) ||
        (o.loja && o.loja.toLowerCase().includes(q)) ||
        (o.cupomOpcional && o.cupomOpcional.toLowerCase().includes(q));
      return matchesStore && matchesSearch;
    });

    return [...list].sort((a, b) => {
      const timeA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
      const timeB = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [ofertas, adminSearch, adminStoreFilter]);

const visibleAdminOffers = useMemo(() => {
  return filteredAdminOffers.slice(0, adminVisibleCount);
}, [filteredAdminOffers, adminVisibleCount]);

// Verifica se determinado campo falhou na extração para destacar a borda
const isFieldMissing = (keyword) => {
  if (!extractionReport?.missingFields?.length) return false;
  return extractionReport.missingFields.some((f) =>
    f.toLowerCase().includes(keyword.toLowerCase())
  );
};

// =========================================================================
// TELA DE LOGIN COM USUÁRIO E SENHA
// =========================================================================
if (!isLoggedIn) {
  return (
    <div className="min-h-screen bg-[#0b0f14] text-[#f2ede4] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121820]/95 border border-[#e7d7bf]/12 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d89643]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#8c5a22] via-[#e5ad5e] to-[#d89643] shadow-lg mb-3">
            <img
              src="/avatar-sidao.png"
              alt="Sidão Dicas Ofertas"
              className="w-full h-full rounded-full object-cover bg-[#121820]"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#f2ede4] tracking-tight">
            Sidão Dicas <span className="text-[#e5ad5e]">Admin</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8b95a3] mt-1">
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
  <div className="min-h-screen bg-[#0b0f14] text-[#f2ede4] font-sans pb-16">
    {/* Top Bar do Painel Admin */}
    <header className="sticky top-0 z-50 bg-[#0b0f14]/95 backdrop-blur-md border-b border-[#e7d7bf]/[0.08] shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-[#8c5a22] via-[#e5ad5e] to-[#d89643] shrink-0">
              <img
                src="/avatar-sidao.png"
                alt="Sidão Dicas Ofertas"
                className="w-full h-full rounded-full object-cover bg-[#121820]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[#f2ede4] leading-none">
                  Sidão Dicas <span className="text-[#e5ad5e]">Admin</span>
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    storageStatus?.mode === "ephemeral_error"
                      ? "bg-red-950/90 text-red-300 border-red-500/50"
                      : "bg-[#182e24] text-[#7ae0ae] border-[#2f9e75]/35"
                  }`}
                >
                  {storageStatus?.mode === "ephemeral_error"
                    ? "🔴 Falta GITHUB_TOKEN na Vercel"
                    : storageStatus?.mode === "github"
                    ? "🟢 Nuvem GitHub Conectada"
                    : "🟢 Acesso Web Seguro"}
                </span>
              </div>
              <p className="text-[11px] text-[#8b95a3] mt-0.5">
                Cole o link de associado → Carrega tudo + Arte e Texto WhatsApp/Instagram
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
      {/* Aviso Crítico caso o GITHUB_TOKEN ainda não esteja configurado na Vercel */}
      {storageStatus?.mode === "ephemeral_error" && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-red-950/80 border-2 border-red-500/60 text-red-100 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={22} className="text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-2 leading-relaxed">
              <p className="font-black text-red-300 text-sm sm:text-base">
                ⚠️ Ação necessária na Vercel: configure a variável GITHUB_TOKEN para salvar suas ofertas!
              </p>
              <p>
                Na Vercel os arquivos do servidor são <strong>somente leitura</strong>. Sem o{" "}
                <code className="bg-black/40 px-1.5 py-0.5 rounded text-yellow-300 font-mono">
                  GITHUB_TOKEN
                </code>
                , os produtos adicionados aqui não conseguem gravar no repositório e não aparecem no site oficial.
              </p>
              <ol className="list-decimal list-inside space-y-1 text-red-200/95">
                <li>
                  No GitHub, acesse <strong>Settings → Developer settings → Personal access tokens → Fine-grained tokens</strong> e crie um token com permissão <strong>Contents: Read and write</strong> no repositório <strong>{storageStatus.repo}</strong>.
                </li>
                <li>
                  Na <strong>Vercel</strong>, vá em <strong>Settings → Environment Variables</strong>, adicione{" "}
                  <code className="bg-black/40 px-1.5 py-0.5 rounded text-yellow-300 font-mono">
                    GITHUB_TOKEN
                  </code>{" "}
                  com o valor do token.
                </li>
                <li>
                  Clique em <strong>Deployments → Redeploy</strong> na Vercel. Depois disso, todo produto adicionado aqui grava direto na nuvem e aparece no site na hora!
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Banner de Feedback Geral */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-2xl border flex items-start justify-between gap-3 ${feedback.type === "success"
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
          className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${activeTab === "nova-oferta"
            ? "bg-[#FFE600] text-slate-950 border-[#FFE600] shadow-lg shadow-yellow-400/15"
            : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
        >
          <PlusCircle size={17} />
          <span>
            {offerForm.id ? "✏️ Editando Oferta" : "➕ Nova Oferta (Auto)"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cupons")}
          className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${activeTab === "cupons"
            ? "bg-[#FFE600] text-slate-950 border-[#FFE600] shadow-lg shadow-yellow-400/15"
            : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
        >
          <Ticket size={17} />
          <span>🤖 Cupons Automáticos ({cupons.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ofertas-ativas")}
          className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${activeTab === "ofertas-ativas"
            ? "bg-[#FFE600] text-slate-950 border-[#FFE600] shadow-lg shadow-yellow-400/15"
            : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
        >
          <MessageCircle size={17} />
          <span>📋 Ofertas Ativas ({ofertas.length})</span>
        </button>
      </div>

      {/* ===================================================================
            ABA A: ➕ NOVA OFERTA (COLAR LINK -> CARREGA TUDO + KIT WHATSAPP)
        =================================================================== */}
      {activeTab === "nova-oferta" && (
        <div className="space-y-6">
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            {/* PASSO 1: COLAR LINK DE ASSOCIADO (DISPARA AUTOMATICAMENTE) */}
            <div className="bg-gradient-to-r from-slate-950 via-[#0f172a] to-slate-950 border-2 border-[#FFE600]/60 rounded-2xl p-4 sm:p-5 mb-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <label className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#FFE600] flex items-center gap-2">
                  <Link2 size={17} />
                  <span>
                    1. Cole seu Link de Associado (Carrega Tudo Automaticamente!)
                  </span>
                </label>
                <span className="text-[11px] font-bold text-slate-400">
                  Aceita: <strong className="text-[#FF9900]">link.amazon</strong> •{" "}
                  <strong className="text-[#ff6b4a]">s.shopee.com.br</strong> •{" "}
                  <strong className="text-[#FFE600]">meli.la</strong>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="url"
                  required
                  value={offerForm.linkAfiliado}
                  onPaste={handleAffiliateUrlPaste}
                  onChange={(e) =>
                    setOfferForm({
                      ...offerForm,
                      linkAfiliado: e.target.value,
                    })
                  }
                  placeholder="Cole aqui o link (ex: https://link.amazon/... ou https://s.shopee.com.br/... ou https://meli.la/...)"
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white placeholder-slate-500 px-4 py-3 rounded-xl"
                />

                <button
                  type="button"
                  onClick={() => runAutoExtraction(offerForm.linkAfiliado)}
                  disabled={isExtracting || !offerForm.linkAfiliado.trim()}
                  className="bg-[#FFE600] hover:bg-yellow-300 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      <span>Lendo Página...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={17} />
                      <span>🔍 Carregar Dados</span>
                    </>
                  )}
                </button>
              </div>

              {/* DIAGNÓSTICO EXPLÍCITO: O QUE CARREGOU vs O QUE NÃO CARREGOU */}
              {extractionReport && (
                <div className="mt-4 space-y-2.5 pt-3 border-t border-slate-800/90">
                  {/* Campos que carregaram com sucesso */}
                  {extractionReport.loadedFields.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-emerald-400 mr-1 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Carregado automaticamente:
                      </span>
                      {extractionReport.loadedFields.map((field) => (
                        <span
                          key={field}
                          className="text-[11px] font-bold bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full"
                        >
                          ✅ {field}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Aviso claro se QUALQUER dado ou imagem não carregou */}
                  {extractionReport.missingFields.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-950/75 border border-amber-500/50 text-amber-100">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle
                          size={18}
                          className="text-amber-400 shrink-0 mt-0.5"
                        />
                        <div className="text-xs leading-relaxed">
                          <p className="font-black text-amber-300 mb-1">
                            ⚠️ Atenção — O que NÃO carregou automaticamente:
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {extractionReport.missingFields.map((field) => (
                              <span
                                key={field}
                                className="text-[11px] font-extrabold bg-amber-900/80 border border-amber-400/50 text-amber-200 px-2 py-0.5 rounded-md"
                              >
                                ❌ {field}
                              </span>
                            ))}
                          </div>
                          <p className="text-amber-200/90">
                            {extractionReport.warningMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PASSO 2: CONFIRMAR / AJUSTAR DADOS ANTES DE PUBLICAR */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                2. Confirme os Dados da Oferta
              </h2>
              {offerForm.id && (
                <button
                  type="button"
                  onClick={() => {
                    setOfferForm(INITIAL_OFFER_FORM);
                    setExtractionReport(null);
                  }}
                  className="text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              {/* Título + Subtítulo/Benefício (usado no texto do WhatsApp) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    placeholder="Ex: Mini Chapinha e Modelador de Cachos 2 em 1 (Bivolt)"
                    className={`w-full bg-slate-950 border focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl ${isFieldMissing("título") && !offerForm.titulo
                      ? "border-amber-500 ring-1 ring-amber-500/40"
                      : "border-slate-700"
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Frase de Benefício / Resumo (Vai na Copy do WhatsApp ✨)
                  </label>
                  <input
                    type="text"
                    value={offerForm.subtitulo}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        subtitulo: e.target.value,
                      })
                    }
                    placeholder="Ex: Liso ou cacheado com um aparelho só — cabe na bolsa"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              {/* Loja, Categoria e Tag de Destaque */}
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
                      setOfferForm({
                        ...offerForm,
                        categoria: e.target.value,
                      })
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

              {/* Preço Antigo, Preço Atual, Desconto Calculado e Cupom */}
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
                    placeholder="Ex: 119.98"
                    className={`w-full bg-slate-950 border focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl ${isFieldMissing("preço antigo") && !offerForm.precoAntigo
                      ? "border-amber-500/70"
                      : "border-slate-700"
                      }`}
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
                    placeholder="Ex: 20.99"
                    className={`w-full bg-slate-950 border focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl ${isFieldMissing("preço atual") && !offerForm.precoAtual
                      ? "border-amber-500 ring-1 ring-amber-500/40"
                      : "border-slate-700"
                      }`}
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">
                    Desconto:
                  </span>
                  <span
                    className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${previewDiscount > 0
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
                    placeholder="Ex: BLACK10"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-sm font-mono uppercase text-yellow-400 px-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              {/* Prova Social para Arte e Copy (Vendidos + Nota + URL da Imagem) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <div className="md:col-span-9 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5 flex items-center gap-1">
                        <TrendingUp size={13} className="text-[#FFE600]" />
                        Qtd. Vendidos (Faixa da Arte &amp; Copy)
                      </label>
                      <input
                        type="text"
                        value={offerForm.vendidos}
                        onChange={(e) =>
                          setOfferForm({
                            ...offerForm,
                            vendidos: e.target.value,
                          })
                        }
                        placeholder="Ex: +80 mil vendidos"
                        className={`w-full bg-slate-950 border focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl ${isFieldMissing("vendidos") && !offerForm.vendidos
                          ? "border-amber-500/70"
                          : "border-slate-700"
                          }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5 flex items-center gap-1">
                        <Star size={13} className="text-[#FFE600]" />
                        Nota do Produto (Ex: 4,7)
                      </label>
                      <input
                        type="text"
                        value={offerForm.nota}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, nota: e.target.value })
                        }
                        placeholder="Ex: 4,7"
                        className={`w-full bg-slate-950 border focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl ${isFieldMissing("nota") && !offerForm.nota
                          ? "border-amber-500/70"
                          : "border-slate-700"
                          }`}
                      />
                    </div>
                  </div>

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
                      className={`w-full bg-slate-950 border focus:border-[#FFE600] focus:outline-none text-sm text-white px-3.5 py-2.5 rounded-xl ${isFieldMissing("imagem") && !offerForm.imagemUrl
                        ? "border-amber-500 ring-1 ring-amber-500/40"
                        : "border-slate-700"
                        }`}
                    />
                  </div>
                </div>

                {/* Preview rápido da Foto Original */}
                <div className="md:col-span-3 flex flex-col items-center justify-center bg-white rounded-xl h-36 p-2.5 relative overflow-hidden border-2 border-slate-700">
                  {offerForm.imagemUrl && !imagePreviewError ? (
                    <img
                      src={offerForm.imagemUrl}
                      alt="Preview da foto"
                      onError={() => setImagePreviewError(true)}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400 flex flex-col items-center gap-1">
                      <ImageIcon size={24} className="text-slate-300" />
                      <span className="text-[11px] font-bold text-slate-500">
                        {imagePreviewError
                          ? "⚠️ Foto quebrada!"
                          : "Foto do Produto"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão Confirmar e Publicar na Vitrine */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400">
                  Revise a arte e o texto do WhatsApp abaixo e clique para confirmar e publicar na vitrine.
                </p>
                <button
                  type="submit"
                  disabled={isSavingOffer}
                  className="w-full sm:w-auto bg-[#FFE600] hover:bg-yellow-300 text-slate-950 font-black text-sm px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  {isSavingOffer ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>
                        {offerForm.id
                          ? "Confirmar Edição da Oferta"
                          : "✅ Confirmar e Publicar na Vitrine"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* PASSO 3: STUDIO EM TEMPO REAL (IMAGEM PNG + COPY WHATSAPP IGUAL AO PRINT!) */}
          <WhatsAppCreativeStudio offer={offerForm} />
        </div>
      )}

      {/* ===================================================================
            ABA B: 🤖 CUPONS AUTOMÁTICOS (PILOTO AUTOMÁTICO 24H)
        =================================================================== */}
      {activeTab === "cupons" && (
        <div className="space-y-6">
          {/* Painel de Piloto Automático de Cupons */}
          <section className="bg-gradient-to-r from-emerald-950/40 via-[#0f172a] to-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full mb-1.5">
                  <span>● Piloto Automático Ativo</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  🤖 Cupons Atualizados Sozinhos Todo Dia!
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  <strong>Você não precisa procurar nem cadastrar cupons na mão.</strong> Nosso robô busca automaticamente os cupons ativos da Amazon, Mercado Livre e Shopee todos os dias (08h e 16h via GitHub Actions + atualização a cada 2h na página) e coloca os <strong>seus 3 links de afiliado</strong> abaixo em cada cupom.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSyncCouponsAuto(false)}
                disabled={isSyncingCoupons}
                className="bg-[#FFE600] hover:bg-yellow-300 disabled:opacity-60 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 shrink-0 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                {isSyncingCoupons ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Atualizando agora...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    <span>🔄 Forçar Atualização Agora</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-amber-300 mb-1">
                  Seu Link Padrão Amazon
                </label>
                <input
                  type="url"
                  value={affiliateConfig.Amazon || ""}
                  onChange={(e) =>
                    setAffiliateConfig({
                      ...affiliateConfig,
                      Amazon: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-xs text-white px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-yellow-300 mb-1">
                  Seu Link Padrão Mercado Livre
                </label>
                <input
                  type="url"
                  value={affiliateConfig["Mercado Livre"] || ""}
                  onChange={(e) =>
                    setAffiliateConfig({
                      ...affiliateConfig,
                      "Mercado Livre": e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-xs text-white px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-orange-300 mb-1">
                  Seu Link Padrão Shopee
                </label>
                <input
                  type="url"
                  value={affiliateConfig.Shopee || ""}
                  onChange={(e) =>
                    setAffiliateConfig({
                      ...affiliateConfig,
                      Shopee: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-xs text-white px-3 py-2 rounded-xl"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={affiliateConfig.autoSyncEnabled !== false}
                  onChange={(e) =>
                    setAffiliateConfig({
                      ...affiliateConfig,
                      autoSyncEnabled: e.target.checked,
                    })
                  }
                  className="accent-[#FFE600] w-4 h-4"
                />
                <span>Manter cupons atualizados automaticamente no site (todo dia)</span>
              </label>

              <button
                type="button"
                onClick={() => handleSyncCouponsAuto(true)}
                disabled={isSyncingCoupons}
                className="text-xs font-bold text-[#FFE600] hover:underline cursor-pointer"
              >
                Salvar apenas meus links padrão
              </button>
            </div>
          </section>

          {/* Lista Principal de Cupons Ativos no Site */}
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Cupons Ativos no Site ({cupons.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Todos abaixo já apontam automaticamente para o seu link de afiliado da respectiva loja.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowManualCouponForm((prev) => !prev)}
                className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl self-start sm:self-auto cursor-pointer"
              >
                {showManualCouponForm
                  ? "Ocultar formulário manual"
                  : "+ Adicionar cupom manual (opcional)"}
              </button>
            </div>

            {(showManualCouponForm || couponForm.id) && (
              <form
                onSubmit={handleSaveCoupon}
                className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 mb-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#FFE600]">
                    {couponForm.id
                      ? "✏️ Editar Cupom"
                      : "➕ Adicionar Cupom Manual Extra"}
                  </span>
                  {couponForm.id && (
                    <button
                      type="button"
                      onClick={() => setCouponForm(INITIAL_COUPON_FORM)}
                      className="text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={couponForm.loja}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, loja: e.target.value })
                    }
                    className="bg-slate-900 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-xs text-white px-3 py-2.5 rounded-xl"
                  >
                    {STORES.map((loja) => (
                      <option key={loja} value={loja}>
                        {loja}
                      </option>
                    ))}
                  </select>

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
                    placeholder="Código (ex: MELI30)"
                    className="bg-slate-900 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-xs font-mono uppercase text-[#FFE600] px-3 py-2.5 rounded-xl"
                  />

                  <input
                    type="text"
                    value={couponForm.validade}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        validade: e.target.value,
                      })
                    }
                    placeholder="Validade (ex: Ativo hoje)"
                    className="bg-slate-900 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-xs text-white px-3 py-2.5 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    placeholder="Descrição (ex: R$ 30 OFF acima de R$ 299)"
                    className="bg-slate-900 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-xs text-white px-3 py-2.5 rounded-xl"
                  />

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
                    placeholder="Link de afiliado da loja (https://...)"
                    className="bg-slate-900 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-xs text-white px-3 py-2.5 rounded-xl"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingCoupon}
                    className="bg-[#FFE600] hover:bg-yellow-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    {couponForm.id ? "Salvar Alterações" : "Salvar Cupom Manual"}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {cupons.map((cupom) => (
                <div
                  key={cupom.id}
                  className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-black uppercase bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded">
                        {cupom.loja}
                      </span>
                      <code className="text-xs sm:text-sm font-mono font-black text-[#FFE600] bg-slate-900 px-2.5 py-0.5 rounded border border-dashed border-yellow-400/40">
                        {cupom.codigo}
                      </code>
                      {cupom.autoSynced && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          🤖 Automático
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {cupom.validade}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-100">
                      {cupom.descricao}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCouponForm(cupom);
                        setShowManualCouponForm(true);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(cupom.id)}
                      className="bg-red-950/80 hover:bg-red-900/80 border border-red-500/30 text-red-300 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {cupons.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">
                  Nenhum cupom ativo no momento. Clique em &quot;Forçar Atualização Agora&quot; acima!
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ===================================================================
            ABA C: 📋 OFERTAS ATIVAS (GERENCIAR + ARTE & COPY WHATSAPP / INSTA)
        =================================================================== */}
      {activeTab === "ofertas-ativas" && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white">
                📋 Ofertas Ativas na Vitrine ({ofertas.length})
              </h2>
              <p className="text-xs text-slate-400">
                Preços e links indisponíveis são verificados automaticamente todo dia (07h30 e 15h30). Você também pode rodar agora:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAuditOffersNow}
                disabled={isAuditingOffers}
                className="bg-[#d89643] hover:bg-[#e5ad5e] disabled:opacity-60 text-[#0b0f14] text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="Verifica o preço atual de todas as ofertas e exclui links indisponíveis"
              >
                {isAuditingOffers ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Verificando preços...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp size={14} />
                    <span>🔄 Atualizar Preços Agora</span>
                  </>
                )}
              </button>

              <select
                value={adminStoreFilter}
                onChange={(e) => setAdminStoreFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 focus:border-[#FFE600] focus:outline-none text-xs text-white px-3 py-2 rounded-xl"
              >
                <option value="Todas">Todas as Lojas</option>
                {STORES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <div className="relative w-full sm:w-64">
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
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin text-[#FFE600]" />
              <span>Carregando ofertas...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleAdminOffers.map((item, idx) => {
                const discount = calculateDiscountPercentage(
                  item.precoAntigo,
                  item.precoAtual,
                  item.descontoPercentual
                );
                const isWaCopied = copiedWhatsAppId === item.id;
                const isIgCopied = copiedInstagramId === item.id;

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
                              {formatBRLPrice(item.precoAntigo)}
                            </span>
                          )}
                          <span className="text-sm font-black text-[#FFE600]">
                            {formatBRLPrice(item.precoAtual)}
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

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setStudioModalOffer(item)}
                        className="bg-slate-800 hover:bg-slate-700 border border-[#FFE600]/40 text-[#FFE600] text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        title="Abrir gerador de Arte PNG + Texto WhatsApp + Legenda Instagram"
                      >
                        <Sparkles size={14} />
                        <span>🎨 Arte + Textos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyWhatsApp(item)}
                        className={`text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                          isWaCopied
                            ? "bg-emerald-400 text-slate-950"
                            : "bg-[#25D366] hover:bg-[#1fae54] text-slate-950"
                        }`}
                        title="Copiar texto formatado para WhatsApp"
                      >
                        {isWaCopied ? (
                          <>
                            <Check size={14} strokeWidth={3} />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>📲 WhatsApp</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyInstagram(item)}
                        className={`text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                          isIgCopied
                            ? "bg-emerald-400 text-slate-950"
                            : "bg-gradient-to-r from-pink-600 to-amber-500 hover:brightness-110 text-white"
                        }`}
                        title="Copiar legenda formatada para Instagram"
                      >
                        {isIgCopied ? (
                          <>
                            <Check size={14} strokeWidth={3} />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Camera size={13} />
                            <span>📸 Insta</span>
                          </>
                        )}
                      </button>

                      <a
                        href={item.linkAfiliado}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-2.5 py-2 rounded-xl inline-flex items-center gap-1"
                        title="Abrir link de afiliado em nova aba"
                      >
                        <ExternalLink size={13} />
                        <span>Link</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleMoveOfferToTop(item.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-2.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                        title="Mover para o topo da vitrine"
                      >
                        <ArrowUp size={13} className="text-[#FFE600]" />
                        <span>Topo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditOffer(item)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-2.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteOffer(item.id)}
                        className="bg-red-950/80 hover:bg-red-900 border border-red-500/30 text-red-300 text-xs font-bold px-2.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredAdminOffers.length > adminVisibleCount && (
                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setAdminVisibleCount((prev) => prev + 20)}
                    className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      Carregar mais ofertas (+
                      {Math.min(
                        20,
                        filteredAdminOffers.length - adminVisibleCount
                      )}
                      )
                    </span>
                    <ChevronDown size={14} className="text-[#FFE600]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </main>

    {/* Modal do Studio WhatsApp para Ofertas Já Cadastradas */}
    {studioModalOffer && (
      <div
        className="fixed inset-0 z-[90] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="max-w-5xl w-full relative my-auto">
          <button
            type="button"
            onClick={() => setStudioModalOffer(null)}
            className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white flex items-center justify-center shadow-lg cursor-pointer"
            aria-label="Fechar estúdio WhatsApp"
          >
            <X size={18} />
          </button>
          <WhatsAppCreativeStudio offer={studioModalOffer} />
        </div>
      </div>
    )}
  </div>
);
}
