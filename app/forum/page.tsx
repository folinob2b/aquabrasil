import Link from "next/link";
import {
  MessageSquare,
  Eye,
  ThumbsUp,
  Pin,
  Flame,
  Clock,
  ChevronRight,
  Tag,
} from "lucide-react";
import BubbleBackground from "@/components/BubbleBackground";

const categorias = [
  { id: "geral", label: "Geral", icon: "💬", desc: "Discussões gerais sobre aquarismo", posts: 3241 },
  { id: "peixes", label: "Peixes", icon: "🐠", desc: "Espécies, comportamento e cuidados", posts: 2108 },
  { id: "plantas", label: "Plantas Aquáticas", icon: "🌿", desc: "Plantado, CO₂ e fertilizantes", posts: 987 },
  { id: "equipamentos", label: "Equipamentos", icon: "⚙️", desc: "Filtros, iluminação, aquecedores", posts: 1543 },
  { id: "doencas", label: "Doenças & Tratamentos", icon: "🩺", desc: "Diagnóstico e tratamento", posts: 672 },
  { id: "iniciantes", label: "Cantinho do Iniciante", icon: "🌱", desc: "Sem julgamentos — todas as dúvidas", posts: 2890 },
];

const topicos = [
  {
    id: 1,
    pinned: true,
    categoria: "iniciantes",
    titulo: "Guia completo: ciclagem do aquário para iniciantes",
    autor: "AquaGuru_BR",
    avatar: "🧑‍🔬",
    data: "há 2 dias",
    respostas: 48,
    views: 3240,
    likes: 187,
    tag: "Tutorial",
    tagColor: "bg-blue-500/15 text-blue-300",
  },
  {
    id: 2,
    pinned: false,
    categoria: "peixes",
    titulo: "Meu Discus está com pontos brancos — o que pode ser?",
    autor: "Carlos_Aqua",
    avatar: "🧑",
    data: "há 3 horas",
    respostas: 12,
    views: 421,
    likes: 8,
    tag: "Dúvida",
    tagColor: "bg-amber-500/15 text-amber-300",
    hot: true,
  },
  {
    id: 3,
    pinned: false,
    categoria: "plantas",
    titulo: "Setup plantado: usando CO₂ injetado pela primeira vez — dicas?",
    autor: "GreenTank_SP",
    avatar: "👩",
    data: "há 1 dia",
    respostas: 31,
    views: 1082,
    likes: 54,
    tag: "Discussão",
    tagColor: "bg-emerald-500/15 text-emerald-300",
  },
  {
    id: 4,
    pinned: false,
    categoria: "equipamentos",
    titulo: "Comparativo: filtros canister 2024 — qual vale mais a pena?",
    autor: "Filtros_BR",
    avatar: "🧑‍💻",
    data: "há 4 dias",
    respostas: 67,
    views: 4891,
    likes: 230,
    tag: "Review",
    tagColor: "bg-violet-500/15 text-violet-300",
    hot: true,
  },
  {
    id: 5,
    pinned: false,
    categoria: "geral",
    titulo: "Showcase: meu aquário plantado de 200L — 6 meses de evolução",
    autor: "PlantadoRS",
    avatar: "🌳",
    data: "há 6 horas",
    respostas: 24,
    views: 892,
    likes: 115,
    tag: "Showcase",
    tagColor: "bg-cyan-500/15 text-cyan-300",
  },
  {
    id: 6,
    pinned: false,
    categoria: "doencas",
    titulo: "Tratamento com sal para Ich: dosagem correta",
    autor: "VetAqua",
    avatar: "🩺",
    data: "há 2 semanas",
    respostas: 89,
    views: 6234,
    likes: 312,
    tag: "Tutorial",
    tagColor: "bg-blue-500/15 text-blue-300",
  },
  {
    id: 7,
    pinned: false,
    categoria: "iniciantes",
    titulo: "Quanto tempo esperar antes de colocar peixes? Ciclo do nitrogênio",
    autor: "Novo_Aquarista",
    avatar: "🧑",
    data: "há 5 horas",
    respostas: 18,
    views: 567,
    likes: 22,
    tag: "Dúvida",
    tagColor: "bg-amber-500/15 text-amber-300",
  },
  {
    id: 8,
    pinned: false,
    categoria: "peixes",
    titulo: "Guppy ou Espada para aquário comunitário de 60L?",
    autor: "Ana_Aqua",
    avatar: "👩",
    data: "há 12 horas",
    respostas: 9,
    views: 334,
    likes: 14,
    tag: "Discussão",
    tagColor: "bg-emerald-500/15 text-emerald-300",
  },
];

