"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { peixes, type Peixe } from "@/data/peixes";
import { X, Fish, Droplets, Waves } from "lucide-react";
import BubbleBackground from "@/components/BubbleBackground";

// ── Regiões com coordenadas ───────────────────────────────────────────────────
const REGIOES = [
  { id: "amazonia",     nome: "Amazônia",                   lat: -3.47,  lng: -62.21, cor: "#06b6d4" },
  { id: "brasil-sul",  nome: "Brasil (Sul/Sudeste)",        lat: -19.0,  lng: -49.0,  cor: "#0ea5e9" },
  { id: "orinoco",     nome: "Venezuela / Orinoco",         lat:  6.42,  lng: -66.59, cor: "#22d3ee" },
  { id: "colombia",    nome: "Colômbia",                    lat:  4.57,  lng: -74.29, cor: "#38bdf8" },
  { id: "peru",        nome: "Peru",                        lat: -9.19,  lng: -75.02, cor: "#7dd3fc" },
  { id: "bolivia",     nome: "Bolívia",                     lat: -16.29, lng: -63.59, cor: "#bae6fd" },
  { id: "prata",       nome: "Argentina / Rio da Prata",    lat: -34.61, lng: -58.38, cor: "#e0f2fe" },
  { id: "guiana",      nome: "Guiana",                      lat:  4.86,  lng: -58.93, cor: "#a5f3fc" },
  { id: "caribe",      nome: "Trinidad / Caribe",           lat: 10.69,  lng: -61.22, cor: "#67e8f9" },
  { id: "centroamerica", nome: "México / América Central",  lat: 15.78,  lng: -90.23, cor: "#34d399" },
  { id: "tailandia",   nome: "Tailândia / Mekong",          lat: 15.87,  lng: 100.99, cor: "#f97316" },
  { id: "india",       nome: "Índia / Sul da Ásia",         lat: 20.59,  lng:  78.96, cor: "#fb923c" },
  { id: "sudeste-asia",nome: "Sudeste Asiático",             lat:  1.35,  lng: 103.82, cor: "#fbbf24" },
  { id: "papua",       nome: "Papua / Indonésia",           lat: -4.27,  lng: 138.08, cor: "#a3e635" },
  { id: "africa-c",    nome: "África Central (Congo)",       lat: -4.03,  lng:  21.76, cor: "#c084fc" },
  { id: "africa-e",    nome: "África Oriental (Malawi)",    lat: -13.25, lng:  34.30, cor: "#f472b6" },
];

type RegiaoId = typeof REGIOES[number]["id"];

// ── Mapeamento origem → região ────────────────────────────────────────────────
function detectarRegiao(origem: string): RegiaoId | null {
  const o = origem.toLowerCase();
  if (o.includes("malawi") || o.includes("áfrica oriental")) return "africa-e";
  if (o.includes("congo") || o.includes("áfrica central")) return "africa-c";
  if (o.includes("papua") || o.includes("vogelkop")) return "papua";
  if (o.includes("tailând") || o.includes("camboja") || o.includes("laos") || o.includes("vietnam") || o.includes("mekong")) return "tailandia";
  if (o.includes("malaysia") || o.includes("malásia") || o.includes("singapura") || o.includes("borneo") || o.includes("sumatra") || o.includes("indonésia") || o.includes("sudeste asiático")) return "sudeste-asia";
  if (o.includes("índia") || o.includes("india") || o.includes("bangladesh") || o.includes("paquistão") || o.includes("nepal") || o.includes("sri lanka")) return "india";
  if (o.includes("méxico") || o.includes("mexico") || o.includes("guatemala") || o.includes("honduras") || o.includes("belize") || o.includes("central")) return "centroamerica";
  if (o.includes("trinidad") || o.includes("barbados") || o.includes("caribe")) return "caribe";
  if (o.includes("guiana") || o.includes("essequibo")) return "guiana";
  if (o.includes("argentina") || o.includes("prata") || o.includes("uruguai")) return "prata";
  if (o.includes("bolívia") || o.includes("bolivia")) return "bolivia";
  if (o.includes("peru")) return "peru";
  if (o.includes("colômbia") || o.includes("colombia")) return "colombia";
  if (o.includes("venezuela") || o.includes("orinoco") || o.includes("llanos")) return "orinoco";
  if (o.includes("amazôn") || o.includes("solimões") || o.includes("tapajós") || o.includes("xingu") || o.includes("araguaia") || o.includes("madeira") || o.includes("aripuanã") || o.includes("rio negro") || o.includes("amazon")) return "amazonia";
  if (o.includes("brasil") || o.includes("são francisco") || o.includes("paraná") || o.includes("mato grosso") || o.includes("pará")) return "brasil-sul";
  return null;
}

