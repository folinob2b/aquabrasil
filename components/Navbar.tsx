"use client";
import React from "react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Waves, Menu, X, BookOpen, Shuffle, CalendarDays, MessageSquare, GraduationCap, Leaf, LogOut, User, Globe2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

const links: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; wip?: boolean }[] = [
  { href: "/catalogo",        label: "Catálogo",             icon: BookOpen },
  { href: "/compatibilidade", label: "Compatibilidade",      icon: Shuffle },
  { href: "/calendario",      label: "Diário do Aquário",    icon: CalendarDays },
  { href: "/origens",         label: "Origens",              icon: Globe2 },
  { href: "/educacao",        label: "Educação",             icon: GraduationCap },
  { href: "/aquascape",       label: "Aquascape",            icon: Leaf,          wip: true },
  { href: "/forum",           label: "Fórum",                icon: MessageSquare, wip: true },
];

type ModalMode = "login" | "cadastro" | null;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 h-14 bg-ocean-950/90 backdrop-blur-xl border-b border-cyan-900/20 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Waves className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-black tracking-tight">
            <span className="text-gradient">Aqua</span><span className="text-white">Brasil</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile overlay ─────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-56 bg-ocean-950 border-r border-cyan-900/20 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-cyan-900/15">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight">
              <span className="text-gradient">Aqua</span>
              <span className="text-white">Brasil</span>
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {links.map(({ href, label, icon: Icon, wip }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-cyan-400" : ""}`} />
                {label}
                {wip && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/25">WIP</span>}
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="px-3 pb-5 pt-4 border-t border-cyan-900/15 flex flex-col gap-2">
          {loading ? (
            <div className="h-9 rounded-xl bg-white/5 animate-pulse" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm text-slate-200 font-medium truncate">{displayName}</span>
              </div>
              <button
                onClick={signOut}
                className="w-full py-2 rounded-xl text-sm font-medium text-slate-400 border border-slate-700/60 hover:border-slate-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setModal("login")}
                className="w-full py-2 rounded-xl text-sm font-medium text-slate-300 border border-slate-700/60 hover:border-slate-500 hover:text-white transition-all"
              >
                Entrar
              </button>
              <button
                onClick={() => setModal("cadastro")}
                className="w-full py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 transition-all glow-cyan"
              >
                Cadastrar
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── Modal ──────────────────────────────────────────── */}
      {modal && (
        <AuthModal initialMode={modal} onClose={() => setModal(null)} />
      )}
    </>
  );
}
