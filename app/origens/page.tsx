"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { peixes, type Peixe } from "@/data/peixes";
import { X, Fish } from "lucide-react";
import BubbleBackground from "@/components/BubbleBackground";

// ── Regiões do mundo com coordenadas ─────────────────────────────────────────
const REGIOES = [
  // América do Sul — Amazônia
  { id: "rio-negro",    nome: "Rio Negro",                lat:  -1.5,  lng: -62.5,  cor: "#06b6d4" },
  { id: "amazonia",     nome: "Bacia Amazônica",          lat:  -3.5,  lng: -58.0,  cor: "#0ea5e9" },
  { id: "rio-xingu",    nome: "Rio Xingu / Tapajós",      lat:  -5.0,  lng: -53.0,  cor: "#38bdf8" },
  { id: "rio-sf",       nome: "Rio São Francisco",        lat: -10.5,  lng: -41.0,  cor: "#7dd3fc" },
  { id: "rio-parana",   nome: "Rio Paraná / Paraguai",    lat: -22.0,  lng: -53.0,  cor: "#bae6fd" },
  { id: "brasil-c",     nome: "Brasil Central",           lat: -15.0,  lng: -47.0,  cor: "#a5f3fc" },
  // América do Sul — outros países
  { id: "orinoco",      nome: "Orinoco (Venezuela)",      lat:   7.5,  lng: -66.5,  cor: "#22d3ee" },
  { id: "llanos",       nome: "Llanos (Venezuela/Col.)",  lat:   6.0,  lng: -70.0,  cor: "#67e8f9" },
  { id: "colombia",     nome: "Colômbia",                 lat:   4.5,  lng: -75.0,  cor: "#34d399" },
  { id: "peru",         nome: "Peru (Alto Amazonas)",     lat:  -8.0,  lng: -75.0,  cor: "#6ee7b7" },
  { id: "bolivia",      nome: "Bolívia",                  lat: -16.5,  lng: -64.5,  cor: "#a7f3d0" },
  { id: "prata",        nome: "Bacia do Prata",           lat: -30.0,  lng: -58.0,  cor: "#d1fae5" },
  { id: "guiana",       nome: "Guiana / Suriname",        lat:   4.5,  lng: -58.5,  cor: "#86efac" },
  { id: "caribe",       nome: "Trinidad / Caribe",        lat:  10.5,  lng: -61.0,  cor: "#4ade80" },
  // América Central / México
  { id: "centroam",     nome: "México / América Central", lat:  15.0,  lng: -87.0,  cor: "#f97316" },
  // África
  { id: "congo",        nome: "Bacia do Congo",           lat:  -2.5,  lng:  22.0,  cor: "#c084fc" },
  { id: "malawi",       nome: "Lagos Africanos (Malawi)", lat: -12.0,  lng:  34.5,  cor: "#e879f9" },
  { id: "africa-o",     nome: "África Ocidental",         lat:   6.5,  lng:   2.5,  cor: "#f0abfc" },
  // Ásia — Sul
  { id: "india",        nome: "Índia",                    lat:  20.5,  lng:  79.0,  cor: "#fbbf24" },
  { id: "bangladesh",   nome: "Bangladesh / Nepal",       lat:  23.7,  lng:  90.4,  cor: "#fcd34d" },
  { id: "srilanka",     nome: "Sri Lanka",                lat:   7.9,  lng:  80.8,  cor: "#fde68a" },
  // Ásia — Sudeste
  { id: "tailandia",    nome: "Tailândia / Mekong",       lat:  15.5,  lng: 101.0,  cor: "#fb923c" },
  { id: "vietnam",      nome: "Vietnam / Camboja",        lat:  12.0,  lng: 108.0,  cor: "#fdba74" },
  { id: "malasia",      nome: "Malásia / Singapura",      lat:   3.5,  lng: 108.5,  cor: "#fed7aa" },
  { id: "borneo",       nome: "Borneo",                   lat:   1.0,  lng: 114.0,  cor: "#a3e635" },
  { id: "sumatra",      nome: "Sumatra",                  lat:  -0.5,  lng: 102.5,  cor: "#bef264" },
  { id: "papua",        nome: "Papua / Indonésia Leste",  lat:  -5.0,  lng: 140.0,  cor: "#d9f99d" },
] as const;

