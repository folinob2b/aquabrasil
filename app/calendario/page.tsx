"use client";
import { useState, useEffect } from "react";
import {
  Plus, Trash2, CalendarDays, Thermometer, FlaskConical,
  Droplets, Wind, AlertTriangle, ChevronDown, TrendingUp,
  CheckCircle, XCircle, Lightbulb, Settings, Pencil, X,
  ClipboardList, Beaker, Camera, Leaf, Waves, Gauge, Zap, Activity,
} from "lucide-react";
import BubbleBackground from "@/components/BubbleBackground";
import { peixes as catalogoPeixes } from "@/data/peixes";

// ── Types ─────────────────────────────────────────────────────────────────────
type ParamKey =
  | "temperatura" | "ph" | "amonia" | "nitrito" | "nitrato" | "oxigenio" | "fosfato" | "kh"
  | "dureza" | "co2" | "tds" | "ferro"
  | "salinidade" | "calcio" | "magnesio" | "orp";

type Baseline = Partial<Record<ParamKey, { min: number; max: number }>>;

interface AquarioPeixe {
  id: string;
  nome: string;
  quantidade: number;
}

interface Aquario {
  id: string;
  nome: string;
  tipo: "doce" | "salgado";
  params: ParamKey[];
  baseline: Baseline;
  peixes: AquarioPeixe[];
  foto?: string;
}

interface Medicao {
  id: string;
  aquarioId: string;
  data: string;
  tpa: boolean;
  algae: boolean;
  temperatura: string;
  ph: string;
  amonia: string;
  nitrito: string;
  nitrato: string;
  oxigenio: string;
  fosfato: string;
  kh: string;
  dureza: string;
  co2: string;
  tds: string;
  ferro: string;
  salinidade: string;
  calcio: string;
  magnesio: string;
  orp: string;
  obs: string;
}

// ── Parâmetros disponíveis ────────────────────────────────────────────────────
const TODOS_PARAMS: {
  key: ParamKey; label: string; unit: string; icon: React.ComponentType<{ className?: string }>;
  color: string; stroke: string; ideal: string; idealMin: number; idealMax: number;
  min: number; max: number; placeholder: string; category: "universal" | "doce" | "salgado";
}[] = [
  // Universal
  { key: "temperatura", label: "Temperatura",  unit: "°C",   icon: Thermometer,  color: "text-orange-400",  stroke: "#fb923c", ideal: "24–28°C",       idealMin: 22,   idealMax: 30,   min: 0,   max: 40,   placeholder: "ex: 26",    category: "universal" },
  { key: "ph",          label: "pH",           unit: "",     icon: FlaskConical, color: "text-emerald-400", stroke: "#34d399", ideal: "6.5–7.5",       idealMin: 6.5,  idealMax: 7.5,  min: 4,   max: 10,   placeholder: "ex: 7.0",   category: "universal" },
  { key: "amonia",      label: "Amônia",       unit: "ppm",  icon: Wind,         color: "text-red-400",     stroke: "#f87171", ideal: "0 ppm",         idealMin: 0,    idealMax: 0.1,  min: 0,   max: 8,    placeholder: "ex: 0",     category: "universal" },
  { key: "nitrito",     label: "Nitrito",      unit: "ppm",  icon: Wind,         color: "text-rose-400",    stroke: "#fb7185", ideal: "0 ppm",         idealMin: 0,    idealMax: 0.25, min: 0,   max: 5,    placeholder: "ex: 0",     category: "universal" },
  { key: "nitrato",     label: "Nitrato",      unit: "ppm",  icon: Droplets,     color: "text-amber-400",   stroke: "#fbbf24", ideal: "< 20 ppm",      idealMin: 0,    idealMax: 20,   min: 0,   max: 160,  placeholder: "ex: 10",    category: "universal" },
  { key: "oxigenio",    label: "Oxigênio",     unit: "mg/L", icon: Activity,     color: "text-blue-300",    stroke: "#93c5fd", ideal: "6–10 mg/L",     idealMin: 6,    idealMax: 10,   min: 0,   max: 20,   placeholder: "ex: 8",     category: "universal" },
  { key: "fosfato",     label: "Fosfato",      unit: "ppm",  icon: FlaskConical, color: "text-purple-400",  stroke: "#c084fc", ideal: "0–0.1 ppm",     idealMin: 0,    idealMax: 0.1,  min: 0,   max: 5,    placeholder: "ex: 0.05",  category: "universal" },
  { key: "kh",          label: "Dureza KH",    unit: "dKH",  icon: Droplets,     color: "text-indigo-400",  stroke: "#818cf8", ideal: "4–8 dKH",       idealMin: 4,    idealMax: 8,    min: 0,   max: 25,   placeholder: "ex: 6",     category: "universal" },
  // Água Doce
  { key: "dureza",      label: "Dureza GH",    unit: "dGH",  icon: Droplets,     color: "text-sky-400",     stroke: "#38bdf8", ideal: "4–12 dGH",      idealMin: 4,    idealMax: 12,   min: 0,   max: 30,   placeholder: "ex: 8",     category: "doce" },
  { key: "co2",         label: "CO₂",          unit: "mg/L", icon: Wind,         color: "text-lime-400",    stroke: "#a3e635", ideal: "10–30 mg/L",    idealMin: 10,   idealMax: 30,   min: 0,   max: 50,   placeholder: "ex: 20",    category: "doce" },
  { key: "tds",         label: "TDS",          unit: "ppm",  icon: Gauge,        color: "text-teal-400",    stroke: "#2dd4bf", ideal: "100–300 ppm",   idealMin: 100,  idealMax: 300,  min: 0,   max: 2000, placeholder: "ex: 200",   category: "doce" },
  { key: "ferro",       label: "Ferro",        unit: "mg/L", icon: FlaskConical, color: "text-yellow-600",  stroke: "#ca8a04", ideal: "0.05–0.1 mg/L", idealMin: 0.05, idealMax: 0.1,  min: 0,   max: 2,    placeholder: "ex: 0.1",   category: "doce" },
  // Água Salgada
  { key: "salinidade",  label: "Salinidade",   unit: "ppt",  icon: Waves,        color: "text-cyan-300",    stroke: "#67e8f9", ideal: "33–36 ppt",     idealMin: 33,   idealMax: 36,   min: 0,   max: 50,   placeholder: "ex: 35",    category: "salgado" },
  { key: "calcio",      label: "Cálcio",       unit: "ppm",  icon: Droplets,     color: "text-blue-400",    stroke: "#60a5fa", ideal: "380–450 ppm",   idealMin: 380,  idealMax: 450,  min: 0,   max: 600,  placeholder: "ex: 420",   category: "salgado" },
  { key: "magnesio",    label: "Magnésio",     unit: "ppm",  icon: Droplets,     color: "text-violet-400",  stroke: "#a78bfa", ideal: "1250–1350 ppm", idealMin: 1250, idealMax: 1350, min: 0,   max: 2000, placeholder: "ex: 1300",  category: "salgado" },
  { key: "orp",         label: "ORP/Redox",    unit: "mV",   icon: Zap,          color: "text-orange-300",  stroke: "#fdba74", ideal: "300–400 mV",    idealMin: 300,  idealMax: 400,  min: 0,   max: 600,  placeholder: "ex: 350",   category: "salgado" },
];

