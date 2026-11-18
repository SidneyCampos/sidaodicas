import React from "react";
import { redirect } from "next/navigation";
import AdminDashboard from "../../components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Painel Admin Local | Sidão Dicas & Ofertas",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  // SEGURANÇA: Bloqueia acesso ao painel em ambiente de produção (Vercel)
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return <AdminDashboard />;
}