type RegiaoId = typeof REGIOES[number]["id"];

// ── Mapeamento origem → região ────────────────────────────────────────────────
function detectarRegiao(origem: string): RegiaoId | null {
  const o = origem.toLowerCase();
  // África
  if (o.includes("malawi") || o.includes("lago") && o.includes("african")) return "malawi";
  if (o.includes("congo")) return "congo";
  if (o.includes("áfrica ocidental") || o.includes("nigeria") || o.includes("benin")) return "africa-o";
  // Ásia — Oceania
  if (o.includes("papua") || o.includes("vogelkop")) return "papua";
  if (o.includes("sumatra")) return "sumatra";
  if (o.includes("borneo") || o.includes("bornéu")) return "borneo";
  if (o.includes("singapura") || (o.includes("malásia") && !o.includes("sumatra") && !o.includes("borneo"))) return "malasia";
  if (o.includes("vietnam") || o.includes("camboja") || o.includes("vietnã")) return "vietnam";
  if (o.includes("tailând") || o.includes("mekong") || o.includes("laos")) return "tailandia";
  if (o.includes("sri lanka")) return "srilanka";
  if (o.includes("bangladesh") || o.includes("paquistão") || o.includes("nepal")) return "bangladesh";
  if (o.includes("índia") || o.includes("india")) return "india";
  // América Central
  if (o.includes("méxico") || o.includes("guatemala") || o.includes("honduras") || o.includes("belize") || o.includes("central")) return "centroam";
  // América do Sul
  if (o.includes("trinidad") || o.includes("barbados") || o.includes("caribe")) return "caribe";
  if (o.includes("guiana") || o.includes("suriname") || o.includes("essequibo")) return "guiana";
  if (o.includes("bolívia") || o.includes("bolivia")) return "bolivia";
  if (o.includes("argentina") || o.includes("prata") || o.includes("uruguai")) return "prata";
  if (o.includes("peru") && (o.includes("alto") || o.includes("ucayali") || o.includes("aquas"))) return "peru";
  if (o.includes("peru")) return "peru";
  if (o.includes("colômbia") || o.includes("colombia")) return "colombia";
  if (o.includes("llanos")) return "llanos";
  if (o.includes("orinoco") || o.includes("venezuela")) return "orinoco";
  // Brasil — rios específicos
  if (o.includes("rio negro") || o.includes("solimões")) return "rio-negro";
  if (o.includes("xingu") || o.includes("tapajós") || o.includes("pará") || o.includes("aripuanã")) return "rio-xingu";
  if (o.includes("são francisco")) return "rio-sf";
  if (o.includes("paraná") || o.includes("paraguai") || o.includes("prata") || o.includes("mato grosso") && o.includes("sul")) return "rio-parana";
  if (o.includes("araguaia") || o.includes("rio de janeiro") || o.includes("guaporé") || o.includes("iténez")) return "brasil-c";
  if (o.includes("amazôn") || o.includes("amazon") || o.includes("alto rio amazon")) return "amazonia";
  if (o.includes("brasil") || o.includes("mato grosso") || o.includes("pará")) return "brasil-c";
  return null;
}

// ── Globo carregado dinamicamente ─────────────────────────────────────────────
const GloboInterativo = dynamic(() => import("@/components/GloboInterativo"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
    </div>
  ),
});