const PARAMS_PADRAO: ParamKey[] = ["temperatura", "ph", "amonia", "nitrito", "nitrato"];

const STORAGE_AQUARIOS = "aquabrasil_aquarios_v2";
const STORAGE_MEDICOES  = "aquabrasil_medicoes_v2";

// ── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_OK  : Record<ParamKey, [number, number]> = {
  temperatura:[22,30],  ph:[6.5,7.5],  amonia:[0,0.25],   nitrito:[0,0.25],  nitrato:[0,20],
  oxigenio:[6,10],      fosfato:[0,0.1], kh:[4,8],
  dureza:[4,15],        co2:[10,30],   tds:[100,300],     ferro:[0.05,0.1],
  salinidade:[33,36],   calcio:[380,450], magnesio:[1250,1350], orp:[300,400],
};
const DEFAULT_WARN: Record<ParamKey, [number, number]> = {
  temperatura:[18,32],  ph:[6.0,8.5],  amonia:[0,0.5],    nitrito:[0,0.5],   nitrato:[0,40],
  oxigenio:[5,12],      fosfato:[0,0.25], kh:[3,10],
  dureza:[1,25],        co2:[5,40],    tds:[50,500],      ferro:[0,0.3],
  salinidade:[30,38],   calcio:[350,480], magnesio:[1150,1400], orp:[250,450],
};

// ── Status ────────────────────────────────────────────────────────────────────
function getStatus(key: ParamKey, val: string, baseline?: Baseline): "ok" | "warn" | "danger" | null {
  const v = parseFloat(val);
  if (isNaN(v) || val === "") return null;
  const bl = baseline?.[key];
  const [okLo, okHi] = bl ? [bl.min, bl.max] : DEFAULT_OK[key];
  // warn zone: ±25% of the ok range on each side
  const margin = (okHi - okLo) * 0.25 + 0.5;
  const [wLo, wHi] = bl ? [okLo - margin, okHi + margin] : DEFAULT_WARN[key];
  if (v >= okLo && v <= okHi) return "ok";
  if (v >= wLo  && v <= wHi)  return "warn";
  return "danger";
}

// ── Dicas ─────────────────────────────────────────────────────────────────────
const DICAS: Record<ParamKey, { titulo: string; baixo: string; alto: string }> = {
  temperatura: { titulo: "Temperatura",   baixo: "Verifique o aquecedor. Aumente a potência ou adicione um segundo. Mantenha longe de ar-condicionado.", alto: "Reduza a iluminação. Use ventilador sobre a superfície. Adicione gelo temporariamente." },
  ph:          { titulo: "pH",            baixo: "Adicione bicarbonato de sódio gradualmente (1 g/100 L). Use substrato calcário. Faça TPA com água mais alcalina.", alto: "Coloque turfa ou folhas de Catappa no filtro. CO₂ injetado abaixa o pH. Faça TPA com água mais ácida." },
  amonia:      { titulo: "Amônia",        baixo: "Amônia em 0 é ideal — mantenha assim.", alto: "URGENTE: TPA de 25–30% imediatamente. Cesse a alimentação por 2 dias. Verifique material em decomposição." },
  nitrito:     { titulo: "Nitrito",       baixo: "Nitrito em 0 é ideal — mantenha assim.", alto: "TPA de 25%. Adicione sal (1–2 g/L). Introduza bactérias nitrificantes. Não sobrecarregue o filtro." },
  nitrato:     { titulo: "Nitrato",       baixo: "Nitrato baixo indica aquário saudável.", alto: "TPA de 20–25% semanalmente. Reduza a ração. Adicione plantas. Verifique excesso de peixes." },
  oxigenio:    { titulo: "Oxigênio",      baixo: "Aumente aeração imediatamente. Reduza temperatura (água quente retém menos O₂). Verifique superpopulação.", alto: "Oxigênio alto é geralmente benéfico. Em tanques com CO₂ injetado pode indicar super-saturação." },
  fosfato:     { titulo: "Fosfato",       baixo: "Fosfato baixo é normal. Em plantados, um leve fosfato é necessário para as plantas crescerem bem.", alto: "Reduza a alimentação. Aumente TPA. Use resina removedora de fosfato no filtro." },
  kh:          { titulo: "Dureza KH",     baixo: "Adicione bicarbonato de sódio ou tampão KH. KH baixo causa quedas bruscas de pH — risco de crash.", alto: "Faça TPA com água de osmose reversa. Evite pedras calcárias no aquário." },
  dureza:      { titulo: "Dureza GH",     baixo: "Adicione osso de sépia ou pedra calcária ao filtro. Misture água da torneira com água de osmose.", alto: "Misture água da torneira com água de osmose reversa ou destilada. Remova pedras calcárias." },
  co2:         { titulo: "CO₂",           baixo: "Aumente a injeção de CO₂. Verifique vazamentos no difusor. Reduza agitação da superfície.", alto: "Reduza a injeção de CO₂. Aumente aeração. Peixes podem mostrar respiração acelerada na superfície." },
  tds:         { titulo: "TDS",           baixo: "TDS muito baixo indica água muito pura. Adicione fertilizantes ou use substrato ativo.", alto: "Faça TPA com água de osmose. Verifique excesso de fertilizantes ou medicamentos." },
  ferro:       { titulo: "Ferro",         baixo: "Adicione fertilizante ferroso quelado (Fe-EDTA ou Fe-DTPA). Ferro é essencial para o crescimento das plantas.", alto: "Reduza a dosagem de fertilizante ferroso. Faça TPA. Ferro alto pode favorecer algas." },
  salinidade:  { titulo: "Salinidade",    baixo: "Adicione sal marinho dissolvido em água separada. Ajuste gradualmente (máx. 0.5 ppt/dia).", alto: "Adicione água doce em pequenas quantidades. Verifique evaporação excessiva. Ajuste gradualmente." },
  calcio:      { titulo: "Cálcio",        baixo: "Adicione cloreto de cálcio (CaCl₂) ou use reator de calcário. Cálcio baixo inibe crescimento de corais.", alto: "Reduza dosagem de suplemento. Verifique equilíbrio com KH. Cálcio muito alto pode precipitar." },
  magnesio:    { titulo: "Magnésio",      baixo: "Adicione sulfato de magnésio (MgSO₄). Magnésio baixo impede que cálcio e KH se estabilizem.", alto: "Reduza ou suspenda dosagem de magnésio. Faça TPA parcial." },
  orp:         { titulo: "ORP/Redox",     baixo: "Verifique a proteína skimmer. Aumente aeração e circulação. Reduza carga orgânica.", alto: "ORP muito alto pode ser tóxico. Verifique dosagem de ozônio se usar. Reduza aeração." },
};

