"use client";
import { useState, useMemo } from "react";
import {
  Search, SlidersHorizontal, X, Thermometer, Droplets,
  FlaskConical, Fish, Ruler, Layers, ChevronLeft, ChevronRight,
  Clock, Palette,
} from "lucide-react";
import {
  peixes, dificuldadeLabel, tipoLabel, tamanhoLabel, temperamentoLabel, zonaLabel,
  type Peixe, type Dificuldade, type Tamanho, type Temperamento,
} from "@/data/peixes";
import {
  plantas, posicaoLabel, luminosidadeLabel, crescimentoLabel,
  type Planta, type PosicaoPlanta, type LuminosidadePlanta, type CrescimentoPlanta,
} from "@/data/plantas";
import BubbleBackground from "@/components/BubbleBackground";

type Categoria = "agua-doce" | "agua-salgada" | "plantas" | "corais" | "invertebrados";

// ── Foto com fallback ──────────────────────────────────────────────────────
function PeixeFoto({ src, emoji, nome, className }: { src?: string; emoji: string; nome: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-ocean-900 to-ocean-950 ${className}`}>
        <span className="text-5xl">{emoji}</span>
      </div>
    );
  }
  return (
    <img src={src} alt={nome} loading="lazy" decoding="async"
      className={`object-cover object-center ${className}`}
      onError={() => setErr(true)} />
  );
}

// ── Badges ────────────────────────────────────────────────────────────────
function DiffBadge({ d }: { d: Dificuldade }) {
  return (
    <span className={`badge ${d === "facil" ? "diff-facil" : d === "moderado" ? "diff-moderado" : "diff-dificil"}`}>
      {dificuldadeLabel[d]}
    </span>
  );
}
function TipoBadge({ t }: { t: Peixe["tipo"] }) {
  return (
    <span className={`badge ${t === "agua-doce" ? "tipo-doce" : t === "agua-salgada" ? "tipo-salgada" : "tipo-fria"}`}>
      {tipoLabel[t]}
    </span>
  );
}
function TempBadge({ t }: { t: Peixe["temperamento"] }) {
  const cls = t === "pacifico"
    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
    : t === "semi-agressivo"
    ? "bg-amber-500/15 text-amber-300 border-amber-500/25"
    : "bg-rose-500/15 text-rose-300 border-rose-500/25";
  return <span className={`badge ${cls}`}>{temperamentoLabel[t]}</span>;
}

// ── Modal de detalhe ──────────────────────────────────────────────────────
function FishModal({ peixe, onClose }: { peixe: Peixe; onClose: () => void }) {
  const todasFotos = [peixe.foto, ...(peixe.fotos ?? [])].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + todasFotos.length) % todasFotos.length);
  const next = () => setIdx((i) => (i + 1) % todasFotos.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass rounded-3xl max-h-[92vh] overflow-y-auto border border-cyan-900/30">
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 text-slate-400 hover:text-white transition-all">
          <X className="w-4 h-4" />
        </button>

        {/* Foto + carrossel */}
        <div className="relative w-full h-72 sm:h-80 rounded-t-3xl overflow-hidden">
          <PeixeFoto src={todasFotos[idx]} emoji={peixe.emoji} nome={peixe.nome} className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {todasFotos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-all z-10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-all z-10">
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl font-black text-white leading-tight">{peixe.nome}</h2>
            <p className="text-slate-300 text-sm italic">{peixe.nomeCientifico}</p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-slate-400 text-xs">{peixe.familia}</p>
              {todasFotos.length > 1 && (
                <div className="flex gap-1.5">
                  {todasFotos.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                      className={`h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/40 w-1.5"}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-5">
            <TipoBadge t={peixe.tipo} />
            <DiffBadge d={peixe.dificuldade} />
            <TempBadge t={peixe.temperamento} />
            <span className="badge bg-slate-700/50 text-slate-300 border border-slate-600/30">{tamanhoLabel[peixe.tamanho]}</span>
            <span className="badge bg-slate-700/50 text-slate-300 border border-slate-600/30">{zonaLabel[peixe.zonaNatacao]}</span>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-5">{peixe.descricao}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {[
              { icon: Thermometer, label: "Temperatura", value: `${peixe.temperatura.min}–${peixe.temperatura.max} °C`, color: "text-orange-400" },
              { icon: FlaskConical, label: "pH", value: `${peixe.ph.min}–${peixe.ph.max}`, color: "text-green-400" },
              { icon: Droplets, label: "Dureza (GH)", value: `${peixe.dureza.min}–${peixe.dureza.max} dGH`, color: "text-blue-400" },
              { icon: Droplets, label: "Aquário mínimo", value: `${peixe.aquarioMinimo} L`, color: "text-cyan-400" },
              { icon: Ruler, label: "Tamanho adulto", value: `${peixe.tamanhoAdulto} cm`, color: "text-violet-400" },
              { icon: Layers, label: "Zona de natação", value: zonaLabel[peixe.zonaNatacao], color: "text-teal-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white/4 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <Icon className={`w-3 h-3 ${color}`} /> {label}
                </div>
                <div className="text-white text-sm font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm mb-5">
            <div><span className="text-slate-500">Comportamento: </span><span className="text-slate-300">{peixe.comportamento}</span></div>
            <div><span className="text-slate-500">Alimentação: </span><span className="text-slate-300">{peixe.alimentacao}</span></div>
            <div><span className="text-slate-500">Origem: </span><span className="text-slate-300">{peixe.origem}</span></div>
          </div>

          {peixe.variacoes && peixe.variacoes.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-amber-500/6 border border-amber-500/15">
              <p className="text-amber-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                🎨 Variedades disponíveis no mercado
              </p>
              <div className="flex flex-wrap gap-1.5">
                {peixe.variacoes.map(v => (
                  <span key={v} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">{v}</span>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-2">Parâmetros e cuidados são os mesmos para todas as variedades desta espécie.</p>
            </div>
          )}

          {peixe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {peixe.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-cyan-500/8 border border-cyan-500/15 text-cyan-400 text-xs">#{tag}</span>
              ))}
            </div>
          )}
          {peixe.foto && <p className="mt-4 text-slate-700 text-xs">Foto: Wikimedia Commons / iNaturalist (CC-BY-SA)</p>}
        </div>
      </div>
    </div>
  );
}

