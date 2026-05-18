"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Plus, X, CheckCircle2, XCircle, AlertTriangle, Shuffle,
  Thermometer, FlaskConical, Ruler, Sparkles, Layers,
  Users, TriangleAlert, BookmarkPlus, FolderOpen, Trash2, Save,
} from "lucide-react";
import {
  peixes, getCompatibilidade, temperamentoLabel, zonaLabel,
  type Peixe, type ZonaNatacao, type Tamanho,
} from "@/data/peixes";
import BubbleBackground from "@/components/BubbleBackground";
import { useAuth } from "@/context/AuthContext";

interface GrupoSalvo {
  id: string;
  nome: string;
  peixeIds: string[];
  criadoEm: string;
}
const STORAGE_GRUPOS = "aquabrasil_grupos_salvos";

// ── Foto thumb (circular, pequena) ─────────────────────────────────────────
function PeixeThumb({ peixe, size = 10 }: { peixe: Peixe; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <div className={`w-${size} h-${size} rounded-full overflow-hidden border border-cyan-900/40 flex-shrink-0 bg-ocean-900 flex items-center justify-center`}>
      {peixe.foto && !err
        ? <img src={peixe.foto} alt={peixe.nome} className="w-full h-full object-cover" onError={() => setErr(true)} />
        : <span className={size <= 8 ? "text-sm" : "text-lg"}>{peixe.emoji}</span>}
    </div>
  );
}

// ── Card de peixe selecionado ───────────────────────────────────────────────
function PeixeCardSel({
  peixe, status, onRemove,
}: {
  peixe: Peixe;
  status: "neutral" | "ok" | "critico" | "atencao";
  onRemove: () => void;
}) {
  const [err, setErr] = useState(false);
  const borderCls = status === "ok" ? "border-emerald-500/50"
    : status === "critico" ? "border-rose-500/50"
    : status === "atencao" ? "border-amber-500/50"
    : "border-cyan-800/40";
  const badge = status === "ok"
    ? <span className="text-[10px] font-bold text-emerald-400">✓ OK</span>
    : status === "critico"
    ? <span className="text-[10px] font-bold text-rose-400">✗ Conflito</span>
    : status === "atencao"
    ? <span className="text-[10px] font-bold text-amber-400">⚠ Atenção</span>
    : null;
  return (
    <div className={`relative flex-shrink-0 w-[90px] rounded-xl border overflow-hidden bg-gradient-to-br ${peixe.corCard} ${borderCls} group`}>
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-black/60 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        title="Remover"
      >
        <X className="w-2.5 h-2.5" />
      </button>
      <div className="w-full h-[72px] overflow-hidden bg-ocean-900/60">
        {peixe.foto && !err
          ? <img src={peixe.foto} alt={peixe.nome} className="w-full h-full object-cover object-center" onError={() => setErr(true)} />
          : <div className="w-full h-full flex items-center justify-center text-3xl">{peixe.emoji}</div>}
      </div>
      <div className="px-2 pt-1.5 pb-2">
        <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2 min-h-[28px]">{peixe.nome}</p>
        {badge && <div className="mt-1">{badge}</div>}
      </div>
    </div>
  );
}

// ── Lógica de grupo ────────────────────────────────────────────────────────
interface Conflito {
  a: Peixe;
  b: Peixe;
  motivos: string[];
  tipo: "critico" | "atencao";
}

interface AnaliseGrupo {
  tempMin: number; tempMax: number; tempOk: boolean;
  phMin: number;   phMax: number;   phOk: boolean;
  aquarioMin: number;
  conflitos: Conflito[];
  criticos: Conflito[];
  atencoes: Conflito[];
  verdict: "compativel" | "atencao" | "incompativel";
  problemaPorPeixe: { peixe: Peixe; criticos: number; atencoes: number }[];
}