function getAlertas(m: Medicao, activeParams: ParamKey[], baseline?: Baseline) {
  const result: { param: ParamKey; label: string; valor: string; status: "warn" | "danger"; dica: string }[] = [];
  for (const p of TODOS_PARAMS.filter(p => activeParams.includes(p.key))) {
    const s = getStatus(p.key, m[p.key], baseline);
    if (s === "warn" || s === "danger") {
      const bl = baseline?.[p.key];
      const mid = bl ? (bl.min + bl.max) / 2 : (DEFAULT_OK[p.key][0] + DEFAULT_OK[p.key][1]) / 2;
      const alto = parseFloat(m[p.key]) > mid;
      result.push({ param: p.key, label: p.label, valor: `${m[p.key]} ${p.unit}`, status: s, dica: alto ? DICAS[p.key].alto : DICAS[p.key].baixo });
    }
  }
  return result;
}

// ── Gráfico ───────────────────────────────────────────────────────────────────
function Grafico({ medicoes, aquarioId, paramKey, baseline }: { medicoes: Medicao[]; aquarioId: string; paramKey: ParamKey; baseline?: Baseline }) {
  const p = TODOS_PARAMS.find(x => x.key === paramKey)!;
  const bl = baseline?.[paramKey];
  const idealMin = bl ? bl.min : p.idealMin;
  const idealMax = bl ? bl.max : p.idealMax;

  const dados = medicoes
    .filter(m => m.aquarioId === aquarioId && m[paramKey] !== "")
    .map(m => ({ data: m.data, v: parseFloat(m[paramKey]) }))
    .filter(m => !isNaN(m.v))
    .sort((a, b) => a.data.localeCompare(b.data));

  if (dados.length < 2) return (
    <div className="h-32 flex items-center justify-center text-slate-600 text-sm">
      Registre ao menos 2 medições para ver o gráfico
    </div>
  );

  const W = 560, H = 54, padX = 24, padY = 5;
  const innerW = W - padX * 2, innerH = H - padY * 2 - 11;
  const vals = dados.map(d => d.v);
  const allVals = [...vals, idealMin, idealMax];
  const range = Math.max(...allVals) - Math.min(...allVals);
  const lo = Math.min(...allVals) - range * 0.18;
  const hi = Math.max(...allVals) + range * 0.18;
  const toX = (i: number) => padX + (i / Math.max(dados.length - 1, 1)) * innerW;
  const toY = (v: number) => padY + innerH - ((v - lo) / (hi - lo)) * innerH;
  const idealY1 = Math.min(toY(idealMin), toY(idealMax));
  const idealH  = Math.max(Math.abs(toY(idealMin) - toY(idealMax)), 1);
  const pts = dados.map((d, i) => `${toX(i)},${toY(d.v)}`).join(" ");
  const nLabels = Math.min(dados.length, 6);
  const labelIdxs = Array.from({ length: nLabels }, (_, i) => Math.round(i * (dados.length - 1) / Math.max(nLabels - 1, 1)));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
      {/* Ideal band */}
      <rect x={padX} y={idealY1} width={innerW} height={idealH} fill="rgba(6,182,212,0.04)" />
      <line x1={padX} y1={idealY1} x2={padX+innerW} y2={idealY1} stroke="rgba(6,182,212,0.18)" strokeDasharray="2 4" strokeWidth="0.6" />
      <line x1={padX} y1={idealY1+idealH} x2={padX+innerW} y2={idealY1+idealH} stroke="rgba(6,182,212,0.18)" strokeDasharray="2 4" strokeWidth="0.6" />
      {/* Line */}
      <polyline points={pts} fill="none" stroke={p.stroke} strokeWidth="0.8" strokeLinejoin="round" strokeOpacity="0.55" />
      {/* Dots */}
      {dados.map((d, i) => {
        const s = getStatus(paramKey, String(d.v), baseline);
        const dot = s === "danger" ? "#f87171" : s === "warn" ? "#fbbf24" : p.stroke;
        return <circle key={i} cx={toX(i)} cy={toY(d.v)} r="1.6" fill={dot} fillOpacity="0.85" stroke="#0a1628" strokeWidth="0.5" />;
      })}
      {/* X labels */}
      {labelIdxs.map(i => (
        <text key={i} x={toX(i)} y={H-1} textAnchor="middle" fill="#1e3a52" fontSize="6">
          {new Date(dados[i].data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
        </text>
      ))}
      {/* Y labels */}
      <text x={padX-3} y={toY(Math.max(...vals))+2.5} textAnchor="end" fill="#1e3a52" fontSize="6">{Math.max(...vals).toFixed(1)}</text>
      <text x={padX-3} y={toY(Math.min(...vals))+2.5} textAnchor="end" fill="#1e3a52" fontSize="6">{Math.min(...vals).toFixed(1)}</text>
    </svg>
  );
}

function emptyMedicao(aquarioId: string): Omit<Medicao, "id"> {
  return { aquarioId, data: new Date().toISOString().slice(0, 10), tpa: false, algae: false, temperatura: "", ph: "", amonia: "", nitrito: "", nitrato: "", oxigenio: "", fosfato: "", kh: "", dureza: "", co2: "", tds: "", ferro: "", salinidade: "", calcio: "", magnesio: "", orp: "", obs: "" };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DiarioPage() {
  const [mounted, setMounted]           = useState(false);
  const [aquarios, setAquarios]         = useState<Aquario[]>([]);
  const [medicoes, setMedicoes]         = useState<Medicao[]>([]);
  const [aquarioAtivo, setAquarioAtivo] = useState<string>("");
  const [novoAqNome, setNovoAqNome]     = useState("");
  const [novoAqTipo, setNovoAqTipo]     = useState<"doce" | "salgado">("doce");
  const [criandoAq, setCriandoAq]       = useState(false);
  const [configurando, setConfigurando] = useState(false);
  const [abaConfig, setAbaConfig]       = useState<"params" | "baseline">("params");
  const [baselineEdit, setBaselineEdit] = useState<Partial<Record<ParamKey, { min: string; max: string }>>>({});
  const [adicionando, setAdicionando]   = useState(false);
  const [form, setForm]                 = useState<Omit<Medicao, "id"> | null>(null);
  const [paramGrafico, setParamGrafico] = useState<ParamKey>("ph");
  const [dicasAberto, setDicasAberto]   = useState(false);
  const [graficoAberto, setGraficoAberto] = useState(false);
  const [editandoMedicaoId, setEditandoMedicaoId] = useState<string | null>(null);
  const [renamingId, setRenamingId]     = useState<string | null>(null);
  const [renameVal, setRenameVal]       = useState("");
  const [renameTipo, setRenameTipo]     = useState<"doce" | "salgado">("doce");
  const [adicionandoPeixe, setAdicionandoPeixe] = useState(false);
  const [buscaPeixe, setBuscaPeixe]     = useState("");

  useEffect(() => {
    setMounted(true);
    try {
      const aq = localStorage.getItem(STORAGE_AQUARIOS);
      const me = localStorage.getItem(STORAGE_MEDICOES);
      const lista: Aquario[] = aq ? JSON.parse(aq) : [];
      setAquarios(lista);
      setMedicoes(me ? JSON.parse(me) : []);
      if (lista.length > 0) setAquarioAtivo(lista[0].id);
    } catch {}
  }, []);

  function saveAquarios(lista: Aquario[]) {
    setAquarios(lista);
    try { localStorage.setItem(STORAGE_AQUARIOS, JSON.stringify(lista)); } catch {}
  }
  function saveMedicoes(lista: Medicao[]) {
    setMedicoes(lista);
    try { localStorage.setItem(STORAGE_MEDICOES, JSON.stringify(lista)); } catch {}
  }

  const aq = aquarios.find(a => a.id === aquarioAtivo) ?? null;
  const activeParams: ParamKey[] = aq?.params ?? PARAMS_PADRAO;
  const aquBaseline: Baseline = aq?.baseline ?? {};
  const medAq = medicoes.filter(m => m.aquarioId === aquarioAtivo).sort((a, b) => b.data.localeCompare(a.data));
  const ultima = medAq[0] ?? null;
  const alertasUltima = ultima ? getAlertas(ultima, activeParams, aquBaseline) : [];

  // ── Aquário CRUD ─────────────────────────────────────────────────────────────
  function criarAquario() {
    const nome = novoAqNome.trim();
    if (!nome) return;
    const defaultParams: ParamKey[] = novoAqTipo === "salgado"
      ? ["temperatura", "ph", "amonia", "nitrito", "nitrato", "salinidade"]
      : [...PARAMS_PADRAO];
    const novo: Aquario = { id: crypto.randomUUID(), nome, tipo: novoAqTipo, params: defaultParams, baseline: {}, peixes: [] };
    const lista = [...aquarios, novo];
    saveAquarios(lista);
    setAquarioAtivo(novo.id);
    setNovoAqNome("");
    setNovoAqTipo("doce");
    setCriandoAq(false);
  }

  function uploadFotoAquario(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      const foto = e.target?.result as string;
      if (!aq) return;
      saveAquarios(aquarios.map(a => a.id === aq.id ? { ...a, foto } : a));
    };
    reader.readAsDataURL(file);
  }

  function removerFotoAquario() {
    if (!aq) return;
    saveAquarios(aquarios.map(a => a.id === aq.id ? { ...a, foto: undefined } : a));
  }

  function initBaselineEdit() {
    if (!aq) return;
    const edit: typeof baselineEdit = {};
    for (const p of TODOS_PARAMS) {
      const bl = aq.baseline?.[p.key];
      edit[p.key] = {
        min: bl ? String(bl.min) : String(DEFAULT_OK[p.key][0]),
        max: bl ? String(bl.max) : String(DEFAULT_OK[p.key][1]),
      };
    }
    setBaselineEdit(edit);
  }

  function abrirBaseline() {
    initBaselineEdit();
    setAbaConfig("baseline");
    setConfigurando(true);
    setAdicionando(false);
  }

  function salvarBaseline() {
    if (!aq) return;
    const novoBaseline: Baseline = {};
    for (const p of TODOS_PARAMS) {
      const e = baselineEdit[p.key];
      if (!e) continue;
      const min = parseFloat(e.min);
      const max = parseFloat(e.max);
      if (!isNaN(min) && !isNaN(max) && max >= min) novoBaseline[p.key] = { min, max };
    }
    saveAquarios(aquarios.map(a => a.id === aq.id ? { ...a, baseline: novoBaseline } : a));
    setConfigurando(false);
  }

  function resetBaseline() {
    if (!aq) return;
    saveAquarios(aquarios.map(a => a.id === aq.id ? { ...a, baseline: {} } : a));
    setConfigurando(false);
  }

  function removerAquario(id: string) {
    if (!confirm("Remover este aquário e todas as suas medições?")) return;
    saveAquarios(aquarios.filter(a => a.id !== id));
    saveMedicoes(medicoes.filter(m => m.aquarioId !== id));
    const restantes = aquarios.filter(a => a.id !== id);
    setAquarioAtivo(restantes.length > 0 ? restantes[0].id : "");
  }

  function adicionarPeixeAoAquario(peixeId: string, peixeNome: string) {
    if (!aq) return;
    const jaExiste = (aq.peixes ?? []).find(p => p.id === peixeId);
    if (jaExiste) {
      saveAquarios(aquarios.map(a => a.id === aq.id ? { ...a, peixes: (a.peixes ?? []).map(p => p.id === peixeId ? { ...p, quantidade: p.quantidade + 1 } : p) } : a));
    } else {
      saveAquarios(aquarios.map(a => a.id === aq.id ? { ...a, peixes: [...(a.peixes ?? []), { id: peixeId, nome: peixeNome, quantidade: 1 }] } : a));
    }
    setBuscaPeixe("");
    setAdicionandoPeixe(false);
  }

  function removerPeixeDoAquario(peixeId: string) {
    if (!aq) return;
    saveAquarios(aquarios.map(a => a.id === aq.id ? { ...a, peixes: (a.peixes ?? []).filter(p => p.id !== peixeId) } : a));
  }

  function alterarQuantidadePeixe(peixeId: string, delta: number) {
    if (!aq) return;
    saveAquarios(aquarios.map(a => a.id === aq.id ? {
      ...a,
      peixes: (a.peixes ?? []).map(p => p.id === peixeId ? { ...p, quantidade: Math.max(1, p.quantidade + delta) } : p),
    } : a));
  }

  function renomearAquario(id: string) {
    const nome = renameVal.trim();
    if (!nome) return;
    saveAquarios(aquarios.map(a => a.id === id ? { ...a, nome, tipo: renameTipo } : a));
    setRenamingId(null);
  }

  function toggleParam(key: ParamKey) {
    if (!aq) return;
    const novoParams = aq.params.includes(key) ? aq.params.filter(p => p !== key) : [...aq.params, key];
    saveAquarios(aquarios.map(a => a.id === aq.id ? { ...a, params: novoParams } : a));
  }

  // ── Medição CRUD ──────────────────────────────────────────────────────────────
  function abrirNovaMedicao() {
    const base = ultima ? { ...ultima, id: undefined } : null;
    // Data: dia seguinte da última medição, ou hoje se for no futuro
    const hoje = new Date().toISOString().slice(0, 10);
    let dataForm = hoje;
    if (ultima) {
      const proxDia = new Date(ultima.data + "T12:00:00");
      proxDia.setDate(proxDia.getDate() + 1);
      const proxStr = proxDia.toISOString().slice(0, 10);
      dataForm = proxStr <= hoje ? proxStr : hoje;
    }
    setForm({
      aquarioId: aquarioAtivo,
      data: dataForm,
      tpa: false,
      algae: false,
      temperatura: base?.temperatura ?? "",
      ph: base?.ph ?? "",
      amonia: base?.amonia ?? "",
      nitrito: base?.nitrito ?? "",
      nitrato: base?.nitrato ?? "",
      oxigenio: base?.oxigenio ?? "",
      fosfato: base?.fosfato ?? "",
      kh: base?.kh ?? "",
      dureza: base?.dureza ?? "",
      co2: base?.co2 ?? "",
      tds: base?.tds ?? "",
      ferro: base?.ferro ?? "",
      salinidade: base?.salinidade ?? "",
      calcio: base?.calcio ?? "",
      magnesio: base?.magnesio ?? "",
      orp: base?.orp ?? "",
      obs: "",
    });
    setEditandoMedicaoId(null);
    setAdicionando(true);
  }

  function abrirEditarMedicao(m: Medicao) {
    const { id: _, ...semId } = m;
    setForm(semId);
    setEditandoMedicaoId(m.id);
    setAdicionando(true);
    setConfigurando(false);
    setGraficoAberto(false);
  }

  function fecharFormulario() {
    setAdicionando(false);
    setForm(null);
    setEditandoMedicaoId(null);
  }

  function salvarMedicao() {
    if (!form) return;
    if (editandoMedicaoId) {
      saveMedicoes(medicoes.map(m => m.id === editandoMedicaoId ? { ...form, id: editandoMedicaoId } : m));
      setEditandoMedicaoId(null);
    } else {
      const nova: Medicao = { ...form, id: crypto.randomUUID() };
      saveMedicoes([nova, ...medicoes]);
    }
    setAdicionando(false);
    setForm(null);
  }

  function removerMedicao(id: string) {
    saveMedicoes(medicoes.filter(m => m.id !== id));
  }

  const upForm = (k: keyof Omit<Medicao, "id">, v: string | boolean) =>
    setForm(f => f ? { ...f, [k]: v } : f);

  if (!mounted) return null;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen">
      <section className="relative py-12 px-6 sm:px-8 overflow-hidden border-b border-cyan-900/15">
        <div className="absolute inset-0 bg-gradient-to-b from-[#041e36]/60 to-ocean-950" />
        <BubbleBackground count={10} />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Diário do <span className="text-gradient">Aquário</span>
          </h1>
          <p className="text-slate-400">Registre parâmetros, acompanhe a qualidade da água e gerencie seus peixes.</p>
        </div>
      </section>

      <section className="px-6 sm:px-8 py-8 space-y-6">

        {/* ── Tabs de aquário + botão novo ── */}
        {(aquarios.length > 0 || criandoAq) && (
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Meus aquários</p>
            <div className="flex items-center gap-2 flex-wrap">
              {aquarios.map(a => (
                <div key={a.id} className="flex items-center gap-0.5">
                  {renamingId === a.id ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <input autoFocus type="text" value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") renomearAquario(a.id); if (e.key === "Escape") setRenamingId(null); }}
                        className="input-ocean py-1.5 text-sm w-40"
                      />
                      <button onClick={() => setRenameTipo("doce")}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${renameTipo === "doce" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "text-slate-500 border-white/10 hover:text-slate-300"}`}>
                        💧 Doce
                      </button>
                      <button onClick={() => setRenameTipo("salgado")}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${renameTipo === "salgado" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "text-slate-500 border-white/10 hover:text-slate-300"}`}>
                        🌊 Salgado
                      </button>
                      <button onClick={() => renomearAquario(a.id)} className="px-2 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/30 transition-all">OK</button>
                      <button onClick={() => setRenamingId(null)} className="p-1.5 text-slate-500 hover:text-slate-300"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => { setAquarioAtivo(a.id); setAdicionando(false); setForm(null); setConfigurando(false); setGraficoAberto(false); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${aquarioAtivo === a.id ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-slate-200 border border-white/8 hover:border-white/15"}`}
                      >
                        {(a.tipo === "salgado" ? "🌊 " : "💧 ")}{a.nome}
                      </button>
                      {aquarioAtivo === a.id && (
                        <button onClick={() => { setRenamingId(a.id); setRenameVal(a.nome); setRenameTipo(a.tipo ?? "doce"); }}
                          className="p-1 text-slate-600 hover:text-slate-300 transition-colors" title="Renomear">
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
              <button onClick={() => setCriandoAq(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 border border-dashed border-white/10 hover:border-white/20 hover:text-slate-300 transition-all">
                <Plus className="w-3 h-3" /> Novo
              </button>
            </div>
          </div>
        )}

        {/* Criar aquário */}
        {criandoAq && (
          <div className="glass rounded-2xl p-5 border border-cyan-500/20 space-y-3">
            <div className="flex gap-3 items-center">
              <ClipboardList className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <input autoFocus type="text" placeholder="Nome do aquário (ex: Plantado 80L)"
                value={novoAqNome} onChange={e => setNovoAqNome(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") criarAquario(); if (e.key === "Escape") setCriandoAq(false); }}
                className="input-ocean flex-1"
              />
              <button onClick={() => setCriandoAq(false)} className="p-2 text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2 pl-8">
              <span className="text-xs text-slate-500 font-medium mr-1">Tipo:</span>
              <button onClick={() => setNovoAqTipo("doce")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${novoAqTipo === "doce" ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" : "text-slate-500 border-white/10 hover:text-slate-300 hover:border-white/20"}`}>
                💧 Água Doce
              </button>
              <button onClick={() => setNovoAqTipo("salgado")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${novoAqTipo === "salgado" ? "bg-blue-500/15 text-blue-300 border-blue-500/30" : "text-slate-500 border-white/10 hover:text-slate-300 hover:border-white/20"}`}>
                🌊 Água Salgada
              </button>
              <button onClick={criarAquario} className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold hover:opacity-90 transition-all whitespace-nowrap">Criar</button>
            </div>
          </div>
        )}

        {/* Sem aquários */}
        {aquarios.length === 0 && !criandoAq && (
          <div className="text-center py-20 glass rounded-2xl border border-white/5">
            <Beaker className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium mb-1">Nenhum aquário cadastrado.</p>
            <p className="text-slate-600 text-sm mb-5">Crie um aquário para começar a registrar medições.</p>
            <button onClick={() => setCriandoAq(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" /> Criar primeiro aquário
            </button>
          </div>
        )}

        {aq && (
          <>
            {/* ── Card do aquário ativo ── */}
            <div className="glass rounded-2xl border border-white/8 overflow-hidden">

              {/* Linha principal: foto · nome · CTA */}
              <div className="flex items-center gap-4 p-5">
                {/* Foto */}
                <div className="relative flex-shrink-0">
                  <label className="cursor-pointer group block">
                    <div className={`w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all ${aq.foto ? "border-cyan-500/30 group-hover:border-cyan-500/50" : "border-dashed border-white/15 group-hover:border-white/25 bg-white/3"} flex items-center justify-center`}>
                      {aq.foto
                        ? <img src={aq.foto} alt={aq.nome} className="w-full h-full object-cover" />
                        : <Camera className="w-6 h-6 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      }
                    </div>
                    <input type="file" accept="image/*" className="sr-only"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadFotoAquario(f); e.target.value = ""; }} />
                  </label>
                  {aq.foto && (
                    <button onClick={removerFotoAquario}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-400 transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                {/* Nome + contadores */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight truncate">{aq.nome}</h2>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-slate-500 text-sm">{medAq.length} medição{medAq.length !== 1 ? "ões" : ""}</span>
                    {ultima && (
                      <>
                        <span className="text-slate-700">·</span>
                        <span className="text-slate-500 text-sm">
                          última em {new Date(ultima.data + "T12:00:00").toLocaleDateString("pt-BR")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={abrirNovaMedicao}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:opacity-90 transition-all glow-cyan text-sm">
                    <Plus className="w-4 h-4" /> Nova medição
                  </button>
                  <button
                    onClick={() => { setConfigurando(!configurando); if (!configurando) setAbaConfig("params"); setAdicionando(false); }}
                    className={`p-2.5 rounded-xl border transition-all ${configurando ? "border-white/20 text-white bg-white/8" : "border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"}`}
                    title="Configurações">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => removerAquario(aq.id)}
                    className="p-2.5 rounded-xl border border-white/10 text-slate-600 hover:text-rose-400 hover:border-rose-500/20 transition-all"
                    title="Remover aquário">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Faixa de parâmetros baseline — compacta */}
              <div className="border-t border-white/5 px-5 py-3">
                <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-wider mb-2">Parâmetros baseline</p>
                <div className="flex flex-wrap gap-2 items-center">
                {TODOS_PARAMS.filter(p => activeParams.includes(p.key)).map(({ key, label, unit, icon: Icon, color }) => {
                  const bl = aquBaseline[key];
                  const okMin = bl ? bl.min : DEFAULT_OK[key][0];
                  const okMax = bl ? bl.max : DEFAULT_OK[key][1];
                  const lastVal = ultima?.[key] ?? "";
                  const s = lastVal !== "" ? getStatus(key, lastVal, aquBaseline) : null;
                  const vc = s === "danger" ? "text-rose-400" : s === "warn" ? "text-amber-400" : s === "ok" ? "text-emerald-400" : "text-slate-300";
                  return (
                    <span key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/3 border border-white/5 text-xs">
                      <Icon className={`w-3 h-3 ${color} flex-shrink-0`} />
                      <span className="text-slate-500 hidden sm:inline">{label}</span>
                      <span className="text-slate-400">{okMin}–{okMax}{unit && ` ${unit}`}</span>
                      {lastVal !== "" && <span className={`font-bold ${vc}`}>{lastVal}</span>}
                    </span>
                  );
                })}
                <button onClick={abrirBaseline}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors ml-1">
                  <Pencil className="w-3 h-3" /> editar
                </button>
                </div>
              </div>

              {/* Seção de peixes */}
              <div className="border-t border-white/5 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    Peixes do aquário
                    {(aq.peixes ?? []).length > 0 && (
                      <span className="ml-2 text-slate-600 font-normal normal-case">
                        {(aq.peixes ?? []).reduce((s, p) => s + p.quantidade, 0)} peixe{(aq.peixes ?? []).reduce((s, p) => s + p.quantidade, 0) !== 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => { setAdicionandoPeixe(!adicionandoPeixe); setBuscaPeixe(""); }}
                    className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Adicionar
                  </button>
                </div>

                {/* Busca de peixes */}
                {adicionandoPeixe && (
                  <div className="mb-3">
                    <input
                      autoFocus
                      type="text"
                      placeholder={`Buscar peixe de água ${aq.tipo === "salgado" ? "salgada" : "doce"}...`}
                      value={buscaPeixe}
                      onChange={e => setBuscaPeixe(e.target.value)}
                      className="input-ocean text-sm w-full mb-2"
                    />
                    {buscaPeixe.trim().length >= 2 && (() => {
                      const tipoFiltro = aq.tipo === "salgado" ? "agua-salgada" : "agua-doce";
                      const resultados = catalogoPeixes
                        .filter(p => p.tipo === tipoFiltro && p.nome.toLowerCase().includes(buscaPeixe.toLowerCase()))
                        .slice(0, 8);
                      return resultados.length > 0 ? (
                        <div className="rounded-xl border border-white/8 overflow-hidden">
                          {resultados.map((p, i) => (
                            <button
                              key={p.id}
                              onClick={() => adicionarPeixeAoAquario(p.id, p.nome)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors ${i > 0 ? "border-t border-white/5" : ""}`}
                            >
                              <span className="text-lg">{p.emoji}</span>
                              <div>
                                <p className="text-sm text-slate-200 font-medium">{p.nome}</p>
                                <p className="text-xs text-slate-600 italic">{p.nomeCientifico}</p>
                              </div>
                              <Plus className="w-3.5 h-3.5 text-cyan-500 ml-auto flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 px-1">Nenhum peixe encontrado.</p>
                      );
                    })()}
                  </div>
                )}

                {/* Lista de peixes */}
                {(aq.peixes ?? []).length === 0 && !adicionandoPeixe ? (
                  <p className="text-slate-700 text-xs">Nenhum peixe adicionado ainda.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {(aq.peixes ?? []).map(p => (
                      <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/3 transition-colors group">
                        <span className="text-slate-300 text-sm flex-1 truncate">{p.nome}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => alterarQuantidadePeixe(p.id, -1)} className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all text-xs">−</button>
                          <span className="text-xs text-slate-300 font-medium w-5 text-center">{p.quantidade}</span>
                          <button onClick={() => alterarQuantidadePeixe(p.id, +1)} className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all text-xs">+</button>
                        </div>
                        <button onClick={() => removerPeixeDoAquario(p.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-700 hover:text-rose-400 transition-all flex-shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Painel de configurações ── */}
            {configurando && (
              <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex border-b border-white/8">
                  <button onClick={() => setAbaConfig("params")}
                    className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${abaConfig === "params" ? "text-cyan-400 bg-cyan-500/8 border-b-2 border-cyan-500" : "text-slate-500 hover:text-slate-300"}`}>
                    <Settings className="w-3.5 h-3.5" /> Parâmetros
                  </button>
                  <button onClick={() => { setAbaConfig("baseline"); initBaselineEdit(); }}
                    className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${abaConfig === "baseline" ? "text-amber-400 bg-amber-500/8 border-b-2 border-amber-500" : "text-slate-500 hover:text-slate-300"}`}>
                    <FlaskConical className="w-3.5 h-3.5" /> Baseline
                    {Object.keys(aq.baseline ?? {}).length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </button>
                  <button onClick={() => setConfigurando(false)} className="px-4 py-3 text-slate-600 hover:text-slate-300 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {abaConfig === "params" && (
                  <div className="p-5 space-y-4">
                    {(["universal", "doce", "salgado"] as const).map(cat => {
                      const catParams = TODOS_PARAMS.filter(p => p.category === cat);
                      const bloqueado = (cat === "doce" && aq.tipo === "salgado") || (cat === "salgado" && aq.tipo === "doce");
                      const catLabel = cat === "universal" ? "🌐 Universal" : cat === "doce" ? "💧 Água Doce" : "🌊 Água Salgada / Recife";
                      return (
                        <div key={cat}>
                          <div className="flex items-center gap-2 mb-2">
                            <p className={`text-xs font-semibold uppercase tracking-wider ${bloqueado ? "text-slate-700" : "text-slate-500"}`}>{catLabel}</p>
                            {bloqueado && <span className="text-[10px] text-slate-700 border border-slate-700/40 rounded px-1.5 py-0.5">não disponível para este tipo</span>}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {catParams.map(p => {
                              const ativo = aq.params.includes(p.key);
                              if (bloqueado) return (
                                <div key={p.key} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/4 text-sm font-medium opacity-30 cursor-not-allowed select-none">
                                  <p.icon className="w-4 h-4 text-slate-700" />
                                  <span className="text-slate-700">{p.label}</span>
                                </div>
                              );
                              return (
                                <button key={p.key} onClick={() => toggleParam(p.key)}
                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${ativo ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" : "border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15"}`}>
                                  <p.icon className={`w-4 h-4 ${ativo ? p.color : "text-slate-600"}`} />
                                  {p.label}
                                  {ativo && <CheckCircle className="w-3.5 h-3.5 ml-auto text-cyan-500" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-slate-600 text-xs">Ative apenas os parâmetros que você mede. O formulário se ajusta automaticamente.</p>
                  </div>
                )}

                {abaConfig === "baseline" && (
                  <div className="p-4">
                    <p className="text-slate-600 text-xs mb-3">Valores ideais para este aquário — usados nos alertas. Padrão em cinza.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {TODOS_PARAMS.filter(p => activeParams.includes(p.key)).map(p => {
                        const e = baselineEdit[p.key] ?? { min: String(DEFAULT_OK[p.key][0]), max: String(DEFAULT_OK[p.key][1]) };
                        const hasCustom = !!aq.baseline?.[p.key];
                        return (
                          <div key={p.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${hasCustom ? "border-amber-500/25 bg-amber-500/5" : "border-white/8 bg-white/2"}`}>
                            <p.icon className={`w-3.5 h-3.5 flex-shrink-0 ${p.color}`} />
                            <span className="text-slate-300 text-xs font-medium flex-1 truncate">
                              {p.label}
                              {p.unit && <span className="text-slate-600 ml-1 font-normal">{p.unit}</span>}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <input type="number" step="0.1" value={e.min}
                                onChange={ev => setBaselineEdit(prev => ({ ...prev, [p.key]: { ...e, min: ev.target.value } }))}
                                className="input-ocean py-1 text-xs w-14 text-center"
                              />
                              <span className="text-slate-700 text-[10px]">–</span>
                              <input type="number" step="0.1" value={e.max}
                                onChange={ev => setBaselineEdit(prev => ({ ...prev, [p.key]: { ...e, max: ev.target.value } }))}
                                className="input-ocean py-1 text-xs w-14 text-center"
                              />
                              {hasCustom && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1 flex-shrink-0" title="Personalizado" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={salvarBaseline} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:opacity-90 transition-all">Salvar baseline</button>
                      <button onClick={resetBaseline} className="px-3 py-2 rounded-lg border border-white/10 text-slate-400 text-xs hover:text-slate-200 hover:border-white/20 transition-all">Usar padrão</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Formulário de nova / edição de medição ── */}
            {adicionando && form && (
              <div className={`glass rounded-3xl p-6 sm:p-8 border ${editandoMedicaoId ? "border-amber-500/25" : "border-cyan-900/25"}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-xl flex items-center gap-2">
                    <CalendarDays className={`w-5 h-5 ${editandoMedicaoId ? "text-amber-400" : "text-cyan-400"}`} />
                    {editandoMedicaoId ? "Editar medição" : "Nova medição"} — <span className={`font-semibold text-lg ${editandoMedicaoId ? "text-amber-300" : "text-cyan-300"}`}>{aq.nome}</span>
                  </h2>
                  <button onClick={fecharFormulario} className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mb-5 items-end">
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">Data</label>
                    <input type="date" value={form.data} onChange={e => upForm("data", e.target.value)} className="input-ocean" />
                  </div>
                  <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-white/3 cursor-pointer hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all select-none min-w-max">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.tpa ? "bg-cyan-500 border-cyan-500" : "border-slate-600 bg-transparent"}`}>
                      {form.tpa && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" checked={form.tpa} onChange={e => upForm("tpa", e.target.checked)} className="sr-only" />
                    <span className="text-sm font-medium text-slate-300">TPA realizada</span>
                    <span className="text-xs text-slate-600">(Troca Parcial de Água)</span>
                  </label>
                  <label className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all select-none min-w-max ${form.algae ? "border-green-500/40 bg-green-500/10 hover:bg-green-500/15" : "border-white/10 bg-white/3 hover:border-green-500/25 hover:bg-green-500/5"}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.algae ? "bg-green-500 border-green-500" : "border-slate-600 bg-transparent"}`}>
                      {form.algae && <Leaf className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" checked={form.algae} onChange={e => upForm("algae", e.target.checked)} className="sr-only" />
                    <Leaf className={`w-4 h-4 transition-colors ${form.algae ? "text-green-400" : "text-slate-600"}`} />
                    <span className={`text-sm font-medium transition-colors ${form.algae ? "text-green-300" : "text-slate-300"}`}>Alerta de alga</span>
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                  {TODOS_PARAMS.filter(p => activeParams.includes(p.key)).map(({ key, label, placeholder, icon: Icon, color, ideal, unit }) => {
                    const s = form[key] !== "" ? getStatus(key, form[key], aquBaseline) : null;
                    const ring = s === "ok" ? "ring-1 ring-emerald-500/40" : s === "warn" ? "ring-1 ring-amber-500/40" : s === "danger" ? "ring-1 ring-rose-500/40" : "";
                    return (
                      <div key={key}>
                        <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                          {label} {unit && <span className="text-slate-600">{unit}</span>}
                          <span className="text-slate-700 font-normal ml-1">({ideal})</span>
                        </label>
                        <div className="relative">
                          <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${color} pointer-events-none`} />
                          <input type="number" step="0.1" placeholder={placeholder}
                            value={form[key]} onChange={e => upForm(key, e.target.value)}
                            className={`input-ocean-icon ${ring}`} />
                          {s && (
                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${s === "ok" ? "text-emerald-400" : s === "warn" ? "text-amber-400" : "text-rose-400"}`}>
                              {s === "ok" ? "✓" : s === "warn" ? "⚠" : "✗"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-6">
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">Observações</label>
                  <textarea rows={2} placeholder="Adição de peixes, problemas observados, produtos usados..."
                    value={form.obs} onChange={e => upForm("obs", e.target.value)} className="input-ocean resize-none" />
                </div>

                {ultima && (
                  <p className="text-slate-600 text-xs mb-4">
                    Valores pré-preenchidos da medição anterior ({new Date(ultima.data + "T12:00:00").toLocaleDateString("pt-BR")}). Ajuste os campos necessários.
                  </p>
                )}

                <div className="flex gap-3">
                  <button onClick={salvarMedicao} className={`flex-1 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all bg-gradient-to-r ${editandoMedicaoId ? "from-amber-500 to-orange-500" : "from-cyan-500 to-blue-500"}`}>
                    {editandoMedicaoId ? "Salvar alterações" : "Salvar medição"}
                  </button>
                  <button onClick={fecharFormulario} className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/8 transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* ── Alertas da última medição ── */}
            {alertasUltima.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-amber-500/20 space-y-3">
                <h3 className="text-amber-300 font-semibold flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4" /> Alertas — última medição
                </h3>
                {alertasUltima.map(a => (
                  <div key={a.param} className={`rounded-xl p-4 border ${a.status === "danger" ? "bg-rose-500/8 border-rose-500/20" : "bg-amber-500/6 border-amber-500/15"}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {a.status === "danger" ? <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                      <span className="font-semibold text-sm text-white">{a.label}: <span className="text-slate-300">{a.valor}</span></span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed pl-6">{a.dica}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Histórico + gráfico ── */}
            {medAq.length === 0 ? (
              <div className="text-center py-14 glass rounded-2xl border border-white/5">
                <CalendarDays className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 mb-1">Nenhuma medição para <span className="text-slate-400 font-medium">{aq.nome}</span></p>
                <p className="text-slate-600 text-sm">Clique em "Nova medição" para começar.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    Registros
                    <span className="text-slate-600 text-xs font-normal">{medAq.length} medição{medAq.length !== 1 ? "ões" : ""}</span>
                  </h3>
                  {medAq.length >= 2 && (
                    <button
                      onClick={() => setGraficoAberto(!graficoAberto)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${graficoAberto ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/10" : "border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"}`}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      {graficoAberto ? "Fechar gráfico" : "Ver gráfico"}
                    </button>
                  )}
                </div>

                {/* Gráfico — aparece só quando solicitado */}
                {graficoAberto && medAq.length >= 2 && (
                  <div className="mb-4 border border-white/6 rounded-2xl px-4 pt-3 pb-2 bg-white/[0.015]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-500 text-xs flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3" /> Evolução
                      </span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {TODOS_PARAMS.filter(p => activeParams.includes(p.key)).map(p => (
                          <button key={p.key} onClick={() => setParamGrafico(p.key)}
                            className={`px-2 py-0.5 rounded text-xs transition-all ${paramGrafico === p.key ? `${p.color} bg-white/8` : "text-slate-600 hover:text-slate-400"}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Grafico medicoes={medicoes} aquarioId={aquarioAtivo} paramKey={paramGrafico} baseline={aquBaseline} />
                  </div>
                )}

                <div className="space-y-2">
                  {medAq.map(m => {
                    const avisos = getAlertas(m, activeParams, aquBaseline);
                    const temAlerta = avisos.some(a => a.status === "danger");
                    const temAviso  = !temAlerta && avisos.length > 0;
                    return (
                      <div key={m.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:border-white/15 ${temAlerta ? "border-rose-500/20 bg-rose-500/4" : temAviso ? "border-amber-500/15 bg-amber-500/3" : "border-white/6 bg-white/2"}`}>
                        <div className="flex-shrink-0 text-center min-w-[44px]">
                          <div className="text-white font-bold text-sm leading-none">
                            {new Date(m.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                          </div>
                          <div className="text-slate-600 text-xs mt-0.5">
                            {new Date(m.data + "T12:00:00").getFullYear()}
                          </div>
                        </div>
                        <div className="w-px h-8 bg-white/8 flex-shrink-0" />
                        <div className="flex flex-wrap gap-x-4 gap-y-1 flex-1 min-w-0">
                          {TODOS_PARAMS.filter(p => activeParams.includes(p.key)).map(({ key, label, unit, icon: Icon, color }) => {
                            const val = m[key];
                            if (!val) return null;
                            const s = getStatus(key, val, aquBaseline);
                            const vc = s === "danger" ? "text-rose-400" : s === "warn" ? "text-amber-400" : s === "ok" ? "text-emerald-400" : "text-slate-300";
                            return (
                              <div key={key} className="flex items-center gap-1">
                                <Icon className={`w-2.5 h-2.5 ${color} flex-shrink-0`} />
                                <span className={`text-xs font-semibold ${vc}`}>{val}</span>
                                <span className="text-slate-600 text-xs">{unit || label.slice(0,3)}</span>
                              </div>
                            );
                          })}
                          {m.tpa && <span className="text-xs text-blue-400">💧TPA</span>}
                          {m.algae && <span className="flex items-center gap-1 text-xs text-green-400"><Leaf className="w-3 h-3" />Alga</span>}
                          {m.obs && <span className="text-slate-600 text-xs italic truncate max-w-[180px]">{m.obs}</span>}
                        </div>
                        {avisos.length > 0 && (
                          <span title={avisos.map(a => `${a.label}: ${a.valor}`).join(", ")}>
                            <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${temAlerta ? "text-rose-400" : "text-amber-400"}`} />
                          </span>
                        )}
                        <button onClick={() => abrirEditarMedicao(m)} className="p-1 text-slate-700 hover:text-amber-400 transition-colors flex-shrink-0" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removerMedicao(m.id)} className="p-1 text-slate-700 hover:text-rose-400 transition-colors flex-shrink-0" title="Excluir">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Dicas de ajuste ── */}
            <div className="glass rounded-2xl border border-cyan-900/15 overflow-hidden">
              <button onClick={() => setDicasAberto(!dicasAberto)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="text-white font-semibold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" /> Dicas de Ajuste de Parâmetros
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dicasAberto ? "rotate-180" : ""}`} />
              </button>
              {dicasAberto && (
                <div className="px-4 pb-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {TODOS_PARAMS.filter(p => activeParams.includes(p.key)).map(p => {
                    const d = DICAS[p.key];
                    return (
                      <div key={p.key} className="rounded-lg bg-white/3 border border-white/5 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <p.icon className={`w-3 h-3 ${p.color}`} />
                          <span className="text-white font-semibold text-xs">{d.titulo}</span>
                          <span className="text-slate-600 text-[10px]">({p.ideal})</span>
                        </div>
                        <div className="space-y-0.5 text-[11px]">
                          <div><span className="text-blue-400 font-medium">▼ Baixo: </span><span className="text-slate-500">{d.baixo}</span></div>
                          <div><span className="text-rose-400 font-medium">▲ Alto: </span><span className="text-slate-500">{d.alto}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
