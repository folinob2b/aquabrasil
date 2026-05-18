"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { peixes, type Peixe } from "@/data/peixes";
import { X, Fish } from "lucide-react";
import BubbleBackground from "@/components/BubbleBackground";

// ── Regiões internas do catálogo ──────────────────────────────────────────────
const REGIOES = [
  { id: "rio-negro",   nome: "Rio Negro",                lat:  -1.5, lng: -62.5 },
  { id: "amazonia",    nome: "Bacia Amazônica",          lat:  -3.5, lng: -58.0 },
  { id: "rio-xingu",   nome: "Rio Xingu / Tapajós",      lat:  -5.0, lng: -53.0 },
  { id: "rio-sf",      nome: "Rio São Francisco",        lat: -10.5, lng: -41.0 },
  { id: "rio-parana",  nome: "Rio Paraná / Paraguai",    lat: -22.0, lng: -53.0 },
  { id: "brasil-c",    nome: "Brasil Central",           lat: -15.0, lng: -47.0 },
  { id: "orinoco",     nome: "Orinoco (Venezuela)",      lat:   7.5, lng: -66.5 },
  { id: "llanos",      nome: "Llanos",                   lat:   6.0, lng: -70.0 },
  { id: "colombia",    nome: "Colômbia",                 lat:   4.5, lng: -75.0 },
  { id: "peru",        nome: "Peru",                     lat:  -8.0, lng: -75.0 },
  { id: "bolivia",     nome: "Bolívia",                  lat: -16.5, lng: -64.5 },
  { id: "prata",       nome: "Bacia do Prata",           lat: -30.0, lng: -58.0 },
  { id: "guiana",      nome: "Guiana / Suriname",        lat:   4.5, lng: -58.5 },
  { id: "caribe",      nome: "Trinidad / Caribe",        lat:  10.5, lng: -61.0 },
  { id: "centroam",    nome: "México / América Central", lat:  15.0, lng: -87.0 },
  { id: "congo",       nome: "Bacia do Congo",           lat:  -2.5, lng:  22.0 },
  { id: "malawi",      nome: "Lagos Africanos",          lat: -12.0, lng:  34.5 },
  { id: "africa-o",    nome: "África Ocidental",         lat:   6.5, lng:   2.5 },
  { id: "india",       nome: "Índia",                    lat:  20.5, lng:  79.0 },
  { id: "bangladesh",  nome: "Bangladesh / Nepal",       lat:  23.7, lng:  90.4 },
  { id: "srilanka",    nome: "Sri Lanka",                lat:   7.9, lng:  80.8 },
  { id: "tailandia",   nome: "Tailândia / Mekong",       lat:  15.5, lng: 101.0 },
  { id: "vietnam",     nome: "Vietnam / Camboja",        lat:  12.0, lng: 108.0 },
  { id: "malasia",     nome: "Malásia / Singapura",      lat:   3.5, lng: 108.5 },
  { id: "borneo",      nome: "Borneo",                   lat:   1.0, lng: 114.0 },
  { id: "sumatra",     nome: "Sumatra",                  lat:  -0.5, lng: 102.5 },
  { id: "papua",       nome: "Papua / Indonésia",        lat:  -5.0, lng: 140.0 },
] as const;

type RegiaoId = typeof REGIOES[number]["id"];

function detectarRegiao(origem: string): RegiaoId | null {
  const o = origem.toLowerCase();
  if (o.includes("malawi") || (o.includes("lago") && o.includes("african"))) return "malawi";
  if (o.includes("congo")) return "congo";
  if (o.includes("áfrica ocidental") || o.includes("nigeria") || o.includes("benin")) return "africa-o";
  if (o.includes("papua") || o.includes("vogelkop")) return "papua";
  if (o.includes("sumatra")) return "sumatra";
  if (o.includes("borneo") || o.includes("bornéu")) return "borneo";
  if (o.includes("singapura") || (o.includes("malásia") && !o.includes("sumatra") && !o.includes("borneo"))) return "malasia";
  if (o.includes("vietnam") || o.includes("camboja") || o.includes("vietnã")) return "vietnam";
  if (o.includes("tailând") || o.includes("mekong") || o.includes("laos")) return "tailandia";
  if (o.includes("sri lanka")) return "srilanka";
  if (o.includes("bangladesh") || o.includes("paquistão") || o.includes("nepal")) return "bangladesh";
  if (o.includes("índia") || o.includes("india")) return "india";
  if (o.includes("méxico") || o.includes("guatemala") || o.includes("honduras") || o.includes("belize") || o.includes("central")) return "centroam";
  if (o.includes("trinidad") || o.includes("barbados") || o.includes("caribe")) return "caribe";
  if (o.includes("guiana") || o.includes("suriname") || o.includes("essequibo")) return "guiana";
  if (o.includes("bolívia") || o.includes("bolivia")) return "bolivia";
  if (o.includes("argentina") || o.includes("prata") || o.includes("uruguai")) return "prata";
  if (o.includes("peru")) return "peru";
  if (o.includes("colômbia") || o.includes("colombia")) return "colombia";
  if (o.includes("llanos")) return "llanos";
  if (o.includes("orinoco") || o.includes("venezuela")) return "orinoco";
  if (o.includes("rio negro") || o.includes("solimões")) return "rio-negro";
  if (o.includes("xingu") || o.includes("tapajós") || o.includes("aripuanã")) return "rio-xingu";
  if (o.includes("são francisco")) return "rio-sf";
  if (o.includes("paraná") || o.includes("paraguai")) return "rio-parana";
  if (o.includes("araguaia") || o.includes("rio de janeiro") || o.includes("guaporé")) return "brasil-c";
  if (o.includes("amazôn") || o.includes("amazon")) return "amazonia";
  if (o.includes("brasil") || o.includes("mato grosso") || o.includes("pará")) return "brasil-c";
  return null;
}