export default function ForumPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative py-12 px-6 sm:px-8 overflow-hidden border-b border-cyan-900/15">
        <div className="absolute inset-0 bg-gradient-to-b from-[#041e36]/60 to-ocean-950" />
        <BubbleBackground count={10} />
        <div className="relative z-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
              Fórum da <span className="text-gradient">Comunidade</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Conecte-se com aquaristas de todo o Brasil
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90 transition-all glow-cyan">
            <MessageSquare className="w-4 h-4" />
            Novo tópico
          </button>
        </div>
      </section>

      <section className="px-6 sm:px-8 py-10">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div>
            {/* Categories */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
              {categorias.map((c) => (
                <button
                  key={c.id}
                  className="group flex items-start gap-3 p-4 rounded-2xl glass border border-cyan-900/15 hover:border-cyan-800/30 text-left transition-all hover:-translate-y-0.5"
                >
                  <span className="text-2xl">{c.icon}</span>
                  <div className="min-w-0">
                    <div className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-colors">
                      {c.label}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5 truncate">{c.desc}</div>
                    <div className="text-cyan-600 text-xs mt-1.5">{c.posts.toLocaleString("pt-BR")} posts</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Topics */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-xl">Tópicos Recentes</h2>
              <div className="flex gap-2">
                {["Recentes", "Populares", "Sem resposta"].map((f, i) => (
                  <button
                    key={f}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      i === 0
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {topicos.map((t) => (
                <div
                  key={t.id}
                  className="group relative flex gap-4 p-4 rounded-2xl glass border border-cyan-900/12 hover:border-cyan-800/25 transition-all cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-800/50 to-blue-900/50 flex items-center justify-center text-xl flex-shrink-0 border border-cyan-900/30">
                    {t.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap mb-1.5">
                      {t.pinned && (
                        <Pin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      )}
                      {t.hot && (
                        <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`badge ${t.tagColor}`}>
                        {t.tag}
                      </span>
                      <span className="badge bg-slate-700/30 text-slate-500 border-slate-700/30 text-xs">
                        {categorias.find((c) => c.id === t.categoria)?.label}
                      </span>
                    </div>

                    <h3 className="text-slate-200 font-semibold text-sm leading-snug group-hover:text-white transition-colors mb-1.5 line-clamp-2">
                      {t.titulo}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-medium text-slate-400">{t.autor}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.data}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex flex-col items-end gap-1.5 text-xs text-slate-500 flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {t.respostas}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {t.views.toLocaleString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {t.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 rounded-2xl glass border border-cyan-900/20 text-slate-400 hover:text-slate-200 text-sm font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              Carregar mais tópicos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="glass rounded-2xl p-5 border border-cyan-900/15">
              <h3 className="text-white font-bold text-sm mb-4">Comunidade</h3>
              <div className="space-y-3">
                {[
                  { label: "Membros", value: "5.284" },
                  { label: "Tópicos", value: "11.439" },
                  { label: "Respostas", value: "84.201" },
                  { label: "Online agora", value: "47" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top contributors */}
            <div className="glass rounded-2xl p-5 border border-cyan-900/15">
              <h3 className="text-white font-bold text-sm mb-4">Top Colaboradores</h3>
              <div className="space-y-3">
                {[
                  { nome: "AquaGuru_BR", emoji: "🧑‍🔬", posts: 1284, badge: "gold" },
                  { nome: "PlantadoRS", emoji: "🌳", posts: 987, badge: "silver" },
                  { nome: "VetAqua", emoji: "🩺", posts: 743, badge: "bronze" },
                  { nome: "Carlos_Aqua", emoji: "🧑", posts: 521, badge: null },
                  { nome: "GreenTank_SP", emoji: "👩", posts: 498, badge: null },
                ].map(({ nome, emoji, posts, badge }, i) => (
                  <div key={nome} className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs w-4">{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-800/50 to-blue-900/50 flex items-center justify-center text-sm border border-cyan-900/30">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-300 text-xs font-medium truncate flex items-center gap-1.5">
                        {nome}
                        {badge === "gold" && <span title="Ouro">🥇</span>}
                        {badge === "silver" && <span title="Prata">🥈</span>}
                        {badge === "bronze" && <span title="Bronze">🥉</span>}
                      </div>
                      <div className="text-slate-600 text-xs">{posts} posts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags populares */}
            <div className="glass rounded-2xl p-5 border border-cyan-900/15">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" /> Tags Populares
              </h3>
              <div className="flex flex-wrap gap-2">
                {["ciclagem", "plantado", "CO₂", "betta", "discus", "ich", "filtro", "nano", "marinho", "kinguio", "LED"].map(
                  (tag) => (
                    <button
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-cyan-500/8 border border-cyan-500/15 text-cyan-400 text-xs hover:bg-cyan-500/15 transition-all"
                    >
                      #{tag}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