// ── Card de peixe no painel ───────────────────────────────────────────────────
function PeixeCard({ peixe }: { peixe: Peixe }) {
  const [err, setErr] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors border-b border-white/5 last:border-0">
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-ocean-900 border border-white/8 flex items-center justify-center flex-shrink-0">
        {peixe.foto && !err
          ? <img src={peixe.foto} alt={peixe.nome} className="w-full h-full object-cover" onError={() => setErr(true)} />
          : <span className="text-2xl">{peixe.emoji}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-semibold truncate">{peixe.nome}</p>
        <p className="text-slate-500 text-xs italic truncate">{peixe.nomeCientifico}</p>
        <p className="text-slate-600 text-[10px] truncate mt-0.5">{peixe.origem}</p>
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0"
        style={{
          color: peixe.tipo === "agua-doce" ? "#67e8f9" : "#818cf8",
          borderColor: peixe.tipo === "agua-doce" ? "rgba(6,182,212,0.25)" : "rgba(129,140,248,0.25)",
          background: peixe.tipo === "agua-doce" ? "rgba(6,182,212,0.08)" : "rgba(129,140,248,0.08)",
        }}>
        {peixe.tipo === "agua-doce" ? "💧" : "🌊"}
      </span>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function OrigensPage() {
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<RegiaoId | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "agua-doce" | "agua-salgada">("todos");

  const peixesPorRegiao = useMemo(() => {
    const mapa = new Map<RegiaoId, Peixe[]>();
    for (const p of peixes) {
      if (filtroTipo !== "todos" && p.tipo !== filtroTipo) continue;
      const r = detectarRegiao(p.origem);
      if (!r) continue;
      if (!mapa.has(r)) mapa.set(r, []);
      mapa.get(r)!.push(p);
    }
    return mapa;
  }, [filtroTipo]);

  const pontos = useMemo(() =>
    REGIOES
      .filter(r => (peixesPorRegiao.get(r.id)?.length ?? 0) > 0)
      .map(r => ({ ...r, count: peixesPorRegiao.get(r.id)!.length })),
  [peixesPorRegiao]);

  const peixesDaRegiao = useMemo(() =>
    (regiaoSelecionada ? (peixesPorRegiao.get(regiaoSelecionada) ?? []) : [])
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
  [regiaoSelecionada, peixesPorRegiao]);

  const regiaoInfo = REGIOES.find(r => r.id === regiaoSelecionada);

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Header compacto */}
      <section className="relative py-6 px-6 sm:px-8 overflow-hidden border-b border-cyan-900/15 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#041e36]/60 to-ocean-950" />
        <BubbleBackground count={6} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Origens dos <span className="text-gradient">Peixes</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Clique em um ponto no globo para ver as espécies daquela região.</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {(["todos", "agua-doce", "agua-salgada"] as const).map(t => (
              <button key={t} onClick={() => setFiltroTipo(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filtroTipo === t ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "text-slate-500 border-white/10 hover:text-slate-300"}`}>
                {t === "todos" ? "Todos" : t === "agua-doce" ? "💧 Doce" : "🌊 Salgada"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Corpo: globo + painel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Globo — ocupa o espaço restante */}
        <div className="relative flex-1 min-h-0 bg-[#020d1a]">
          <GloboInterativo
            pontos={pontos}
            regiaoSelecionada={regiaoSelecionada}
            onSelect={(id) => setRegiaoSelecionada(id as RegiaoId)}
          />
          {/* Atalhos de região no rodapé do globo */}
          {!regiaoSelecionada && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap gap-1.5 justify-center max-w-lg px-4">
              {pontos.map(p => (
                <button key={p.id} onClick={() => setRegiaoSelecionada(p.id as RegiaoId)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm text-slate-400 hover:text-white hover:border-white/25 transition-all whitespace-nowrap">
                  {p.nome} <span className="opacity-60">({p.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Painel lateral */}
        <div className={`w-80 xl:w-96 border-l border-white/8 flex flex-col flex-shrink-0 bg-ocean-950 ${regiaoSelecionada ? "flex" : "hidden lg:flex"}`}>
          {!regiaoSelecionada ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Fish className="w-8 h-8 text-cyan-500/40" />
              </div>
              <div>
                <p className="text-slate-400 font-medium text-sm">Nenhuma região selecionada</p>
                <p className="text-slate-600 text-xs mt-1">Clique em um ponto brilhante no globo</p>
              </div>
              <p className="text-slate-700 text-xs">{pontos.length} regiões com espécies mapeadas</p>
            </div>
          ) : (
            <>
              {/* Cabeçalho do painel */}
              <div className="flex items-start justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">{regiaoInfo?.nome}</h2>
                  <p className="text-cyan-400 text-xs font-semibold mt-0.5">
                    {peixesDaRegiao.length} espécie{peixesDaRegiao.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button onClick={() => setRegiaoSelecionada(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors mt-0.5 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista com fotos */}
              <div className="flex-1 overflow-y-auto">
                {peixesDaRegiao.map(p => <PeixeCard key={p.id} peixe={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
