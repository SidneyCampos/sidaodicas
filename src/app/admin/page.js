import React from "react";
import AdminDashboard from "../../components/AdminDashboard";
import { isAuthenticated } from "../../lib/adminAuth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Painel Admin | Sidão Dicas & Ofertas",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const authenticated = await isAuthenticated();

  return <AdminDashboard initialAuthenticated={authenticated} />;
}