// ── Componente do globo (carregado dinamicamente, sem SSR) ────────────────────
const GloboInterativo = dynamic(() => import("@/components/GloboInterativo"), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-12 h-12 rounded-full border-2 border-cyan-500/40 border-t-cyan-400 animate-spin" />
  </div>
) });

// ── Thumb de peixe ────────────────────────────────────────────────────────────
function PeixeThumb({ peixe }: { peixe: Peixe }) {
  const [err, setErr] = useState(false);
  return (
    <div className="w-10 h-10 rounded-lg overflow-hidden bg-ocean-900 border border-white/8 flex items-center justify-center flex-shrink-0">
      {peixe.foto && !err
        ? <img src={peixe.foto} alt={peixe.nome} className="w-full h-full object-cover" onError={() => setErr(true)} />
        : <span className="text-xl">{peixe.emoji}</span>}
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
    REGIOES.filter(r => (peixesPorRegiao.get(r.id)?.length ?? 0) > 0).map(r => ({
      ...r,
      count: peixesPorRegiao.get(r.id)?.length ?? 0,
    })),
  [peixesPorRegiao]);

  const peixesDaRegiao = regiaoSelecionada ? (peixesPorRegiao.get(regiaoSelecionada) ?? []) : [];
  const regiaoInfo = REGIOES.find(r => r.id === regiaoSelecionada);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="relative py-10 px-6 sm:px-8 overflow-hidden border-b border-cyan-900/15 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#041e36]/60 to-ocean-950" />
        <BubbleBackground count={8} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">
              Origens dos <span className="text-gradient">Peixes</span>
            </h1>
            <p className="text-slate-400">Explore o mapa e descubra de onde vêm as espécies do catálogo.</p>
          </div>
          {/* Filtro */}
          <div className="flex gap-2 flex-shrink-0">
            {(["todos", "agua-doce", "agua-salgada"] as const).map(t => (
              <button key={t} onClick={() => setFiltroTipo(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filtroTipo === t ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "text-slate-500 border-white/10 hover:text-slate-300"}`}>
                {t === "todos" ? "🌐 Todos" : t === "agua-doce" ? "💧 Água Doce" : "🌊 Água Salgada"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Corpo: globo + painel */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* Globo */}
        <div className="relative flex-1 min-h-[400px] lg:min-h-0">
          <GloboInterativo
            pontos={pontos}
            regiaoSelecionada={regiaoSelecionada}
            onSelect={setRegiaoSelecionada}
          />
          {/* Legenda */}
          <div className="absolute bottom-4 left-4 glass rounded-xl px-3 py-2 border border-white/8 text-xs text-slate-400">
            Clique em um ponto para ver os peixes da região
          </div>
        </div>

        {/* Painel lateral */}
        <div className={`lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/8 flex flex-col transition-all ${regiaoSelecionada ? "flex" : "hidden lg:flex"}`}>
          {!regiaoSelecionada ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Fish className="w-8 h-8 text-cyan-500/50" />
              </div>
              <p className="text-slate-500 text-sm">Selecione uma região no globo para ver as espécies de lá.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {pontos.map(p => (
                  <button key={p.id} onClick={() => setRegiaoSelecionada(p.id as RegiaoId)}
                    className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all">
                    {p.nome} <span className="text-slate-600">({p.count})</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Cabeçalho do painel */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
                <div>
                  <h2 className="text-white font-bold text-base">{regiaoInfo?.nome}</h2>
                  <p className="text-slate-500 text-xs mt-0.5">{peixesDaRegiao.length} espécie{peixesDaRegiao.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setRegiaoSelecionada(null)} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Lista de peixes */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                {peixesDaRegiao.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                    <PeixeThumb peixe={p} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-medium truncate">{p.nome}</p>
                      <p className="text-slate-600 text-xs italic truncate">{p.nomeCientifico}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 font-medium"
                      style={{ color: p.tipo === "agua-doce" ? "#67e8f9" : "#818cf8", borderColor: p.tipo === "agua-doce" ? "rgba(6,182,212,0.2)" : "rgba(129,140,248,0.2)", background: p.tipo === "agua-doce" ? "rgba(6,182,212,0.08)" : "rgba(129,140,248,0.08)" }}>
                      {p.tipo === "agua-doce" ? "💧" : "🌊"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