const GloboInterativo = dynamic(() => import("@/components/GloboInterativo"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
    </div>
  ),
});

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

export default function OrigensPage() {
  const [regioesSelecionadas, setRegioesSelecionadas] = useState<string[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "agua-doce" | "agua-salgada">("todos");

  const peixesPorRegiao = useMemo(() => {
    const mapa = new Map<string, Peixe[]>();
    for (const p of peixes) {
      if (filtroTipo !== "todos" && p.tipo !== filtroTipo) continue;
      const r = detectarRegiao(p.origem);
      if (!r) continue;
      if (!mapa.has(r)) mapa.set(r, []);
      mapa.get(r)!.push(p);
    }
    return mapa;
  }, [filtroTipo]);

  const regioesComPeixes = useMemo(() => new Set(peixesPorRegiao.keys()), [peixesPorRegiao]);

  // Peixes de todas as regiões selecionadas (para quando um país tem múltiplas regiões)
  const peixesDaSelecao = useMemo(() => {
    const todos = new Map<string, Peixe>();
    for (const rid of regioesSelecionadas) {
      for (const p of (peixesPorRegiao.get(rid) ?? [])) {
        todos.set(p.id, p);
      }
    }
    return Array.from(todos.values()).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [regioesSelecionadas, peixesPorRegiao]);

  // Nome a exibir para a seleção atual
  const nomeSelecao = useMemo(() => {
    if (regioesSelecionadas.length === 0) return "";
    if (regioesSelecionadas.length === 1) {
      return REGIOES.find(r => r.id === regioesSelecionadas[0])?.nome ?? regioesSelecionadas[0];
    }
    // Múltiplas regiões (ex: Brasil) — mostrar o país/área geral
    const nomes = regioesSelecionadas.map(id => REGIOES.find(r => r.id === id)?.nome ?? id);
    return nomes[0].split(" ")[0] + " e regiões"; // ex: "Bacia Amazônica e regiões"
  }, [regioesSelecionadas]);

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <section className="relative py-6 px-6 sm:px-8 overflow-hidden border-b border-cyan-900/15 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#041e36]/60 to-ocean-950" />
        <BubbleBackground count={6} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Origens dos <span className="text-gradient">Peixes</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Passe o mouse sobre um país para destacá-lo. Clique para ver as espécies.
            </p>
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

      {/* Corpo */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Globo */}
        <div className="relative flex-1 min-h-0 bg-[#020d1a]">
          <GloboInterativo
            regioesComPeixes={regioesComPeixes}
            regiaoSelecionada={regioesSelecionadas[0] ?? null}
            onSelectRegioes={setRegioesSelecionadas}
          />
        </div>

        {/* Painel lateral */}
        <div className={`w-80 xl:w-96 border-l border-white/8 flex flex-col flex-shrink-0 bg-ocean-950 ${regioesSelecionadas.length > 0 ? "flex" : "hidden lg:flex"}`}>
          {regioesSelecionadas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Fish className="w-8 h-8 text-cyan-500/40" />
              </div>
              <div>
                <p className="text-slate-400 font-medium text-sm">Passe o mouse sobre o mapa</p>
                <p className="text-slate-600 text-xs mt-1">Países com espécies ficam destacados em azul</p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center max-w-[240px] mt-2">
                {Array.from(regioesComPeixes).map(id => {
                  const r = REGIOES.find(x => x.id === id);
                  return r ? (
                    <button key={id} onClick={() => setRegioesSelecionadas([id])}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-slate-500 hover:text-slate-200 hover:border-white/20 transition-all">
                      {r.nome}
                    </button>
                  ) : null;
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">{nomeSelecao}</h2>
                  {regioesSelecionadas.length > 1 && (
                    <p className="text-slate-600 text-[10px] mt-0.5">
                      {regioesSelecionadas.map(id => REGIOES.find(r => r.id === id)?.nome).filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-cyan-400 text-xs font-semibold mt-0.5">
                    {peixesDaSelecao.length} espécie{peixesDaSelecao.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button onClick={() => setRegioesSelecionadas([])}
                  className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors mt-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {peixesDaSelecao.map(p => <PeixeCard key={p.id} peixe={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