function calcularGrupo(grupo: Peixe[]): AnaliseGrupo {
  const tempMin  = Math.max(...grupo.map(p => p.temperatura.min));
  const tempMax  = Math.min(...grupo.map(p => p.temperatura.max));
  const phMin    = Math.max(...grupo.map(p => p.ph.min));
  const phMax    = Math.min(...grupo.map(p => p.ph.max));
  const aquarioMin = Math.max(...grupo.map(p => p.aquarioMinimo));

  const conflitos: Conflito[] = [];
  for (let i = 0; i < grupo.length; i++) {
    for (let j = i + 1; j < grupo.length; j++) {
      const r = getCompatibilidade(grupo[i], grupo[j]);
      if (r.resultado !== "compativel") {
        conflitos.push({ a: grupo[i], b: grupo[j], motivos: r.motivos, tipo: r.resultado === "incompativel" ? "critico" : "atencao" });
      }
    }
  }

  const criticos = conflitos.filter(c => c.tipo === "critico");
  const atencoes = conflitos.filter(c => c.tipo === "atencao");
  const verdict  = criticos.length > 0 ? "incompativel" : atencoes.length > 0 ? "atencao" : "compativel";

  const mapa = new Map<string, { peixe: Peixe; criticos: number; atencoes: number }>();
  for (const c of conflitos) {
    for (const p of [c.a, c.b]) {
      const cur = mapa.get(p.id) ?? { peixe: p, criticos: 0, atencoes: 0 };
      c.tipo === "critico" ? cur.criticos++ : cur.atencoes++;
      mapa.set(p.id, cur);
    }
  }
  const problemaPorPeixe = Array.from(mapa.values()).sort((a, b) => b.criticos - a.criticos || b.atencoes - a.atencoes);

  return { tempMin, tempMax, tempOk: tempMax >= tempMin, phMin, phMax, phOk: phMax >= phMin, aquarioMin, conflitos, criticos, atencoes, verdict, problemaPorPeixe };
}

// ── Lógica de sugestões ────────────────────────────────────────────────────
interface Sugestao {
  peixe: Peixe; score: number; compatíveis: number; atencoes: number;
  detalhes: { peixe: Peixe; resultado: "compativel" | "atencao" }[];
}
function calcularSugestoes(selecionados: Peixe[], todos: Peixe[]): Sugestao[] {
  if (selecionados.length === 0) return [];
  return todos
    .filter(p => !selecionados.find(s => s.id === p.id))
    .flatMap(candidato => {
      const resultados = selecionados.map(sel => ({ peixe: sel, ...getCompatibilidade(candidato, sel) }));
      if (resultados.some(r => r.resultado === "incompativel")) return [];
      const compats = resultados.filter(r => r.resultado === "compativel").length;
      const atencoes = resultados.filter(r => r.resultado === "atencao").length;
      return [{ peixe: candidato, score: Math.round((compats / selecionados.length) * 100 - atencoes * 5), compatíveis: compats, atencoes, detalhes: resultados.filter(r => r.resultado !== "incompativel").map(r => ({ peixe: r.peixe, resultado: r.resultado as "compativel" | "atencao" })) }];
    })
    .sort((a, b) => b.score - a.score);
}