// ── Grid de plantas ───────────────────────────────────────────────────────
function PlantasGrid({ plantas: lista, busca, setBusca }: {
  plantas: Planta[]; busca: string; setBusca: (v: string) => void;
}) {
  const [selecionada, setSelecionada] = useState<Planta | null>(null);
  const lumin = { baixa: "🔅", media: "💡", alta: "☀️" };
  const posColor: Record<PosicaoPlanta, string> = {
    foreground: "bg-lime-500/15 text-lime-300 border-lime-500/25",
    midground: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
    background: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    flutuante: "bg-teal-500/15 text-teal-300 border-teal-500/25",
    musgo: "bg-green-500/15 text-green-300 border-green-500/25",
    samambaia: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  };
  return (
    <div>
      {/* Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input type="text" placeholder="Buscar planta por nome ou nome científico..."
          value={busca} onChange={e => setBusca(e.target.value)} className="input-ocean-icon pr-10" />
        {busca && <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>}
      </div>
      <p className="text-slate-500 text-sm mb-5">{lista.length} {lista.length === 1 ? "planta encontrada" : "plantas encontradas"}</p>
      {lista.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-white/5">
          <span className="text-4xl mb-4 block">🌿</span>
          <p className="text-slate-500">Nenhuma planta encontrada.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {lista.map(p => (
            <button key={p.id} onClick={() => setSelecionada(p)}
              className={`group text-left rounded-2xl bg-gradient-to-br ${p.corCard} border border-white/6 hover:border-green-600/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden`}>
              {/* Foto */}
              <div className="relative w-full h-44 overflow-hidden">
                <PeixeFoto src={p.foto} emoji={p.emoji} nome={p.nome} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm text-white border border-white/15">
                    {lumin[p.luminosidade]} {luminosidadeLabel[p.luminosidade]}
                  </span>
                </div>
                {p.co2 && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-500/50 backdrop-blur-sm text-blue-200 border border-blue-400/30">CO₂</span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-bold text-base leading-snug truncate">{p.nome}</h3>
                <p className="text-slate-400 text-xs italic mt-0.5 truncate">{p.nomeCientifico}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className={`badge border text-xs ${posColor[p.posicao]}`}>{posicaoLabel[p.posicao]}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/6 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-yellow-400">📈</span>{crescimentoLabel[p.crescimento]}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <FlaskConical className="w-3 h-3 text-green-400 flex-shrink-0" />pH {p.ph.min}–{p.ph.max}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Thermometer className="w-3 h-3 text-orange-400 flex-shrink-0" />{p.temperatura.min}–{p.temperatura.max}°C
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Ruler className="w-3 h-3 text-violet-400 flex-shrink-0" />{p.altura.min}–{p.altura.max} cm
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {/* Modal de planta */}
      {selecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelecionada(null)} />
          <div className="relative w-full max-w-2xl glass rounded-3xl max-h-[92vh] overflow-y-auto border border-green-900/30">
            <button onClick={() => setSelecionada(null)} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 text-slate-400 hover:text-white transition-all"><X className="w-4 h-4" /></button>
            <div className="relative w-full h-72 rounded-t-3xl overflow-hidden">
              <PeixeFoto src={selecionada.foto} emoji={selecionada.emoji} nome={selecionada.nome} className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-6 right-16">
                <h2 className="text-2xl font-black text-white leading-tight">{selecionada.nome}</h2>
                <p className="text-slate-300 text-sm italic">{selecionada.nomeCientifico}</p>
                <p className="text-slate-400 text-xs mt-0.5">{selecionada.familia}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`badge border ${posColor[selecionada.posicao]}`}>{posicaoLabel[selecionada.posicao]}</span>
                <span className="badge bg-slate-700/50 text-slate-300 border border-slate-600/30">{lumin[selecionada.luminosidade]} {luminosidadeLabel[selecionada.luminosidade]}</span>
                <span className="badge bg-slate-700/50 text-slate-300 border border-slate-600/30">📈 {crescimentoLabel[selecionada.crescimento]}</span>
                {selecionada.co2 && <span className="badge bg-blue-500/15 text-blue-300 border border-blue-500/25">CO₂ necessário</span>}
                <span className={`badge border ${selecionada.dificuldade === "facil" ? "diff-facil" : selecionada.dificuldade === "moderado" ? "diff-moderado" : "diff-dificil"}`}>{dificuldadeLabel[selecionada.dificuldade]}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">{selecionada.descricao}</p>
              <div className="glass rounded-xl p-4 mb-4 border border-green-900/20">
                <h4 className="text-green-400 font-semibold text-xs mb-2 uppercase tracking-wide">Cuidados</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{selecionada.cuidados}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "pH", value: `${selecionada.ph.min}–${selecionada.ph.max}`, icon: "🧪" },
                  { label: "Temperatura", value: `${selecionada.temperatura.min}–${selecionada.temperatura.max}°C`, icon: "🌡️" },
                  { label: "Altura", value: `${selecionada.altura.min}–${selecionada.altura.max} cm`, icon: "📏" },
                  { label: "Crescimento", value: crescimentoLabel[selecionada.crescimento], icon: "📈" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-white/4 rounded-xl p-3 border border-white/5">
                    <div className="text-slate-500 text-xs mb-1">{icon} {label}</div>
                    <div className="text-white text-sm font-semibold">{value}</div>
                  </div>
                ))}
              </div>
              {selecionada.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selecionada.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-green-500/8 border border-green-500/15 text-green-400 text-xs">#{t}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────
export default function CatalogoPage() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("agua-doce");
  const [dificuldade, setDificuldade] = useState<Dificuldade | "">("");
  const [tamanho, setTamanho] = useState<Tamanho | "">("");
  const [temperamento, setTemperamento] = useState<Temperamento | "">("");
  const [ph, setPh] = useState<"acido" | "neutro" | "alcalino" | "">("");
  const [aquario, setAquario] = useState<"" | "40" | "80" | "150" | "300">("");
  const [selecionado, setSelecionado] = useState<Peixe | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const peixesDoce = useMemo(() => peixes.filter((p) => p.tipo === "agua-doce"), []);
  const totalDoce = peixesDoce.length;

  const categorias: { id: Categoria; label: string; emoji: string; count: number; disponivel: boolean }[] = [
    { id: "agua-doce",    label: "Água Doce",    emoji: "💧", count: totalDoce, disponivel: true },
    { id: "agua-salgada", label: "Água Salgada", emoji: "🌊", count: 0,         disponivel: false },
    { id: "plantas",      label: "Plantas",      emoji: "🌿", count: plantas.length, disponivel: true },
    { id: "corais",       label: "Corais",       emoji: "🪸", count: 0,         disponivel: false },
    { id: "invertebrados",label: "Invertebrados",emoji: "🦐", count: 0,         disponivel: false },
  ];

  const resultados = useMemo(() => {
    if (categoria !== "agua-doce") return [];
    return peixesDoce.filter((p) => {
      const matchBusca = !busca ||
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.nomeIngles.toLowerCase().includes(busca.toLowerCase()) ||
        p.nomeCientifico.toLowerCase().includes(busca.toLowerCase()) ||
        p.familia.toLowerCase().includes(busca.toLowerCase());
      const matchDiff = !dificuldade || p.dificuldade === dificuldade;
      const matchTam  = !tamanho    || p.tamanho    === tamanho;
      const matchTemp = !temperamento || p.temperamento === temperamento;
      const matchPh   = !ph || (
        ph === "acido"  ? p.ph.min <= 6.5 :
        ph === "neutro" ? p.ph.min <= 7.2 && p.ph.max >= 6.5 :
                          p.ph.max >= 7.5
      );
      const matchAq = !aquario || p.aquarioMinimo <= parseInt(aquario);
      return matchBusca && matchDiff && matchTam && matchTemp && matchPh && matchAq;
    }).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [busca, categoria, dificuldade, tamanho, temperamento, ph, aquario, peixesDoce]);

  const filtrosAtivos = [dificuldade, tamanho, temperamento, ph, aquario].filter(Boolean).length;

  function limparFiltros() {
    setDificuldade(""); setTamanho(""); setTemperamento(""); setPh(""); setAquario(""); setBusca("");
  }

  const catAtiva = categorias.find(c => c.id === categoria)!;

  // Plantas filtradas por busca
  const plantasFiltradas = useMemo(() => {
    if (!busca) return [...plantas].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    const q = busca.toLowerCase();
    return plantas.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      p.nomeCientifico.toLowerCase().includes(q) ||
      p.nomeIngles.toLowerCase().includes(q)
    ).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [busca]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative py-12 px-6 sm:px-8 overflow-hidden border-b border-cyan-900/15">
        <div className="absolute inset-0 bg-gradient-to-b from-[#041e36]/60 to-ocean-950" />
        <BubbleBackground count={10} />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Catálogo de <span className="text-gradient">Espécies</span>
          </h1>
          <p className="text-slate-400">
            {totalDoce} espécies · {plantas.length} plantas · filtros por parâmetros
          </p>
        </div>
      </section>

      <section className="px-6 sm:px-8">

        {/* ── STICKY: Tabs + Busca ── */}
        <div className="sticky top-0 z-20 bg-ocean-950/95 backdrop-blur-md border-b border-white/5 -mx-6 sm:-mx-8 px-6 sm:px-8 pt-5 pb-4">
          {/* Tabs de categoria */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { if (cat.disponivel) { setCategoria(cat.id); limparFiltros(); } }}
                disabled={!cat.disponivel}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  cat.id === categoria
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    : cat.disponivel
                    ? "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                    : "bg-white/3 border border-white/6 text-slate-600 cursor-not-allowed"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                {cat.disponivel
                  ? <span className={`text-xs px-1.5 py-0.5 rounded-full ${cat.id === categoria ? "bg-cyan-500/25 text-cyan-300" : "bg-white/8 text-slate-400"}`}>{cat.count}</span>
                  : <span className="flex items-center gap-0.5 text-xs text-slate-600"><Clock className="w-3 h-3" /> em breve</span>
                }
              </button>
            ))}
          </div>
          {/* Busca (apenas para peixes) */}
          {catAtiva.disponivel && categoria !== "plantas" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por nome, nome científico ou família..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="input-ocean-icon pr-10"
                />
                {busca && (
                  <button onClick={() => setBusca("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setFiltrosAbertos(!filtrosAbertos)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex-shrink-0 ${
                  filtrosAtivos > 0
                    ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                    : "bg-white/4 border-white/10 text-slate-300 hover:bg-white/8"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros avançados
                {filtrosAtivos > 0 && (
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-ocean-950 text-xs font-bold flex items-center justify-center">
                    {filtrosAtivos}
                  </span>
                )}
              </button>
              {filtrosAtivos > 0 && (
                <button onClick={limparFiltros}
                  className="px-4 py-2.5 rounded-xl border border-rose-500/25 bg-rose-500/8 text-rose-400 text-sm hover:bg-rose-500/15 transition-all flex-shrink-0">
                  Limpar
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Conteúdo (scrollável) ── */}
        <div className="pt-5">

        {/* Conteúdo da categoria selecionada */}
        {!catAtiva.disponivel ? (
          <div className="text-center py-24 glass rounded-2xl border border-white/5">
            <span className="text-5xl mb-4 block">{catAtiva.emoji}</span>
            <h2 className="text-white font-bold text-xl mb-2">{catAtiva.label} — Em breve</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Estamos adicionando espécies de {catAtiva.label.toLowerCase()}. Volte em breve!
            </p>
          </div>
        ) : categoria === "plantas" ? (
          /* ── ABA PLANTAS ── */
          <PlantasGrid plantas={plantasFiltradas} busca={busca} setBusca={setBusca} />
        ) : (
          <>

            {/* Painel de filtros avançados */}
            {filtrosAbertos && (
              <div className="glass rounded-2xl p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 border border-white/6">
                <div>
                  <label className="block text-xs text-slate-500 mb-2 font-medium">Dificuldade</label>
                  <select value={dificuldade} onChange={(e) => setDificuldade(e.target.value as Dificuldade | "")} className="input-ocean text-sm">
                    <option value="">Todas</option>
                    <option value="facil">Fácil</option>
                    <option value="moderado">Moderado</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-2 font-medium">Tamanho adulto</label>
                  <select value={tamanho} onChange={(e) => setTamanho(e.target.value as Tamanho | "")} className="input-ocean text-sm">
                    <option value="">Todos</option>
                    <option value="nano">Nano (&lt; 4 cm)</option>
                    <option value="pequeno">Pequeno (4–12 cm)</option>
                    <option value="medio">Médio (12–30 cm)</option>
                    <option value="grande">Grande (&gt; 30 cm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-2 font-medium">Temperamento</label>
                  <select value={temperamento} onChange={(e) => setTemperamento(e.target.value as Temperamento | "")} className="input-ocean text-sm">
                    <option value="">Todos</option>
                    <option value="pacifico">Pacífico</option>
                    <option value="semi-agressivo">Semi-agressivo</option>
                    <option value="agressivo">Agressivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-2 font-medium">pH preferido</label>
                  <select value={ph} onChange={(e) => setPh(e.target.value as "acido" | "neutro" | "alcalino" | "")} className="input-ocean text-sm">
                    <option value="">Qualquer</option>
                    <option value="acido">Ácido (pH &lt; 6.5)</option>
                    <option value="neutro">Neutro (6.5–7.5)</option>
                    <option value="alcalino">Alcalino (&gt; 7.5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-2 font-medium">Aquário mínimo</label>
                  <select value={aquario} onChange={(e) => setAquario(e.target.value as "" | "40" | "80" | "150" | "300")} className="input-ocean text-sm">
                    <option value="">Qualquer tamanho</option>
                    <option value="40">Até 40 L (nano)</option>
                    <option value="80">Até 80 L</option>
                    <option value="150">Até 150 L</option>
                    <option value="300">Até 300 L</option>
                  </select>
                </div>
                <div className="flex items-end">
                  {filtrosAtivos > 0 && (
                    <button onClick={limparFiltros}
                      className="w-full py-2.5 rounded-xl border border-rose-500/25 bg-rose-500/8 text-rose-400 text-sm hover:bg-rose-500/15 transition-all">
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Contagem */}
            <p className="text-slate-500 text-sm mb-5">
              {resultados.length} {resultados.length === 1 ? "espécie encontrada" : "espécies encontradas"}
              {(busca || filtrosAtivos > 0) && (
                <span className="text-slate-600"> · de {totalDoce} no total</span>
              )}
            </p>

            {/* Grid */}
            {resultados.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl border border-white/5">
                <Fish className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 mb-1">Nenhuma espécie encontrada.</p>
                <button onClick={limparFiltros} className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {resultados.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelecionado(p)}
                    className={`group text-left rounded-2xl bg-gradient-to-br ${p.corCard} border border-white/6 hover:border-cyan-600/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden`}
                  >
                    {/* Foto */}
                    <div className="relative w-full h-44 overflow-hidden">
                      <PeixeFoto src={p.foto} emoji={p.emoji} nome={p.nome}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {/* Badge tamanho */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm text-white border border-white/15">
                          {p.tamanhoAdulto} cm
                        </span>
                      </div>
                      {/* Badge variedades */}
                      {p.variacoes && p.variacoes.length > 0 && (
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-violet-900/75 backdrop-blur-sm text-violet-200 border border-violet-500/30">
                            <Palette className="w-3 h-3" />
                            {p.variacoes.length} var.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-white font-bold text-base leading-snug truncate">{p.nome}</h3>
                      <p className="text-slate-400 text-xs italic mt-0.5 truncate">{p.nomeCientifico}</p>

                      <div className="mt-2">
                        <span className="badge bg-teal-900/50 text-teal-300 border border-teal-700/30 text-xs">pH {p.ph.min}–{p.ph.max}</span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/6 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Thermometer className="w-3 h-3 text-orange-400 flex-shrink-0" />
                          {p.temperatura.min}–{p.temperatura.max}°C
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Fish className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{p.familia}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Droplets className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          mín. {p.aquarioMinimo} L
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Layers className="w-3 h-3 text-teal-400 flex-shrink-0" />
                          {zonaLabel[p.zonaNatacao].split(" ")[0]}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        </div>{/* fim pt-5 */}
      </section>

      {selecionado && (
        <FishModal key={selecionado.id} peixe={selecionado} onClose={() => setSelecionado(null)} />
      )}
    </main>
  );
}
