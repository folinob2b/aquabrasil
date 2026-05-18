"use client";
import { useState } from "react";
import { X, Waves, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Mode = "login" | "cadastro";

type Props = {
  initialMode?: Mode;
  onClose: () => void;
};

export default function AuthModal({ initialMode = "login", onClose }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(traduzirErro(error));
      } else {
        onClose();
      }
    } else {
      if (name.trim().length < 2) {
        setError("Informe seu nome completo.");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(traduzirErro(error));
      } else {
        setSuccess("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
      }
    }
    setLoading(false);
  }

  function trocarModo(m: Mode) {
    setMode(m);
    setError(null);
    setSuccess(null);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-ocean-950 border border-cyan-900/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight">
              <span className="text-gradient">Aqua</span>
              <span className="text-white">Brasil</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 mb-5 bg-white/5 rounded-xl p-1">
          {(["login", "cadastro"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => trocarModo(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                mode === m
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-3">
          {mode === "cadastro" && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-700/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-700/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "cadastro" ? "Mínimo 6 caracteres" : "••••••••"}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/5 border border-slate-700/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 transition-all glow-cyan disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>

          {mode === "login" && (
            <p className="text-center text-xs text-slate-500">
              Não tem conta?{" "}
              <button
                type="button"
                onClick={() => trocarModo("cadastro")}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Cadastre-se grátis
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function traduzirErro(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (msg.includes("User already registered")) return "Este e-mail já está cadastrado.";
  if (msg.includes("Password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
  if (msg.includes("Unable to validate email")) return "E-mail inválido.";
  return msg;
}
