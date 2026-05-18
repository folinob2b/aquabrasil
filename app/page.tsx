import Link from "next/link";
import {
  BookOpen,
  Shuffle,
  CalendarDays,
  MessageSquare,
  ChevronRight,
  Thermometer,
  Droplets,
  Waves,
  Star,
  Users,
  FlaskConical,
} from "lucide-react";
import BubbleBackground from "@/components/BubbleBackground";
import { peixes, dificuldadeLabel, tipoLabel } from "@/data/peixes";

const features = [
  {
    icon: BookOpen,
    title: "Catálogo de Espécies",
    desc: "200+ espécies catalogadas com parâmetros, origem, alimentação e muito mais.",
    href: "/catalogo",
    gradient: "from-blue-500 to-cyan-400",
    bg: "from-blue-900/30 to-blue-950/50",
  },
  {
    icon: Shuffle,
    title: "Compatibilidade",
    desc: "Descubra se seus peixes podem conviver antes de introduzi-los no aquário.",
    href: "/compatibilidade",
    gradient: "from-emerald-500 to-teal-400",
    bg: "from-emerald-900/30 to-emerald-950/50",
  },
  {
    icon: CalendarDays,
    title: "Diário de Parâmetros",
    desc: "Registre pH, temperatura, amônia e mais. Histórico completo do seu aquário.",
    href: "/calendario",
    gradient: "from-violet-500 to-purple-400",
    bg: "from-violet-900/30 to-violet-950/50",
  },
  {
    icon: MessageSquare,
    title: "Fórum da Comunidade",
    desc: "Conecte-se com aquaristas de todo o Brasil. Tire dúvidas e compartilhe.",
    href: "/forum",
    gradient: "from-amber-500 to-orange-400",
    bg: "from-amber-900/30 to-amber-950/50",
  },
];

const stats = [
  { icon: BookOpen, value: "16", label: "Espécies no catálogo" },
  { icon: Users, value: "5.200+", label: "Aquaristas cadastrados" },
  { icon: MessageSquare, value: "12k+", label: "Tópicos no fórum" },
  { icon: FlaskConical, value: "48k+", label: "Parâmetros registrados" },
];

const tips = [
  { icon: Thermometer, title: "Temperatura estável", desc: "Variações bruscas de temperatura causam estresse e doenças. Use termostato de qualidade." },
  { icon: Droplets, title: "Troca parcial semanal", desc: "Troque 20–30% da água semanalmente para remover nitratos acumulados." },
  { icon: FlaskConical, title: "Teste os parâmetros", desc: "Meça pH, amônia, nitrito e nitrato regularmente, especialmente em aquários novos." },
];

export default function HomePage() {
  const destaque = peixes.slice(0, 8);

  return (
    <main className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-950 via-[#041e36] to-ocean-950" />
        <div className="absolute inset-0 underwater-grid opacity-40" />
        <BubbleBackground count={22} />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/8 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            A maior plataforma de aquarismo do Brasil
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
            <span className="text-white">Seu aquário.</span>
            <br />
            <span className="text-gradient">Sua comunidade.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ferramentas profissionais para aquaristas de todos os níveis — do
            nano aquário ao recife. Grátis, em português, feito no Brasil.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/catalogo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-base hover:opacity-90 transition-all hover:scale-[1.02] glow-cyan"
            >
              Explorar Catálogo
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/compatibilidade"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-semibold text-base hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Testar Compatibilidade
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
          <Waves className="w-4 h-4 animate-wave" />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 border-y border-cyan-900/15">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon className="w-5 h-5 text-cyan-500 mx-auto mb-2 opacity-70" />
              <div className="text-3xl font-black text-gradient mb-1">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Tudo que você precisa</h2>
            <p className="section-sub">Ferramentas pensadas para a comunidade aquarista brasileira</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  className={`group relative p-6 rounded-2xl bg-gradient-to-br ${f.bg} border border-white/6 hover:border-cyan-800/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                  <div className="mt-5 flex items-center gap-1 text-cyan-500 text-xs font-semibold group-hover:gap-2 transition-all">
                    Acessar <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DESTAQUE DE PEIXES ── */}
      <section className="py-20 px-4 bg-ocean-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title">Espécies em Destaque</h2>
              <p className="section-sub">Os favoritos da nossa comunidade</p>
            </div>
            <Link
              href="/catalogo"
              className="hidden sm:flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              Ver catálogo completo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {destaque.map((p) => (
              <Link
                key={p.id}
                href={`/catalogo?busca=${encodeURIComponent(p.nome)}`}
                className={`group relative p-5 rounded-2xl bg-gradient-to-br ${p.corCard} border border-white/5 hover:border-cyan-800/30 transition-all hover:-translate-y-0.5`}
              >
                <div className="text-5xl mb-3 group-hover:animate-float">{p.emoji}</div>
                <h3 className="text-white font-bold text-sm leading-tight">{p.nome}</h3>
                <p className="text-slate-500 text-xs mt-0.5 italic">{p.nomeCientifico}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className={`badge ${p.tipo === "agua-doce" ? "tipo-doce" : p.tipo === "agua-salgada" ? "tipo-salgada" : "tipo-fria"}`}>
                    {tipoLabel[p.tipo]}
                  </span>
                  <span className={`badge ${p.dificuldade === "facil" ? "diff-facil" : p.dificuldade === "moderado" ? "diff-moderado" : "diff-dificil"}`}>
                    {dificuldadeLabel[p.dificuldade]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── DICAS RÁPIDAS ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Dicas Rápidas</h2>
            <p className="section-sub">Fundamentos para um aquário saudável</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tips.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-6">
                <Icon className="w-6 h-6 text-cyan-400 mb-4" />
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-800/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-12 text-center">
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
            <BubbleBackground count={10} />
            <div className="relative z-10">
              <Star className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Junte-se à comunidade
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                Mais de 5.000 aquaristas já usam o AquaBrasil. Cadastre-se
                gratuitamente e comece hoje.
              </p>
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-base hover:opacity-90 transition-all hover:scale-[1.02] glow-cyan">
                Criar conta gratuita
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