// ── Seletor de peixes ─────────────────────────────────────────────────────
function SeletorPeixes({ selecionados, onAdd, onRemove, analise }: {
  selecionados: Peixe[];
  onAdd: (p: Peixe) => void;
  onRemove: (id: string) => void;
  analise?: AnaliseGrupo | null;
}) {
  const [aberto, setAberto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const peixesDoce = peixes.filter(p => p.tipo === "agua-doce");
  const filtrados = peixesDoce.filter(p =>
    !selecionados.find(s => s.id === p.id) &&
    (p.nome.toLowerCase().includes(filtro.toLowerCase()) || p.nomeCientifico.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <div className="glass rounded-2xl border border-cyan-900/20 mb-6 overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-cyan-400" />
            Confira a compatibilidade do seu grupo
            {selecionados.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 font-semibold">
                {selecionados.length} {selecionados.length === 1 ? "peixe" : "peixes"}
              </span>
            )}
          </h2>
          {selecionados.length === 0 && (
            <p className="text-slate-600 text-xs mt-0.5">Monte seu grupo e veja se as espécies convivem em harmonia.</p>
          )}
          {selecionados.length === 1 && (
            <p className="text-slate-600 text-xs mt-0.5">Adicione pelo menos mais 1 espécie para analisar o grupo.</p>
          )}
        </div>
        <button
          onClick={() => setAberto(!aberto)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-all flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>

      {/* Galeria de peixes selecionados */}
      {selecionados.length === 0 ? (
        <div className="px-5 py-8 flex flex-col items-center gap-4">
          <div className="flex items-end justify-center gap-1">
            {peixes.filter(p => p.tipo === "agua-doce" && p.foto).slice(0, 7).map((p, i) => {
              const sizes = ["w-10 h-10", "w-12 h-12", "w-14 h-14", "w-16 h-16", "w-14 h-14", "w-12 h-12", "w-10 h-10"];
              const opacities = ["opacity-40", "opacity-55", "opacity-70", "opacity-100", "opacity-70", "opacity-55", "opacity-40"];
              return (
                <div key={p.id} className={`${sizes[i]} ${opacities[i]} rounded-full overflow-hidden border-2 border-cyan-900/30 flex-shrink-0 bg-ocean-900 transition-all`}>
                  {p.foto
                    ? <img src={p.foto} alt={p.nome} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">{p.emoji}</div>}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <p className="text-slate-400 font-medium text-sm">Adicione peixes para verificar a compatibilidade</p>
            <p className="text-slate-600 text-xs mt-1">Temperatura, pH e temperamento são analisados automaticamente</p>
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 flex gap-3 overflow-x-auto scrollbar-hide">
          {selecionados.map(p => {
            const prob = analise?.problemaPorPeixe.find(x => x.peixe.id === p.id);
            const st: "neutral" | "ok" | "critico" | "atencao" =
              !analise ? "neutral" : !prob ? "ok" : prob.criticos > 0 ? "critico" : "atencao";
            return <PeixeCardSel key={p.id} peixe={p} status={st} onRemove={() => onRemove(p.id)} />;
          })}
        </div>
      )}

      {/* Dropdown de busca */}
      {aberto && (
        <div className="border-t border-white/5 p-4">
          <input autoFocus type="text" placeholder="Buscar por nome ou nome científico…"
            value={filtro} onChange={e => setFiltro(e.target.value)} className="input-ocean mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {filtrados.map(p => (
              <button key={p.id} onClick={() => { onAdd(p); setAberto(false); setFiltro(""); }}
                className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br ${p.corCard} border border-white/5 hover:border-cyan-700/30 text-left transition-all`}>
                <PeixeThumb peixe={p} size={10} />
                <div className="min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{p.nome}</div>
                  <div className="text-slate-400 text-xs italic truncate">{p.nomeCientifico}</div>
                  <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-2">
                    <Thermometer className="w-3 h-3 text-orange-400 inline" />{p.temperatura.min}–{p.temperatura.max}°C
                    <FlaskConical className="w-3 h-3 text-green-400 inline ml-1" />pH {p.ph.min}–{p.ph.max}
                  </div>
                </div>
              </button>
            ))}
            {filtrados.length === 0 && <p className="col-span-2 text-center text-slate-500 text-sm py-4">Nenhuma espécie encontrada.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────
export default function CompatibilidadePage() {
  const { user } = useAuth();
  const [selecionados, setSelecionados] = useState<Peixe[]>([]);
  const [aba, setAba] = useState<"analisar" | "sugestoes">("analisar");
  const [filtroZona, setFiltroZona] = useState<ZonaNatacao | "">("");
  const [filtroTamanho, setFiltroTamanho] = useState<Tamanho | "">("");
  const [filtroTemp, setFiltroTemp] = useState<"pacifico" | "">("");
  const [gruposSalvos, setGruposSalvos] = useState<GrupoSalvo[]>([]);
  const [salvandoGrupo, setSalvandoGrupo] = useState(false);
  const [nomeGrupo, setNomeGrupo] = useState("");
  const [feedbackSalvo, setFeedbackSalvo] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_GRUPOS);
      if (raw) setGruposSalvos(JSON.parse(raw));
    } catch {}
  }, []);

  const peixesDoce = peixes.filter(p => p.tipo === "agua-doce");
  const addPeixe    = (p: Peixe) => { if (!selecionados.find(s => s.id === p.id)) setSelecionados([...selecionados, p]); };
  const removerPeixe = (id: string) => setSelecionados(selecionados.filter(p => p.id !== id));

  function salvarGrupo() {
    const nome = nomeGrupo.trim() || `Grupo ${new Date().toLocaleDateString("pt-BR")}`;
    const novo: GrupoSalvo = { id: crypto.randomUUID(), nome, peixeIds: selecionados.map(p => p.id), criadoEm: new Date().toISOString() };
    const lista = [novo, ...gruposSalvos];
    setGruposSalvos(lista);
    try { localStorage.setItem(STORAGE_GRUPOS, JSON.stringify(lista)); } catch {}
    setSalvandoGrupo(false);
    setNomeGrupo("");
    setFeedbackSalvo("Grupo salvo!");
    setTimeout(() => setFeedbackSalvo(""), 2500);
  }

  function salvarComoAquario() {
    const nome = nomeGrupo.trim() || `Aquário ${new Date().toLocaleDateString("pt-BR")}`;
    try {
      const raw = localStorage.getItem("aquabrasil_aquarios_v2");
      const lista = raw ? JSON.parse(raw) : [];
      const novo = {
        id: crypto.randomUUID(), nome, tipo: "doce", params: ["temperatura", "ph", "amonia", "nitrito", "nitrato"],
        baseline: {}, peixes: selecionados.map(p => ({ id: p.id, nome: p.nome, quantidade: 1 })),
      };
      localStorage.setItem("aquabrasil_aquarios_v2", JSON.stringify([...lista, novo]));
    } catch {}
    setSalvandoGrupo(false);
    setNomeGrupo("");
    setFeedbackSalvo("Salvo no Diário do Aquário!");
    setTimeout(() => setFeedbackSalvo(""), 2500);
  }

  function carregarGrupo(g: GrupoSalvo) {
    const carregados = g.peixeIds.map(id => peixes.find(p => p.id === id)).filter(Boolean) as Peixe[];
    setSelecionados(carregados);
  }

  function excluirGrupo(id: string) {
    const lista = gruposSalvos.filter(g => g.id !== id);
    setGruposSalvos(lista);
    try { localStorage.setItem(STORAGE_GRUPOS, JSON.stringify(lista)); } catch {}
  }

  const analise = useMemo(() => selecionados.length >= 2 ? calcularGrupo(selecionados) : null, [selecionados]);
  const todasSugestoes = useMemo(() => calcularSugestoes(selecionados, peixesDoce), [selecionados]);
  const sugestoesFiltradas = useMemo(() => todasSugestoes.filter(s => {
    if (filtroZona && s.peixe.zonaNatacao !== filtroZona) return false;
    if (filtroTamanho && s.peixe.tamanho !== filtroTamanho) return false;
    if (filtroTemp && s.peixe.temperamento !== "pacifico") return false;
    return true;
  }), [todasSugestoes, filtroZona, filtroTamanho, filtroTemp]);

  return (
    <main className="min-h-screen">
      <section className="relative py-12 px-6 sm:px-8 overflow-hidden border-b border-cyan-900/15">
        <div className="absolute inset-0 bg-gradient-to-b from-[#041e36]/60 to-ocean-950" />
        <BubbleBackground count={10} />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            <span className="text-gradient">Compatibilidade</span> de Peixes
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Confira a compatibilidade do seu grupo de peixes — analise parâmetros, conflitos e descubra novas espécies para adicionar.
          </p>
        </div>
      </section>

      <section className="px-6 sm:px-8 py-12">
        <SeletorPeixes selecionados={selecionados} onAdd={addPeixe} onRemove={removerPeixe} analise={analise} />

        {/* ── Salvar grupo (usuário logado) ── */}
        {user && selecionados.length >= 2 && (
          <div className="mb-6">
            {!salvandoGrupo ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setSalvandoGrupo(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/25 bg-cyan-500/8 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/15 transition-all">
                  <BookmarkPlus className="w-4 h-4" /> Salvar grupo
                </button>
                {feedbackSalvo && <span className="text-xs text-emerald-400 font-medium">{feedbackSalvo}</span>}
              </div>
            ) : (
              <div className="glass rounded-2xl p-4 border border-cyan-500/20 flex flex-wrap items-center gap-3">
                <input autoFocus type="text" placeholder="Nome do grupo (opcional)"
                  value={nomeGrupo} onChange={e => setNomeGrupo(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && salvarGrupo()}
                  className="input-ocean text-sm flex-1 min-w-[180px]"
                />
                <button onClick={salvarGrupo}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/25 transition-all">
                  <Save className="w-3.5 h-3.5" /> Salvar grupo
                </button>
                <button onClick={salvarComoAquario}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-300 text-sm font-semibold hover:bg-violet-500/25 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Salvar como aquário
                </button>
                <button onClick={() => { setSalvandoGrupo(false); setNomeGrupo(""); }} className="p-2 text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Grupos salvos ── */}
        {user && gruposSalvos.length > 0 && (
          <div className="mb-6 glass rounded-2xl border border-white/8 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-semibold text-sm">Grupos salvos</span>
              <span className="text-slate-600 text-xs ml-1">{gruposSalvos.length}</span>
            </div>
            <div className="divide-y divide-white/5">
              {gruposSalvos.map(g => {
                const peixesGrupo = g.peixeIds.map(id => peixes.find(p => p.id === id)).filter(Boolean) as Peixe[];
                return (
                  <div key={g.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition-colors group">
                    <div className="flex -space-x-2 flex-shrink-0">
                      {peixesGrupo.slice(0, 4).map(p => (
                        <div key={p.id} className="w-7 h-7 rounded-full border-2 border-ocean-950 overflow-hidden bg-ocean-900 flex items-center justify-center flex-shrink-0">
                          {p.foto ? <img src={p.foto} alt={p.nome} className="w-full h-full object-cover" /> : <span className="text-xs">{p.emoji}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-medium truncate">{g.nome}</p>
                      <p className="text-slate-600 text-xs">{g.peixeIds.length} peixes · {new Date(g.criadoEm).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <button onClick={() => carregarGrupo(g)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all flex-shrink-0">
                      Carregar
                    </button>
                    <button onClick={() => excluirGrupo(g.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-700 hover:text-rose-400 transition-all flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Abas */}
        {selecionados.length >= 1 && (
          <div className="flex gap-2 mb-8 border-b border-white/8 pb-0">
            <button onClick={() => setAba("analisar")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 -mb-px ${aba === "analisar" ? "border-cyan-400 text-cyan-300 bg-cyan-500/8" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
              <Users className="w-4 h-4" /> Analisar grupo
            </button>
            <button onClick={() => setAba("sugestoes")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 -mb-px ${aba === "sugestoes" ? "border-cyan-400 text-cyan-300 bg-cyan-500/8" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
              <Sparkles className="w-4 h-4" /> Sugestões
              {todasSugestoes.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs">{todasSugestoes.length}</span>}
            </button>
          </div>
        )}

        {/* ── ABA: ANALISAR GRUPO ──────────────────────────────────────── */}
        {aba === "analisar" && (
          <>
            {selecionados.length < 2 ? null : analise && (
              <div className="space-y-5">

                {/* ── Veredicto geral + Parâmetros (compactos) ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Veredicto */}
                  {analise.verdict === "compativel" && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="text-emerald-300 font-bold text-sm">Grupo compatível</div>
                        <div className="text-emerald-500/80 text-xs">Todas as espécies convivem sem conflitos.</div>
                      </div>
                    </div>
                  )}
                  {analise.verdict === "atencao" && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex-1">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <div>
                        <div className="text-amber-300 font-bold text-sm">Compatível com ressalvas</div>
                        <div className="text-amber-500/80 text-xs">{analise.atencoes.length} {analise.atencoes.length === 1 ? "ponto requer" : "pontos requerem"} atenção.</div>
                      </div>
                    </div>
                  )}
                  {analise.verdict === "incompativel" && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex-1">
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <div>
                        <div className="text-rose-300 font-bold text-sm">Incompatibilidades detectadas</div>
                        <div className="text-rose-500/80 text-xs">{analise.criticos.length} conflito{analise.criticos.length > 1 ? "s" : ""} grave{analise.criticos.length > 1 ? "s" : ""}. Reveja a composição.</div>
                      </div>
                    </div>
                  )}
                  {/* Parâmetros inline */}
                  <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl glass border border-white/6 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                      {analise.tempOk
                        ? <span className="text-white text-sm font-semibold">{analise.tempMin}–{analise.tempMax}°C</span>
                        : <span className="text-rose-400 text-sm font-semibold">✗ temp.</span>}
                      {analise.tempOk && analise.tempMax - analise.tempMin < 2 && <span className="text-amber-400 text-xs">⚠</span>}
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                      {analise.phOk
                        ? <span className="text-white text-sm font-semibold">pH {analise.phMin.toFixed(1)}–{analise.phMax.toFixed(1)}</span>
                        : <span className="text-rose-400 text-sm font-semibold">✗ pH</span>}
                      {analise.phOk && analise.phMax - analise.phMin < 0.5 && <span className="text-amber-400 text-xs">⚠</span>}
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-white text-sm font-semibold">{analise.aquarioMin} L</span>
                    </div>
                  </div>
                </div>

                {/* ── Conflitos críticos ── */}
                {analise.criticos.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-rose-500/20">
                    <h3 className="text-rose-300 font-semibold text-sm mb-4 flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Conflitos graves ({analise.criticos.length})
                    </h3>
                    <div className="space-y-3">
                      {analise.criticos.map((c, i) => (
                        <div key={i} className="rounded-xl bg-rose-500/6 border border-rose-500/15 p-3">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <PeixeThumb peixe={c.a} size={8} />
                              <span className="text-white text-sm font-medium">{c.a.nome}</span>
                            </div>
                            <span className="text-rose-500 font-bold text-sm">×</span>
                            <div className="flex items-center gap-1.5">
                              <PeixeThumb peixe={c.b} size={8} />
                              <span className="text-white text-sm font-medium">{c.b.nome}</span>
                            </div>
                          </div>
                          <ul className="space-y-0.5">
                            {c.motivos.map((m, mi) => (
                              <li key={mi} className="text-xs text-slate-400 flex items-start gap-1.5">
                                <span className="text-rose-500 flex-shrink-0">—</span>{m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Pontos de atenção ── */}
                {analise.atencoes.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-amber-500/20">
                    <h3 className="text-amber-300 font-semibold text-sm mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Pontos de atenção ({analise.atencoes.length})
                    </h3>
                    <div className="space-y-3">
                      {analise.atencoes.map((c, i) => (
                        <div key={i} className="rounded-xl bg-amber-500/5 border border-amber-500/12 p-3">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <PeixeThumb peixe={c.a} size={8} />
                              <span className="text-white text-sm font-medium">{c.a.nome}</span>
                            </div>
                            <span className="text-amber-500 font-bold text-sm">+</span>
                            <div className="flex items-center gap-1.5">
                              <PeixeThumb peixe={c.b} size={8} />
                              <span className="text-white text-sm font-medium">{c.b.nome}</span>
                            </div>
                          </div>
                          <ul className="space-y-0.5">
                            {c.motivos.map((m, mi) => (
                              <li key={mi} className="text-xs text-slate-400 flex items-start gap-1.5">
                                <span className="text-amber-500 flex-shrink-0">—</span>{m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Otimizador de conflitos ── */}
                {analise.verdict !== "compativel" && (() => {
                  // Para cada peixe, simula a remoção e conta conflitos restantes
                  const simulacoes = selecionados.map(candidato => {
                    const semEle = selecionados.filter(p => p.id !== candidato.id);
                    const analSem = semEle.length >= 2 ? calcularGrupo(semEle) : null;
                    const criticosSem = analSem?.criticos.length ?? 0;
                    const atencoesSem = analSem?.atencoes.length ?? 0;
                    const criticosEliminados = analise.criticos.length - criticosSem;
                    const atencoesEliminadas = analise.atencoes.length - atencoesSem;
                    const score = criticosEliminados * 10 + atencoesEliminadas;
                    return { peixe: candidato, criticosSem, atencoesSem, criticosEliminados, atencoesEliminadas, score, resolveTudo: criticosSem === 0 && atencoesSem === 0 };
                  }).sort((a, b) => b.score - a.score).filter(s => s.score > 0);

                  if (simulacoes.length === 0) return null;
                  const melhor = simulacoes[0];

                  return (
                    <div className="glass rounded-2xl p-5 border border-cyan-900/15">
                      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                        <TriangleAlert className="w-4 h-4 text-cyan-400" /> Como resolver os conflitos
                      </h3>
                      <div className="space-y-2">
                        {simulacoes.slice(0, 4).map((s, i) => (
                          <div key={s.peixe.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${i === 0 ? "bg-cyan-500/6 border-cyan-500/20" : "bg-white/2 border-white/6"}`}>
                            <PeixeThumb peixe={s.peixe} size={8} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white text-sm font-medium">{s.peixe.nome}</span>
                                {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 font-semibold">Melhor opção</span>}
                                {s.resolveTudo && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-semibold">✓ Resolve tudo</span>}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Removendo: elimina{" "}
                                {s.criticosEliminados > 0 && <span className="text-rose-400">{s.criticosEliminados} conflito{s.criticosEliminados > 1 ? "s" : ""} grave{s.criticosEliminados > 1 ? "s" : ""}</span>}
                                {s.criticosEliminados > 0 && s.atencoesEliminadas > 0 && " e "}
                                {s.atencoesEliminadas > 0 && <span className="text-amber-400">{s.atencoesEliminadas} atenção{s.atencoesEliminadas > 1 ? "ões" : ""}</span>}
                                {s.criticosSem > 0 && <span className="text-slate-600"> · restam {s.criticosSem} grave{s.criticosSem > 1 ? "s" : ""}</span>}
                              </div>
                            </div>
                            <button onClick={() => removerPeixe(s.peixe.id)}
                              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all">
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                      {melhor.resolveTudo
                        ? <p className="text-emerald-500/70 text-xs mt-3">Remover <strong className="text-emerald-400">{melhor.peixe.nome}</strong> resolve todos os conflitos do grupo.</p>
                        : <p className="text-slate-600 text-xs mt-3">Nenhuma remoção única resolve todos os conflitos — pode ser necessário remover mais de um peixe.</p>
                      }
                    </div>
                  );
                })()}


              </div>
            )}
          </>
        )}

        {/* ── ABA: SUGESTÕES ───────────────────────────────────────────── */}
        {aba === "sugestoes" && (
          <>
            {selecionados.length === 0 ? (
              <div className="text-center py-14 glass rounded-2xl border border-white/5">
                <Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">Adicione ao menos <strong className="text-slate-300">1 peixe</strong> para ver sugestões compatíveis.</p>
              </div>
            ) : (
              <>
                <div className="glass rounded-2xl p-4 mb-6 border border-cyan-900/15 flex flex-wrap gap-3 items-center">
                  <span className="text-slate-500 text-xs font-medium">Filtrar:</span>
                  <select value={filtroZona} onChange={e => setFiltroZona(e.target.value as ZonaNatacao | "")} className="input-ocean text-sm py-1.5 w-auto">
                    <option value="">Qualquer zona</option>
                    <option value="fundo">Fundo</option>
                    <option value="fundo-meio">Fundo / Meio</option>
                    <option value="meio">Meio</option>
                    <option value="meio-superficie">Meio / Superfície</option>
                    <option value="superficie">Superfície</option>
                  </select>
                  <select value={filtroTamanho} onChange={e => setFiltroTamanho(e.target.value as Tamanho | "")} className="input-ocean text-sm py-1.5 w-auto">
                    <option value="">Qualquer tamanho</option>
                    <option value="nano">Nano (&lt;4cm)</option>
                    <option value="pequeno">Pequeno (4–12cm)</option>
                    <option value="medio">Médio (12–30cm)</option>
                    <option value="grande">Grande (&gt;30cm)</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" checked={filtroTemp === "pacifico"} onChange={e => setFiltroTemp(e.target.checked ? "pacifico" : "")} className="rounded border-slate-600 bg-ocean-900 text-cyan-500" />
                    Só pacíficos
                  </label>
                  {(filtroZona || filtroTamanho || filtroTemp) && (
                    <button onClick={() => { setFiltroZona(""); setFiltroTamanho(""); setFiltroTemp(""); }} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Limpar filtros</button>
                  )}
                  <span className="ml-auto text-slate-500 text-xs">{sugestoesFiltradas.length} sugestões</span>
                </div>

                {sugestoesFiltradas.length === 0 ? (
                  <div className="text-center py-12 glass rounded-2xl border border-white/5">
                    <p className="text-slate-500">Nenhuma sugestão compatível com os filtros aplicados.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sugestoesFiltradas.filter(s => s.atencoes === 0).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <h3 className="text-emerald-300 font-semibold text-sm">Totalmente compatíveis ({sugestoesFiltradas.filter(s => s.atencoes === 0).length})</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {sugestoesFiltradas.filter(s => s.atencoes === 0).map(s => <SugestaoCard key={s.peixe.id} s={s} selecionados={selecionados} onAdd={addPeixe} />)}
                        </div>
                      </div>
                    )}
                    {sugestoesFiltradas.filter(s => s.atencoes > 0).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <h3 className="text-amber-300 font-semibold text-sm">Compatíveis com atenção ({sugestoesFiltradas.filter(s => s.atencoes > 0).length})</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {sugestoesFiltradas.filter(s => s.atencoes > 0).map(s => <SugestaoCard key={s.peixe.id} s={s} selecionados={selecionados} onAdd={addPeixe} />)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

      </section>
    </main>
  );
}

// ── Card de sugestão ───────────────────────────────────────────────────────
function SugestaoCard({ s, selecionados, onAdd }: { s: Sugestao; selecionados: Peixe[]; onAdd: (p: Peixe) => void }) {
  const jaAdicionado = !!selecionados.find(x => x.id === s.peixe.id);
  return (
    <div className={`glass rounded-2xl border overflow-hidden transition-all ${s.atencoes === 0 ? "border-emerald-500/15 hover:border-emerald-500/30" : "border-amber-500/15 hover:border-amber-500/25"}`}>
      <div className="flex items-center gap-3 p-4">
        <PeixeThumb peixe={s.peixe} size={12} />
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">{s.peixe.nome}</div>
          <div className="text-slate-500 text-xs italic truncate">{s.peixe.nomeCientifico}</div>
          {selecionados.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {s.detalhes.map(d => (
                <span key={d.peixe.id} className={`text-xs px-1.5 py-0.5 rounded-full border ${d.resultado === "compativel" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
                  {d.resultado === "compativel" ? "✓" : "⚠"} {d.peixe.nome.split("-")[0]}
                </span>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => onAdd(s.peixe)} disabled={jaAdicionado}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${jaAdicionado ? "bg-white/5 text-slate-500 cursor-default" : "bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/25"}`}>
          {jaAdicionado ? "Adicionado" : "+ Adicionar"}
        </button>
      </div>
      <div className="px-4 pb-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-orange-400" />{s.peixe.temperatura.min}–{s.peixe.temperatura.max}°C</span>
        <span className="flex items-center gap-1"><FlaskConical className="w-3 h-3 text-green-400" />pH {s.peixe.ph.min}–{s.peixe.ph.max}</span>
        <span className="flex items-center gap-1"><Ruler className="w-3 h-3 text-violet-400" />{s.peixe.tamanhoAdulto}cm</span>
        <span className="flex items-center gap-1 ml-auto"><Layers className="w-3 h-3 text-cyan-500" />{zonaLabel[s.peixe.zonaNatacao]}</span>
      </div>
    </div>
  );
}
