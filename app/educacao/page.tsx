"use client";
import { useState, useMemo } from "react";
import { ChevronRight, AlertTriangle, Lightbulb, ChevronDown, Search, X } from "lucide-react";
import BubbleBackground from "@/components/BubbleBackground";

type Categoria = "quimica" | "manutencao" | "peixes" | "plantas" | "saude" | "dicas";

interface Secao {
  titulo?: string;
  tipo: "texto" | "lista" | "alerta" | "dica" | "tabela" | "passos";
  texto?: string;
  itens?: string[];
  colunas?: string[];
  linhas?: string[][];
  passos?: { titulo: string; descricao: string }[];
}

interface Artigo {
  id: string;
  titulo: string;
  subtitulo: string;
  categoria: Categoria;
  emoji: string;
  tags: string[];
  conteudo: Secao[];
}

// ── Categorias ────────────────────────────────────────────────────────────────
const CATEGORIAS: {
  id: Categoria; label: string; descricao: string;
  cor: string; corBorda: string; corTexto: string; ilustracao: React.ReactNode;
}[] = [
  {
    id: "quimica", label: "Química da Água", descricao: "pH, nitrogênio, KH, GH e temperatura",
    cor: "bg-emerald-500/10", corBorda: "border-emerald-500/30", corTexto: "text-emerald-400",
    ilustracao: (
      <svg viewBox="0 0 80 60" className="w-full h-full">
        <circle cx="18" cy="30" r="10" fill="none" stroke="#f87171" strokeWidth="1.5"/>
        <text x="18" y="34" textAnchor="middle" fill="#f87171" fontSize="6" fontWeight="bold">NH₃</text>
        <circle cx="55" cy="14" r="10" fill="none" stroke="#fb923c" strokeWidth="1.5"/>
        <text x="55" y="18" textAnchor="middle" fill="#fb923c" fontSize="6" fontWeight="bold">NO₂</text>
        <circle cx="55" cy="46" r="10" fill="none" stroke="#34d399" strokeWidth="1.5"/>
        <text x="55" y="50" textAnchor="middle" fill="#34d399" fontSize="6" fontWeight="bold">NO₃</text>
        <path d="M28 25 L45 18" stroke="#475569" strokeWidth="1" fill="none"/>
        <path d="M55 24 L55 36" stroke="#475569" strokeWidth="1" fill="none"/>
        <path d="M45 46 L28 38" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" fill="none"/>
        <text x="8" y="50" fill="#475569" fontSize="5">Bactérias</text>
        <text x="58" y="30" fill="#475569" fontSize="5">→</text>
      </svg>
    ),
  },
  {
    id: "manutencao", label: "Manutenção", descricao: "TPA, filtros, equipamentos e rotina",
    cor: "bg-blue-500/10", corBorda: "border-blue-500/30", corTexto: "text-blue-400",
    ilustracao: (
      <svg viewBox="0 0 80 60" className="w-full h-full">
        <rect x="8" y="18" width="40" height="30" rx="3" fill="none" stroke="#38bdf8" strokeWidth="1.5"/>
        <rect x="8" y="33" width="40" height="15" rx="0" fill="#1e3a5f" opacity="0.6"/>
        <ellipse cx="20" cy="30" rx="5" ry="3" fill="#38bdf8" opacity="0.7"/>
        <ellipse cx="33" cy="26" rx="4" ry="2.5" fill="#34d399" opacity="0.7"/>
        <path d="M58 26 Q66 24 70 32 L68 48 Q65 50 60 50 L56 48 Z" fill="none" stroke="#60a5fa" strokeWidth="1.5"/>
        <path d="M60 26 Q63 21 68 26" fill="none" stroke="#60a5fa" strokeWidth="1.2"/>
        <path d="M50 36 L55 36" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2"/>
        <text x="38" y="57" textAnchor="middle" fill="#475569" fontSize="5">25% semanal</text>
      </svg>
    ),
  },
  {
    id: "peixes", label: "Peixes", descricao: "Escolha, alimentação, comportamento e reprodução",
    cor: "bg-violet-500/10", corBorda: "border-violet-500/30", corTexto: "text-violet-400",
    ilustracao: (
      <svg viewBox="0 0 80 60" className="w-full h-full">
        <ellipse cx="24" cy="22" rx="11" ry="6" fill="none" stroke="#a78bfa" strokeWidth="1.2"/>
        <polygon points="35,22 42,18 42,26" fill="#a78bfa" opacity="0.6"/>
        <circle cx="18" cy="21" r="1.5" fill="#c4b5fd"/>
        <ellipse cx="44" cy="36" rx="10" ry="5.5" fill="none" stroke="#38bdf8" strokeWidth="1.2"/>
        <polygon points="54,36 60,33 60,39" fill="#38bdf8" opacity="0.6"/>
        <circle cx="39" cy="35" r="1.2" fill="#7dd3fc"/>
        <ellipse cx="20" cy="46" rx="8" ry="5" fill="none" stroke="#4ade80" strokeWidth="1.2"/>
        <polygon points="28,46 34,43 34,49" fill="#4ade80" opacity="0.6"/>
        <circle cx="15" cy="45" r="1" fill="#86efac"/>
        <text x="40" y="57" textAnchor="middle" fill="#475569" fontSize="5">zona · temperamento</text>
      </svg>
    ),
  },
  {
    id: "plantas", label: "Plantas & Aquascaping", descricao: "Cultivo, fertilização e estilos de layout",
    cor: "bg-lime-500/10", corBorda: "border-lime-500/30", corTexto: "text-lime-400",
    ilustracao: (
      <svg viewBox="0 0 80 60" className="w-full h-full">
        <rect x="5" y="32" width="70" height="20" rx="2" fill="#1e3a5f" opacity="0.5"/>
        <ellipse cx="20" cy="32" rx="10" ry="5" fill="#475569"/>
        <ellipse cx="50" cy="32" rx="7" ry="4" fill="#334155"/>
        <ellipse cx="65" cy="33" rx="5" ry="3" fill="#3f4e5e"/>
        <path d="M15 32 Q13 22 15 14 Q18 22 15 32" fill="#4ade80" opacity="0.8"/>
        <path d="M26 32 Q24 23 27 16 Q29 23 26 32" fill="#22c55e" opacity="0.7"/>
        <path d="M55 32 Q54 25 57 18" stroke="#34d399" strokeWidth="1.5" fill="none"/>
        <path d="M8 32 Q12 26 18 32" fill="#15803d" opacity="0.6"/>
        <text x="40" y="57" textAnchor="middle" fill="#475569" fontSize="5">Nature · Iwagumi · Dutch</text>
      </svg>
    ),
  },
  {
    id: "saude", label: "Saúde & Tratamento", descricao: "Quarentena, doenças, algas e parasitas",
    cor: "bg-rose-500/10", corBorda: "border-rose-500/30", corTexto: "text-rose-400",
    ilustracao: (
      <svg viewBox="0 0 80 60" className="w-full h-full">
        <ellipse cx="38" cy="28" rx="18" ry="10" fill="#1e3a5f" opacity="0.4"/>
        <ellipse cx="38" cy="28" rx="14" ry="8" fill="none" stroke="#f87171" strokeWidth="1.2"/>
        <polygon points="52,28 60,24 60,32" fill="#f87171" opacity="0.5"/>
        <circle cx="30" cy="26" r="1.5" fill="#fff" opacity="0.9"/>
        <circle cx="37" cy="23" r="1.2" fill="#fff" opacity="0.8"/>
        <circle cx="43" cy="27" r="1" fill="#fff" opacity="0.8"/>
        <circle cx="39" cy="32" r="1.2" fill="#fff" opacity="0.8"/>
        <circle cx="31" cy="31" r="0.8" fill="#fff" opacity="0.7"/>
        <path d="M5 50 Q8 40 5 32 Q3 40 5 50" fill="#166534" opacity="0.5"/>
        <path d="M12 52 Q15 42 12 35" stroke="#15803d" strokeWidth="2" fill="none" opacity="0.6"/>
        <text x="42" y="55" textAnchor="middle" fill="#475569" fontSize="5">ich · algas · parasitas</text>
      </svg>
    ),
  },
  {
    id: "dicas", label: "Dicas Rápidas", descricao: "Tips práticos para o dia a dia do aquarista",
    cor: "bg-amber-500/10", corBorda: "border-amber-500/30", corTexto: "text-amber-400",
    ilustracao: (
      <svg viewBox="0 0 80 60" className="w-full h-full">
        <circle cx="40" cy="24" r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
        <line x1="40" y1="10" x2="40" y2="16" stroke="#fbbf24" strokeWidth="2"/>
        <line x1="40" y1="32" x2="40" y2="38" stroke="#fbbf24" strokeWidth="2"/>
        <line x1="26" y1="24" x2="32" y2="24" stroke="#fbbf24" strokeWidth="2"/>
        <line x1="48" y1="24" x2="54" y2="24" stroke="#fbbf24" strokeWidth="2"/>
        <circle cx="40" cy="24" r="5" fill="#fbbf24" opacity="0.3"/>
        <line x1="30" y1="39" x2="34" y2="43" stroke="#fbbf24" strokeWidth="1.5"/>
        <line x1="50" y1="39" x2="46" y2="43" stroke="#fbbf24" strokeWidth="1.5"/>
        <rect x="34" y="43" width="12" height="4" rx="2" fill="#fbbf24" opacity="0.4"/>
        <text x="40" y="56" textAnchor="middle" fill="#475569" fontSize="5">dicas práticas</text>
      </svg>
    ),
  },
];

// ── Artigos ────────────────────────────────────────────────────────────────────
const ARTIGOS: Artigo[] = [

  // ═══════════════════════ QUÍMICA DA ÁGUA ════════════════════════════════════
  {
    id: "ciclo-nitrogenio", categoria: "quimica", emoji: "🔬",
    titulo: "O Ciclo do Nitrogênio",
    subtitulo: "O processo biológico mais importante de qualquer aquário",
    tags: ["amônia", "nitrito", "nitrato", "bactérias", "ciclagem", "filtro"],
    conteudo: [
      { tipo: "texto", texto: "O ciclo do nitrogênio é o processo biológico mais fundamental do aquarismo. Ele descreve como compostos tóxicos produzidos pelos peixes são convertidos em substâncias menos nocivas por bactérias benéficas que vivem no filtro e no substrato." },
      { titulo: "As 4 etapas do ciclo", tipo: "passos", passos: [
        { titulo: "Amônia (NH₃) — produzida pelos peixes", descricao: "Peixes excretam amônia pelas brânquias e pelas fezes. Alimentos em decomposição também geram amônia. Mesmo 0,25 ppm já causa danos às brânquias." },
        { titulo: "Nitrosomonas: amônia → nitrito", descricao: "Bactérias colonizam o filtro e substrato. Convertem amônia em nitrito (NO₂). O nitrito interfere no transporte de oxigênio no sangue — igualmente tóxico." },
        { titulo: "Nitrospira: nitrito → nitrato", descricao: "A segunda família de bactérias transforma nitrito em nitrato (NO₃). Muito menos tóxico — peixes toleram até 40–80 ppm por períodos. Cultivada na segunda fase da ciclagem." },
        { titulo: "TPA remove o nitrato acumulado", descricao: "Trocas parciais de 20–30% semanais mantêm o nitrato abaixo de 20 ppm. Plantas aquáticas também consomem nitrato significativamente." },
      ]},
      { titulo: "Como ciclar um aquário novo", tipo: "lista", itens: [
        "Sem peixe (fishless): adicione amônia pura de farmácia (1–2 ppm/dia) por 4–6 semanas — método mais seguro",
        "Com peixe resistente: danio ou gambá em aquário grande com trocas a cada 2 dias — estressante para os peixes",
        "Acelerada com bactérias: Seachem Stability, Tetra SafeStart + mídia de filtro madura de outro aquário",
        "Transferência de mídia: método mais rápido — esponja do filtro de aquário funcionando há meses tem bilhões de bactérias",
      ]},
      { titulo: "Como saber que o ciclo está completo", tipo: "lista", itens: [
        "Amônia: 0 ppm (sem vestígio)",
        "Nitrito: 0 ppm (sem vestígio)",
        "Nitrato: > 5 ppm (prova que o ciclo está funcionando)",
        "Manter estes valores por 48–72h antes de adicionar peixes",
      ]},
      { titulo: "Valores de referência", tipo: "tabela", colunas: ["Parâmetro", "Ideal", "Atenção", "Crítico"], linhas: [
        ["Amônia (NH₃)", "0 ppm", "0,1–0,25 ppm", "> 0,5 ppm"],
        ["Nitrito (NO₂)", "0 ppm", "0,1–0,25 ppm", "> 0,5 ppm"],
        ["Nitrato (NO₃)", "< 10 ppm", "10–40 ppm", "> 80 ppm"],
      ]},
      { tipo: "alerta", texto: "ERRO CLÁSSICO: adicionar muitos peixes de uma vez após a ciclagem. As bactérias foram cultivadas para a carga de amônia do processo — aumentar a população repentinamente causa mini-ciclo. Adicione peixes gradualmente, esperando 2 semanas entre cada lote." },
      { tipo: "dica", texto: "Use kit de testes líquido (API Master Test Kit), nunca fitas — as fitas têm margem de erro de 50% para amônia e nitrito, o que pode mascarar níveis perigosos." },
    ]
  },
  {
    id: "controle-ph", categoria: "quimica", emoji: "⚗️",
    titulo: "Controle de pH",
    subtitulo: "Entenda, monitore e estabilize o pH do seu aquário",
    tags: ["pH", "ácido", "alcalino", "KH", "tampão", "bicarbonato", "CO₂", "catappa"],
    conteudo: [
      { tipo: "texto", texto: "O pH mede acidez/alcalinidade em escala de 0 a 14 (7 = neutro). Mais importante que o valor absoluto é a ESTABILIDADE — peixes tolerando pH 6,5 mas estável sofrem menos do que peixes em pH 7,0 com variação diária de 0,5 unidades." },
      { titulo: "O que afeta o pH diariamente", tipo: "lista", itens: [
        "CO₂ dissolvido: mais CO₂ = mais ácido carbônico = pH mais baixo",
        "Fotossíntese: durante o dia plantas consomem CO₂ → pH sobe levemente (variação de 0,2–0,5 é normal)",
        "Respiração noturna: plantas e peixes produzem CO₂ → pH cai à noite",
        "KH alto: amortece essas variações — pH permanece estável",
        "KH baixo: variações diárias de pH podem ultrapassar 1 unidade",
      ]},
      { titulo: "Por tipo de aquário", tipo: "tabela", colunas: ["Tipo", "pH alvo", "KH alvo", "Estratégia principal"], linhas: [
        ["Amazônico (tetras, discus, arawana)", "5,5–7,0", "1–4 dKH", "Turfa, folhas de Catappa, osmose"],
        ["Comunitário tropical padrão", "6,5–7,5", "3–8 dKH", "Água da torneira sem correção"],
        ["Africano (mbunas, tanganyika)", "7,8–9,0", "10–20 dKH", "Coral, pedra calcária, buffer"],
        ["Plantado com CO₂ injetado", "6,5–7,0", "3–6 dKH", "CO₂ controla naturalmente"],
        ["Camarão Neocaridina", "7,0–7,5", "4–8 dKH", "Água da torneira estável"],
        ["Camarão Caridina (Crystal/Bee)", "5,8–6,8", "0–2 dKH", "Osmose + remineralização ácida"],
      ]},
      { titulo: "Como elevar o pH com segurança", tipo: "passos", passos: [
        { titulo: "Aeração aumentada", descricao: "Remove CO₂ dissolvido — eleva pH 0,2–0,5 unidades sem produtos. Mais eficaz em aquários fechados. Solução gratuita e imediata." },
        { titulo: "Bicarbonato de sódio", descricao: "1 g por 100 L eleva KH e pH levemente. Sempre dilua em balde com água do aquário antes de adicionar. Faça em doses pequenas com intervalo de 24h." },
        { titulo: "Substrato calcário / coral / conchas", descricao: "Solução de longo prazo — dissolve lentamente e eleva pH gradualmente. Ótima para africanos. Adicione coral ao filtro para controle gradual." },
      ]},
      { titulo: "Como baixar o pH com segurança", tipo: "passos", passos: [
        { titulo: "CO₂ injetado", descricao: "Método mais preciso — cada bolha ajusta o pH naturalmente. O drop checker indica quando está no alvo." },
        { titulo: "Turfa no filtro", descricao: "Libera ácidos húmicos que abaixam pH e KH. Deixa água levemente amarelada (natural e benéfico). Processo lento — semanas para estabilizar." },
        { titulo: "Folhas de Catappa (amêndoa da praia)", descricao: "Natural, também antimicrobiano. 1–2 folhas por 100L. Repor a cada 2–3 semanas. Deixa água cor de chá — efeito desejado para amazônico." },
        { titulo: "Diluição com osmose reversa", descricao: "Misturar água da torneira com água de osmose reduz GH, KH e pH proporcionalmente. Método mais controlado para abaixar KH antes de qualquer ajuste de pH." },
      ]},
      { tipo: "alerta", texto: "NUNCA adicione produtos de pH diretamente no aquário. Sempre dilua em balde com água do aquário primeiro. Uma variação de 0,5 unidades em menos de uma hora pode matar peixes sensíveis por choque osmótico." },
      { tipo: "dica", texto: "Antes de tentar ajustar o pH, meça o KH. Se KH > 8 dKH, qualquer tentativa de baixar o pH vai falhar — a água vai 'puxar' de volta. Primeiro ajuste o KH (com osmose), depois o pH virá naturalmente." },
    ]
  },
  {
    id: "dureza", categoria: "quimica", emoji: "💧",
    titulo: "Dureza da Água — KH e GH",
    subtitulo: "Os parâmetros esquecidos que determinam o sucesso com espécies específicas",
    tags: ["GH", "KH", "dureza", "cálcio", "magnésio", "carbonato", "osmose", "remineralização"],
    conteudo: [
      { tipo: "texto", texto: "GH (General Hardness) mede a concentração de cálcio e magnésio — minerais essenciais para o metabolismo dos peixes. KH (Carbonate Hardness) mede carbonatos e bicarbonatos, que funcionam como tampão de pH. São parâmetros diferentes que fazem coisas diferentes." },
      { titulo: "GH — o que impacta", tipo: "lista", itens: [
        "Saúde das brânquias: cálcio é essencial para a barreira osmótica",
        "Reprodução: muitas espécies só reproduzem na faixa de GH correta",
        "Muda de camarões: Neocaridina e Caridina precisam de cálcio para endurecer o exoesqueleto após a muda",
        "Absorção de nutrientes pelas plantas: magnésio é componente central da clorofila",
        "GH muito baixo (< 2) causa deficiência osmótica; muito alto (> 20) estressa peixes de água mole",
      ]},
      { titulo: "KH — o tampão do pH", tipo: "texto", texto: "O KH age como 'esponja' para ácidos no aquário. Quanto mais alto o KH, mais resistente o pH é a mudanças. KH baixo (< 3 dKH) = pH instável e vulnerável a crashes noturnos. KH alto (> 12) = pH quase imutável, difícil de baixar." },
      { titulo: "Referência por biotopo", tipo: "tabela", colunas: ["Biotopo / Espécie", "GH ideal", "KH ideal", "pH típico"], linhas: [
        ["Rio Amazonas (tetras, discus)", "1–6 dGH", "1–4 dKH", "5,5–7,0"],
        ["Rio Congo (bichir, synodontis)", "4–12 dGH", "3–8 dKH", "6,0–7,5"],
        ["Comunitário tropical padrão", "6–12 dGH", "3–8 dKH", "6,5–7,5"],
        ["Lago Malawi / Tanganyika", "12–20 dGH", "10–20 dKH", "7,8–9,0"],
        ["Neocaridina (cherry, snowball)", "6–12 dGH", "4–8 dKH", "7,0–7,5"],
        ["Caridina (crystal, bee)", "4–6 dGH", "0–2 dKH", "5,8–6,8"],
        ["Plantado high-tech", "4–8 dGH", "3–5 dKH", "6,5–7,0"],
      ]},
      { titulo: "Como ajustar GH e KH", tipo: "lista", itens: [
        "Aumentar GH: cloreto de cálcio + sulfato de magnésio (sal Seachem Equilibrium), osso de sépia",
        "Aumentar KH: bicarbonato de sódio (só KH), carbonato de potássio (sem sódio)",
        "Aumentar GH+KH: pedra calcária, coral, conchas no filtro — lento mas constante",
        "Diminuir GH+KH: diluição com água de osmose reversa (RO) ou destilada",
        "Para Caridina: água RO 100% + remineralizador específico (Salty Shrimp GH/KH+)",
      ]},
      { tipo: "dica", texto: "Calcule sempre a mistura antes de adicionar ao aquário. Se sua torneira tem GH=12 e você quer GH=6, misture 50% osmose + 50% torneira. Use a regra: GH_final = (GH_torneira × vol_torneira + GH_osmose × vol_osmose) / vol_total." },
    ]
  },
  {
    id: "temperatura", categoria: "quimica", emoji: "🌡️",
    titulo: "Temperatura e Aquecimento",
    subtitulo: "Por que a estabilidade térmica é mais importante que o valor exato",
    tags: ["temperatura", "aquecedor", "verão", "ectotérmico", "ich", "estresse"],
    conteudo: [
      { tipo: "texto", texto: "Peixes são ectotérmicos — a temperatura do corpo acompanha a da água. Cada variação altera o metabolismo, a imunidade e o comportamento. Oscilações rápidas (> 2°C em poucas horas) suprimem o sistema imunológico e ativam patógenos oportunistas como o Ich." },
      { titulo: "Temperaturas por espécie/biotopo", tipo: "tabela", colunas: ["Espécie / Grupo", "Temperatura ideal", "Mínima tolerável", "Máxima tolerável"], linhas: [
        ["Discus", "28–31°C", "26°C", "33°C"],
        ["Tetras amazônicos", "24–27°C", "20°C", "30°C"],
        ["Corydoras (maioria)", "22–26°C", "18°C", "28°C"],
        ["Guppys, platies, mollies", "22–28°C", "18°C", "32°C"],
        ["Betta splendens", "24–28°C", "18°C", "32°C"],
        ["Ciclídeos africanos", "24–28°C", "22°C", "30°C"],
        ["Goldfish / Koi", "10–22°C", "0°C", "28°C"],
        ["Camarão Neocaridina", "18–24°C", "14°C", "28°C"],
        ["Camarão Caridina", "22–26°C", "20°C", "28°C"],
      ]},
      { titulo: "Escolhendo o aquecedor", tipo: "lista", itens: [
        "Potência mínima: 1W por litro para ambientes com temperatura ambiente > 20°C",
        "Potência recomendada: 2–3W por litro para maior precisão e resposta rápida",
        "Redundância para discus: dois aquecedores de metade da potência — se um queimar travado no ON, não aquece além do limite",
        "Aquecedor de cano inline: instalado na mangueira do canister — distribui calor uniformemente sem ponto quente",
        "Sempre verifique com termômetro externo — termostato interno pode ter erro de ±2°C",
      ]},
      { titulo: "Controle no verão brasileiro", tipo: "lista", itens: [
        "Ventilador de 12V sobre a superfície: reduz 3–5°C por evaporação — mais eficaz que gelo",
        "Garrafas PET congeladas: emergência — nunca deixar por mais de 30 min sem monitorar",
        "Reduzir horas de iluminação: lâmpadas LED de 60W geram calor significativo no ambiente",
        "Chiller (resfriador): solução definitiva para discus e camarão Caridina — caro mas preciso",
        "Ar-condicionado no cômodo: mais eficiente que qualquer solução no aquário",
      ]},
      { tipo: "alerta", texto: "Temperatura acima de 30°C reduz drasticamente o oxigênio dissolvido — peixes podem morrer por asfixia mesmo com filtro funcionando. Aumente a aeração nos dias quentes." },
    ]
  },

  // ═══════════════════════ MANUTENÇÃO ═════════════════════════════════════════
  {
    id: "tpa", categoria: "manutencao", emoji: "🪣",
    titulo: "Troca Parcial de Água (TPA)",
    subtitulo: "A manutenção mais simples, mais barata e mais eficaz do aquarismo",
    tags: ["TPA", "troca de água", "nitrato", "manutenção", "sifão", "desclorificador"],
    conteudo: [
      { tipo: "texto", texto: "A TPA dilui nitrato, toxinas acumuladas, hormônios de estresse, medicamentos residuais e compostos orgânicos. Repõe minerais e elementos traço que se esgotam com o tempo. É irreplacível — nenhum filtro faz o que a TPA faz." },
      { titulo: "Frequência e volume por aquário", tipo: "tabela", colunas: ["Situação", "Volume", "Frequência", "Motivo"], linhas: [
        ["Aquário leve (< 50% capacidade)", "15–20%", "A cada 10–14 dias", "Pouca carga orgânica"],
        ["Aquário normal (50–75%)", "25–30%", "Semanal", "Manutenção padrão"],
        ["Aquário denso / predadores", "30–50%", "2× por semana", "Alta produção de amônia"],
        ["Aquário novo (ciclando)", "20–30%", "A cada 2–3 dias", "Controlar amônia/nitrito"],
        ["Plantado high-tech com CO₂", "40–50%", "Semanal", "Repor nutrientes + limpar"],
        ["Aquário de camarão", "10–15%", "Semanal", "Camarões sensíveis a variação"],
        ["Aquário de discus", "30–50%", "Diária (criadores) ou semanal", "Discus exige água impecável"],
      ]},
      { titulo: "Passo a passo da TPA perfeita", tipo: "passos", passos: [
        { titulo: "Prepare a água com antecedência", descricao: "Encha o balde/reservatório. Adicione desclorificador (Seachem Prime: 1 gota/4L; Sodium Thiosulfate: seguir dose). Deixe aquecer até temperatura do aquário — use termômetro, não a mão." },
        { titulo: "Aspire o substrato com sifonador", descricao: "Introduza o sifão e percorra o substrato em linhas paralelas. Não aspire o mesmo ponto duas vezes seguidas. Alterne áreas a cada TPA — preserva bactérias do substrato." },
        { titulo: "Remova a quantidade planejada", descricao: "Aspire detritos e a água simultaneamente. Evite aspirar próximo ao filtro biológico e às plantas radicadas." },
        { titulo: "Adicione a água nova devagar", descricao: "Despeje sobre um prato ou prato raso no substrato para dissipar o fluxo. Nunca despejar diretamente no substrato — revolta e estressa os peixes." },
        { titulo: "Limpe o vidro se necessário", descricao: "Limpeza do vidro interno gera resíduos — faça antes de aspirar o substrato para remover os fragmentos junto." },
      ]},
      { tipo: "alerta", texto: "NUNCA lave esponja ou cerâmica biológica do filtro com água da torneira — o cloro mata as bactérias nitrificantes em minutos. Use SEMPRE a água retirada do aquário durante a TPA." },
      { tipo: "dica", texto: "Crie uma rotina: mesmo dia da semana, mesmo horário. Aquários com rotina previsível têm peixes mais calmos e menos episódios de doença. Estresse por imprevisibilidade é real." },
    ]
  },
  {
    id: "filtros", categoria: "manutencao", emoji: "⚙️",
    titulo: "Filtros — Tipos, Mídias e Manutenção",
    subtitulo: "O filtro é o coração do aquário — escolha e mantenha corretamente",
    tags: ["filtro", "canister", "HOB", "esponja", "cerâmica", "biológico", "mecânico", "manutenção"],
    conteudo: [
      { tipo: "texto", texto: "O filtro tem três funções: filtração mecânica (retira partículas), biológica (bactérias convertem toxinas) e química (adsorve compostos específicos). A biológica é a mais importante — perder as bactérias é catastrófico." },
      { titulo: "Tipos de filtragem", tipo: "tabela", colunas: ["Tipo", "O que faz", "Mídia comum", "Prioridade"], linhas: [
        ["Mecânica", "Remove partículas sólidas visíveis", "Esponja grossa, lã, algodão", "Alta (protege biológica)"],
        ["Biológica", "Bactérias convertem NH₃→NO₂→NO₃", "Cerâmica, bioballs, lava rock", "Crítica"],
        ["Química", "Adsorve compostos específicos", "Carvão ativado, Purigen, zeólita", "Opcional/situacional"],
      ]},
      { titulo: "Comparativo de filtros", tipo: "tabela", colunas: ["Modelo", "Capacidade", "Manutenção", "Ideal para"], linhas: [
        ["HOB (hang-on-back)", "Baixa-Média", "Fácil (semanal)", "10–150L, iniciantes"],
        ["Canister externo", "Alta", "Média (mensal)", "80L+, peixes maiores"],
        ["Filtro interno coluna", "Baixa", "Fácil", "Nano até 60L, quarentena"],
        ["Esponja com aerador", "Baixa-Média", "Muito fácil", "Berçário, quarentena, iniciante"],
        ["Sump (caixa d'água)", "Muito alta", "Moderada", "200L+, aquários avançados"],
        ["Filtro DIY canister", "Alta", "Fácil/personalizado", "Quem quer controle total"],
      ]},
      { titulo: "Como dimensionar o fluxo", tipo: "texto", texto: "Regra geral: 5–10× o volume do aquário por hora. Aquário 100L → filtro 500–1000 L/h. Para peixes grandes e sujos (oscar, discus, aruana): 10–15×. Para aquários de camarão: 4–5× com fluxo suave (saída com spray bar ou difusor)." },
      { titulo: "Manutenção correta do filtro", tipo: "passos", passos: [
        { titulo: "Nunca limpe tudo de uma vez", descricao: "Dividir em semanas: semana 1 = mídia mecânica; semana 3 = cerâmica biológica. Alternar preserva as bactérias." },
        { titulo: "Use sempre água do aquário", descricao: "Esprema esponjas e lave cerâmica na água retirada durante a TPA. Água da torneira com cloro mata bactérias." },
        { titulo: "Carvão ativado: trocar a cada 2–4 semanas", descricao: "Carvão saturado não filtra mais — pior, pode liberar o que adsorveu. Nunca use carvão durante tratamento medicamentoso." },
        { titulo: "Purigen: regenerar com hipoclorito diluído", descricao: "Diferente do carvão, Purigen pode ser regenerado conforme instruções da embalagem — ótimo custo-benefício." },
      ]},
      { titulo: "Filtro caseiro (DIY canister)", tipo: "lista", itens: [
        "Material: caixa plástica hermética 2–5L, bomba 500–1000 L/h, mangueiras, unions de 3/4\"",
        "Camadas: algodão mecânico → esponja fina → cerâmica biológica → Purigen/carvão",
        "Custo: R$80–150 vs R$300–600 de canister comercial com capacidade equivalente",
        "Vantagem: você controla exatamente cada mídia e o fluxo entre compartimentos",
      ]},
      { tipo: "dica", texto: "Nunca desligue o filtro por mais de 2–3 horas. As bactérias aeróbicas dentro dele morrem sem oxigenação. Se o filtro ficou desligado por mais tempo, faça uma troca parcial de água e monitore amônia por 72h antes de confiar no sistema." },
    ]
  },
  {
    id: "rotina", categoria: "manutencao", emoji: "📅",
    titulo: "Rotina de Manutenção",
    subtitulo: "Checklist diário, semanal e mensal para manter o aquário perfeito",
    tags: ["rotina", "checklist", "manutenção", "diário", "semanal", "mensal", "parâmetros"],
    conteudo: [
      { tipo: "texto", texto: "Aquarismo bem-sucedido é rotina, não intervenção de crise. Um checklist consistente previne 90% dos problemas antes que aconteçam." },
      { titulo: "Check diário (2–3 minutos)", tipo: "lista", itens: [
        "✓ Contar os peixes — ausência pode indicar morte ou peixe preso em filtro",
        "✓ Verificar temperatura no termômetro externo",
        "✓ Observar comportamento: peixes na superfície? Respiração acelerada? Letargia?",
        "✓ Verificar se o filtro está circulando (nível de água, bolhas na saída)",
        "✓ Checar equipamentos: aquecedor, bomba, iluminação — luz no timer correto?",
        "✓ Alimentar a quantidade certa — o que sobrar em 2–3 minutos é excesso",
      ]},
      { titulo: "Check semanal (30–60 minutos)", tipo: "lista", itens: [
        "✓ Realizar TPA de 20–30%",
        "✓ Aspirar o substrato (alternar áreas)",
        "✓ Limpar o vidro interno com raspadeira",
        "✓ Medir parâmetros: pH, temperatura, nitrato (mínimo)",
        "✓ Remover folhas mortas de plantas",
        "✓ Verificar plantas: nutrientes adequados? Algas crescendo?",
        "✓ Podar hastes que ultrapassaram o topo",
      ]},
      { titulo: "Check mensal (1–2 horas)", tipo: "lista", itens: [
        "✓ Manutenção do filtro (alternar mecânica/biológica)",
        "✓ Teste completo de parâmetros: pH, amônia, nitrito, nitrato, GH, KH",
        "✓ Limpeza da superfície do vidro externo",
        "✓ Limpeza dos encanamentos do canister",
        "✓ Substituir carvão ativado (se usar)",
        "✓ Verificar tubos, conexões e mangueiras por algas e resíduos",
        "✓ Fotografar o aquário — acompanhar a evolução é motivador",
      ]},
      { titulo: "Check trimestral / semestral", tipo: "lista", itens: [
        "✓ Substituir lâmpadas fluorescentes (perdem PAR com o tempo mesmo acesas)",
        "✓ Calibrar termômetro com termômetro digital de referência",
        "✓ Verificar desgaste de peças do filtro (rotor, vedações)",
        "✓ Reavaliar a densidade de peixes — eles crescem",
        "✓ Renovar substrato de base de aquários plantados (a cada 2–3 anos)",
      ]},
      { tipo: "dica", texto: "Use o Diário de Parâmetros do AquaBrasil para registrar cada medição. Dados históricos revelam padrões: seu pH cai toda segunda-feira? Seu nitrato dobra em 10 dias? Esses padrões previnem crises." },
    ]
  },

  // ═══════════════════════ PEIXES ═════════════════════════════════════════════
  {
    id: "escolha-peixes", categoria: "peixes", emoji: "🐟",
    titulo: "Como Escolher os Peixes Certos",
    subtitulo: "Evite os 5 erros que matam peixes nas primeiras semanas",
    tags: ["escolha", "compatibilidade", "tamanho adulto", "temperamento", "superpopulação", "zona"],
    conteudo: [
      { tipo: "texto", texto: "A maioria das mortes nos primeiros 30 dias de aquarismo vem de três erros: aquário não ciclado, superpopulação e incompatibilidade de parâmetros. Comprar o peixe certo para o seu setup é 80% do sucesso." },
      { titulo: "Os 5 erros mais comuns na escolha", tipo: "lista", itens: [
        "Ignorar o tamanho adulto: o oscar de 5 cm na loja vira 30 cm — precisa de 300L mínimo",
        "Misturar temperamentos incompatíveis: barb-tigre com betta = betta sem nadadeiras",
        "Superpopulação: mais de 1 cm de peixe adulto por litro sobrecarrega o filtro",
        "Ignorar zona de natação: 5 espécies de fundo competindo por território causa estresse crônico",
        "Comprar espécies incompatíveis com a água da sua torneira sem saber como corrigir",
      ]},
      { titulo: "Regra das zonas de natação", tipo: "lista", itens: [
        "Superfície: bettas, gurâmis, peixe-arco-íris, killifish, lebiste — precisam acessar o ar",
        "Meia água: tetras, barros, danios, rasboras, a maioria dos cardumes",
        "Fundo: corydoras, cascudos, loaches, kuhli — não competem com os do meio",
        "Distribuir em 3 zonas = aquário visualmente equilibrado + menos conflito territorial",
        "Evitar > 2 espécies disputando o mesmo nível do aquário",
      ]},
      { titulo: "Cálculo de capacidade (regra prática)", tipo: "lista", itens: [
        "Regra básica: 1 cm de peixe adulto por litro de água líquida",
        "Para peixes de 5 cm: aquário de 100L comporta ≈ 20 peixes (1 cm × 20 = 20 cm total)",
        "Para peixes de 15 cm+: use 10–20L por cm de peixe adulto",
        "Subtraia 20% para substrato, decoração e plantas do volume total do aquário",
        "Peixes tímidos: menos peixes em espaço maior = menos estresse",
      ]},
      { titulo: "Parâmetros que devem coincidir", tipo: "tabela", colunas: ["Parâmetro", "Por que importa", "Consequência do erro"], linhas: [
        ["Temperatura", "Metabolismo e imunidade dependem dela", "Imunossupressão, doenças oportunistas"],
        ["pH", "Equilíbrio ácido-base do sangue", "Estresse, falha osmoregulatória"],
        ["GH", "Transporte de íons pelas brânquias", "Edema, problemas de muda (camarão)"],
        ["Temperamento", "Convivência pacífica", "Agressão, peixes sem nadadeiras, mortes"],
        ["Tamanho adulto", "Predação e território", "Peixes 'comem' peixes menores"],
      ]},
      { tipo: "dica", texto: "Use o verificador de compatibilidade do AquaBrasil antes de qualquer compra. Verifique: temperatura, pH, GH e temperamento de cada espécie que você já tem com a que quer adicionar." },
    ]
  },
  {
    id: "alimentacao", categoria: "peixes", emoji: "🍽️",
    titulo: "Alimentação Correta dos Peixes",
    subtitulo: "Tipo de alimento, frequência e como evitar a superalimentação",
    tags: ["alimentação", "ração", "overfeeding", "artêmia", "bloodworm", "onívoro", "carnívoro", "herbívoro"],
    conteudo: [
      { tipo: "texto", texto: "A superalimentação é a causa nº1 de degradação da qualidade da água. Alimento não consumido decompõe e gera amônia diretamente. A regra de ouro: alimente o que os peixes consomem em 2–3 minutos, 1–2 vezes por dia." },
      { titulo: "Tipos de dieta por grupo", tipo: "tabela", colunas: ["Grupo", "Dieta", "Alimentos principais", "Suplemento"], linhas: [
        ["Tetras, danios, barros", "Onívoro", "Ração flocos, micro pellet", "Artêmia, dáfnia 2-3x/semana"],
        ["Corydoras", "Onívoro de fundo", "Tablete afundante, ração fundo", "Bloodworm, spirulina"],
        ["Pleco / Cascudo", "Herbívoro/Onívoro", "Tablete de algas, espinafre, abobrinha", "Proteína 1-2x/semana"],
        ["Oscar, ciclídeo grande", "Carnívoro/Onívoro", "Pellet grande, camarão, minhoca", "Peixe esporadicamente"],
        ["Discus", "Onívoro especializado", "Coração bovino, ração discus", "Artêmia viva, bloodworm"],
        ["Betta", "Carnívoro", "Pellet específico para betta", "Artêmia, bloodworm, dáfnia"],
        ["Camarão", "Detritívoro/Algívoro", "Biofilme, algas, tablete espirulina", "Folha de amêndoa, legumes cozidos"],
      ]},
      { titulo: "Frequência por fase de vida", tipo: "lista", itens: [
        "Alevinos (< 3 meses): 3–5 vezes por dia em pequenas quantidades — crescimento acelerado",
        "Juvenis (3–12 meses): 2–3 vezes por dia",
        "Adultos: 1–2 vezes por dia — a maioria das espécies",
        "Grandes carnívoros (oscar, aruana): 1 vez por dia ou em dias alternados",
        "Dia de jejum semanal: limpa o trato digestivo e reduz nitrato",
      ]},
      { titulo: "Alimentos vivos e congelados", tipo: "lista", itens: [
        "Artêmia nauplius (baby brine shrimp): melhor para alevinos e peixes nano",
        "Artêmia adulta: excelente proteína para qualquer peixe de tamanho médio",
        "Bloodworm (larva de mosquito): alta proteína — não usar diariamente para Betta (causa constipação)",
        "Dáfnia: bom digestivo natural, baixo valor proteico",
        "Minhoca: excelente para ciclídeos e peixes maiores",
        "Alimentos vivos podem trazer parasitas — prefira congelados de procedência conhecida",
      ]},
      { tipo: "alerta", texto: "Sinais de superalimentação: água turva e leitosa, substrato escuro e fedorento, algas em explosão, nitrato subindo rapidamente. Reduza imediatamente a alimentação e faça uma TPA emergencial de 30%." },
    ]
  },
  {
    id: "reproducao", categoria: "peixes", emoji: "🥚",
    titulo: "Reprodução em Aquário",
    subtitulo: "Princípios gerais para estimular e acompanhar a reprodução",
    tags: ["reprodução", "desova", "alevinos", "casal", "berçário", "hormônio", "fry"],
    conteudo: [
      { tipo: "texto", texto: "Reprodução em aquário indica que os peixes estão bem — parâmetros corretos, alimentação adequada e ausência de estresse. Cada grupo tem comportamento reprodutivo distinto." },
      { titulo: "Tipos reprodutivos", tipo: "tabela", colunas: ["Tipo", "Exemplos", "Cuidado parental", "Estratégia no aquário"], linhas: [
        ["Vivíparos", "Guppy, molly, platy, espada", "Nenhum — comem os filhotes", "Remover adultos ou usar separador"],
        ["Ovíparos em substrato", "Corydoras, tetras, danios", "Nenhum ou mínimo", "Separar ovos ou usar aquário dedicado"],
        ["Cuidadores de ovos", "Discus, oscar, ciclídeos", "Intenso — protegem a prole", "Aquário dedicado para o casal"],
        ["Incubadores bucais", "Mbunas, geofagus", "Fêmea carrega ovos na boca", "Não estressar a fêmea"],
        ["Construtores de bolha", "Betta, gourami", "Macho constrói ninho na superfície", "Instalar antes do casal"],
      ]},
      { titulo: "Estimulando a reprodução", tipo: "lista", itens: [
        "Simular estação chuvosa: 30–50% de TPA com água levemente mais fria — gatilho natural",
        "Aumentar proteína na alimentação por 2 semanas antes",
        "Garantir que machos e fêmeas estejam maduros (6–12 meses para maioria)",
        "Esconderijos suficientes: reduz estresse e dá locais para desova",
        "pH e temperatura na faixa ideal específica da espécie",
      ]},
      { titulo: "Cuidando dos alevinos", tipo: "passos", passos: [
        { titulo: "Separar para sobreviver", descricao: "Na maioria das espécies, alevinos em aquário comunitário viram alimento. Use aquário de berçário de 20–30L." },
        { titulo: "Alimentação inicial", descricao: "Primeiros 3–5 dias: infusórios, pó de gema de ovo cozida ou ração micropulverizada. Após 1 semana: artêmia nauplius recém-eclodida." },
        { titulo: "Qualidade de água impecável", descricao: "Alevinos são extremamente sensíveis a amônia. TPA pequenas (10–15%) diárias ou em dias alternados. Filtro de esponja suave — sifão de canister pode engolir." },
        { titulo: "Crescimento por 4–8 semanas", descricao: "Quando atingirem 50% do tamanho dos menores peixes do aquário principal, podem ser introduzidos." },
      ]},
    ]
  },

  // ═══════════════════════ PLANTAS & AQUASCAPING ═══════════════════════════════
  {
    id: "plantas-basico", categoria: "plantas", emoji: "🌿",
    titulo: "Plantas Aquáticas — Fundamentos",
    subtitulo: "Por que plantar, como começar e as espécies mais fáceis",
    tags: ["plantas", "anubias", "java fern", "vallisneria", "musgo", "sem CO₂", "iniciante"],
    conteudo: [
      { tipo: "texto", texto: "Plantas não são apenas decoração — são parte vital do ecossistema. Absorvem amônia, nitrato e fósforo diretamente; competem com algas por luz e nutrientes; oxigenam a água durante o dia; e criam refúgio que reduz o estresse dos peixes." },
      { titulo: "Plantas para aquário sem CO₂", tipo: "tabela", colunas: ["Planta", "Posição", "Luz", "Dica"], linhas: [
        ["Anúbias (barteri, nana)", "Midground/foreground", "Baixa", "Fixar em madeira/pedra — nunca plantar o rizoma"],
        ["Java Fern (Microsorum pteropus)", "Midground", "Baixa", "Fixar em madeira — variedades: windelov, trident, narrow"],
        ["Java Moss (Taxiphyllum barbieri)", "Musgo", "Baixa-média", "Fixar com linha em pedra — excelente para camarão"],
        ["Vallisnéria spiralis", "Background", "Média", "Aguenta água alcalina — ótima para africanos"],
        ["Higróphila polysperma", "Background", "Baixa", "A mais fácil do aquarismo — cresce em qualquer condição"],
        ["Ceratophyllum (rabo-de-raposa)", "Background/flutuante", "Baixa", "Flutua ou ancora — absorve nitrato agressivamente"],
        ["Echinodorus (espada)", "Background", "Média", "Substrate fertilizer acelera muito o crescimento"],
        ["Ludwigia repens", "Midground", "Média-alta", "Fica vermelha com boa luz — sem CO₂ funciona"],
      ]},
      { titulo: "Plantas para aquário com CO₂", tipo: "lista", itens: [
        "HC Cuba (Hemianthus callitrichoides): tapete minúsculo, muito exigente",
        "Monte Carlo (Micranthemum tweediei): tapete mais fácil que HC, tolera sem CO₂ com luz boa",
        "Staurogyne repens: foreground compacto nativo do Brasil",
        "Rotala macrandra: a mais bela planta vermelha — exige CO₂ injetado",
        "Glossostigma elatinoides: tapete clássico do Nature Aquarium",
        "Lilaeopsis brasiliensis: micro-espada brasileira para foreground",
      ]},
      { titulo: "O que as plantas precisam", tipo: "tabela", colunas: ["Recurso", "Low-tech", "Mid-tech", "High-tech"], linhas: [
        ["Luz (PAR)", "20–50 μmol", "50–150 μmol", "150–300 μmol"],
        ["CO₂", "Não obrigatório", "Recomendado", "Injetado essencial"],
        ["Macro (N,P,K)", "Peixes suprem", "Fertilizante semanal", "Dosagem diária"],
        ["Micro (Fe, Mn)", "Pequena dose", "Fertilizante específico", "Formulação completa diária"],
        ["Substrato", "Qualquer areia inerte", "Nutritivo ajuda", "Amazonia/Controsoil"],
      ]},
      { tipo: "alerta", texto: "A causa nº1 de algas não é falta de CO₂ — é EXCESSO DE LUZ sem quantidade de plantas suficiente para consumir os nutrientes. Comece com luz moderada (8h/dia) e aumente gradualmente conforme as plantas crescem." },
    ]
  },
  {
    id: "fertilizacao", categoria: "plantas", emoji: "🧪",
    titulo: "Fertilização de Plantas Aquáticas",
    subtitulo: "Macro, micro, NPK e como fertilizar sem explodir de algas",
    tags: ["fertilizante", "NPK", "ferro", "deficiência", "macro", "micro", "EI", "PPS"],
    conteudo: [
      { tipo: "texto", texto: "Plantas precisam de 17 elementos essenciais. Os macros (N, P, K) são consumidos em maior quantidade; os micros (Fe, Mn, Cu, Zn, Bo, Mo) em doses menores mas igualmente essenciais. Deficiência de qualquer elemento limita o crescimento geral." },
      { titulo: "Reconhecendo deficiências", tipo: "tabela", colunas: ["Sintoma", "Elemento deficiente", "Causa comum", "Correção"], linhas: [
        ["Folhas velhas ficam amarelas", "Nitrogênio (N)", "Poucas fezes, pouca ração", "Fertilizante N ou ração extra"],
        ["Folhas novas ficam amarelas", "Ferro (Fe)", "pH alto limita absorção", "Ferro quelado, baixar pH"],
        ["Buracos nas folhas velhas", "Potássio (K)", "Falta de K no fertilizante", "Fertilizante com K"],
        ["Folhas novas deformadas/pequenas", "Cálcio ou Boro", "Água muito mole", "Aumentar GH levemente"],
        ["Crescimento lento geral", "Luz insuficiente ou CO₂", "Setup inadequado", "Aumentar luz ou adicionar CO₂"],
        ["Folhas ficam transparentes", "Potássio severo ou CO₂", "Deficiência grave", "Ação imediata"],
      ]},
      { titulo: "Métodos de fertilização", tipo: "lista", itens: [
        "EI (Estimative Index): dose generosa diária de macro + micro, TPA semanal de 50% para resetar — simples e eficaz",
        "PPS-Pro: dose calibrada baseada na demanda real — menos TPA, mais controle",
        "ADA Takashi Amano: fertilizante específico da linha ADA — Brighty K, Step, Green Brighty",
        "NPK líquido DIY: comprar macro e micro em pó e dosar manualmente — mais barato",
        "Substrato nutritivo de base: fertilização lenta pela raiz — ótima para Echinodorus, Cryptocoryne",
      ]},
      { titulo: "Rotina EI básica (método mais simples)", tipo: "passos", passos: [
        { titulo: "Seg/Qua/Sex: fertilizante macro", descricao: "Dose de NPK segundo instrução. Nitrato (NO₃), Fosfato (PO₄), Potássio (K) — macros que as plantas consomem em maior quantidade." },
        { titulo: "Ter/Qui/Sáb: fertilizante micro", descricao: "Dose de traço com ferro quelado (EDTA ou DTPA), manganês, zinco, boro, molibdênio. Ferro é o mais limitante — folhas novas amarelam sem ele." },
        { titulo: "Dom: TPA de 40–50%", descricao: "Reset semanal evita acúmulo de qualquer elemento. Dá folha em branco para a semana seguinte." },
      ]},
      { tipo: "dica", texto: "Se aparecerem algas com EI, não reduza o fertilizante — reduza a LUZ ou aumente as PLANTAS. Algas competindo com plantas por nutrientes indica falta de biomassa vegetal, não excesso de nutrientes." },
    ]
  },
  {
    id: "aquapaisagismo", categoria: "plantas", emoji: "🎨",
    titulo: "Aquapaisagismo — Estilos e Composição",
    subtitulo: "Nature, Iwagumi, Dutch, Biotopo e os princípios de design",
    tags: ["aquascaping", "nature aquarium", "iwagumi", "dutch", "biotopo", "composição", "regra dos terços"],
    conteudo: [
      { tipo: "texto", texto: "Aquapaisagismo é a arte de criar paisagens subaquáticas intencionais. Mais do que estética, cada escola tem filosofia própria sobre como representar a natureza ou criar harmonia visual." },
      { titulo: "Escolas e suas características", tipo: "tabela", colunas: ["Escola", "Origem", "Filosofia", "Plantas típicas", "Dificuldade"], linhas: [
        ["Nature Aquarium", "Japão (Amano)", "Wabi-sabi — beleza imperfeita da natureza", "Musgo, MC, rotala, staurogyne", "Alta"],
        ["Iwagumi", "Japão (Amano)", "Minimalismo extremo — pedras como montanhas", "Apenas musgo e grama (HC/MC)", "Muito alta"],
        ["Dutch", "Países Baixos", "Plantas como quadros — cor e textura organizadas", "Hygrophila, rotala, echinodorus", "Alta"],
        ["Biotopo", "Europa/EUA", "Réplica exata de ambiente real específico", "As mesmas da natureza local", "Média-Alta"],
        ["Jungle Style", "Global", "Crescimento exuberante e 'selvagem'", "Qualquer planta vigorosa", "Média"],
        ["Paludário", "Global", "Parte submersa + emersa (plantas + terra)", "Terrestre + aquática", "Média"],
      ]},
      { titulo: "Princípios de composição", tipo: "lista", itens: [
        "Regra dos terços: ponto focal no cruzamento das linhas (a 1/3 do lado), nunca no centro",
        "Regra do ímpar: 3, 5 ou 7 pedras/madeiras — números pares criam simetria artificial",
        "Proporção áurea (phi 1.618): a divisão mais harmoniosa do espaço — ponto focal a 61,8%",
        "Perspectiva: plantas altas no fundo, baixas na frente; substrato mais alto nas laterais",
        "Contraste: folha fina ao lado de folha larga; vermelho ao lado de verde",
        "Textura: musgo rugoso ao lado de anúbias lisa — interesse tátil visual",
      ]},
      { titulo: "Materiais para aquascaping", tipo: "lista", itens: [
        "Dragon Stone (Ohko): cor terra, porosa, não altera parâmetros — mais usada no mundo",
        "Seiryu Stone: azul-acinzentada, eleva pH e KH — cuidado em aquários ácidos",
        "Lava Rock: porosa, ótima para musgo, leve, não altera parâmetros",
        "Manzanita / Azalea root: galhos finos e tortuosos — efeito de árvore morta",
        "Catappa/Mopani: madeira densa, libera taninos — abaixa pH levemente",
        "Substrato ADA Amazonia: o padrão-ouro — ácido, nutritivo, ideal para high-tech",
      ]},
      { tipo: "dica", texto: "Antes de montar, faça a composição em seco sobre uma mesa e fotografe de vários ângulos simulando a perspectiva do aquário. Monte apenas quando estiver 100% satisfeito — reposicionar pedras dentro d'água com plantas é muito difícil." },
    ]
  },

  // ═══════════════════════ SAÚDE & TRATAMENTO ═════════════════════════════════
  {
    id: "quarentena", categoria: "saude", emoji: "🛡️",
    titulo: "Quarentena — O Hábito que Salva Aquários",
    subtitulo: "Como isolar, observar e tratar peixes novos antes de introduzir",
    tags: ["quarentena", "doença", "parasita", "ich", "isolamento", "tratamento preventivo", "tanque"],
    conteudo: [
      { tipo: "texto", texto: "Quarentena é isolar peixes novos por 3–4 semanas antes do aquário principal. É a medida preventiva mais eficaz do aquarismo — evita que um único peixe infectado destrua um aquário que levou meses para estabelecer." },
      { titulo: "Por que quarentenar SEMPRE", tipo: "lista", itens: [
        "Peixes de loja vivem em sistemas compartilhados — se um tanque tem doença, todos os peixes da loja estão expostos",
        "Ich, veludo, flukes e columnaris podem levar 1–3 semanas para manifestar sintomas",
        "Um peixe infectado pode contaminar todo o aquário principal em 24–48 horas",
        "Tratar doenças no aquário principal significa: medicamento + morte de bactérias + impacto nas plantas",
        "Custo do tanque de quarentena: R$100–200. Custo de perder um aquário: R$1.000+",
      ]},
      { titulo: "Montando o tanque de quarentena", tipo: "passos", passos: [
        { titulo: "Tanque de 30–60L sem substrato", descricao: "Fundo nu facilita limpeza e observação de parasitas caídos. Pode ser caixa plástica opaca." },
        { titulo: "Filtro de esponja biopurado", descricao: "Mantenha sempre uma esponja extra no filtro do aquário principal. Transferir para a quarentena = tanque ciclado instantaneamente." },
        { titulo: "Aquecedor e termômetro", descricao: "Temperatura idêntica ao aquário de destino — diferença estressaria o peixe recém-chegado." },
        { titulo: "Esconderijos simples", descricao: "Tubos PVC ou vasos de cerâmica. Peixe escondido = menos estressado = sintomas aparecem mais rápido." },
        { titulo: "Observar diariamente por 21–30 dias", descricao: "Sinais de alerta: pontos brancos, respiração rápida, nadadeiras presas ao corpo, recusa de alimento, coceira (esfregando no substrato)." },
      ]},
      { titulo: "Tratamento preventivo opcional", tipo: "lista", itens: [
        "Praziquantel (dose preventiva): elimina flukes e vermes — eficaz e seguro, recomendado para todos os peixes novos",
        "Temperatura 30°C por 10 dias: elimina Ich sem medicamento — para espécies que toleram",
        "Banho de sal 1–2 g/L por 20 min: reduz carga de parasitas externos",
        "Metronidazol no alimento: protozoários internos — apenas se suspeitar de hexamita ou spironucleus",
      ]},
      { tipo: "alerta", texto: "NUNCA use rede, sifão ou qualquer equipamento do tanque de quarentena no aquário principal sem desinfetar. Hipoclorito de sódio 1% por 10 minutos — depois enxaguar bem e secar." },
    ]
  },
  {
    id: "doencas", categoria: "saude", emoji: "💊",
    titulo: "Doenças Comuns e Como Tratar",
    subtitulo: "Diagnóstico visual e tratamento das principais doenças",
    tags: ["ich", "ponto branco", "veludo", "columnaris", "fungo", "flukes", "tratamento", "medicamento"],
    conteudo: [
      { tipo: "texto", texto: "A maioria das doenças de aquário é causada por oportunistas — sempre presentes na água, mas que só atacam quando o peixe está imunossuprimido. Corrigir a causa (temperatura errada, má qualidade de água, estresse) é tão importante quanto o medicamento." },
      { titulo: "Guia de diagnóstico", tipo: "tabela", colunas: ["Sintoma visual", "Diagnóstico provável", "Tratamento", "Urgência"], linhas: [
        ["Pontos brancos como areia (corpo todo)", "Ich (Ichthyophthirius)", "30°C × 10 dias OU verde-malaquita", "Alta"],
        ["Poeira dourada ou cinza fina", "Veludo (Oodinium)", "Cobre + escuridão total 3 dias", "Muito alta"],
        ["Algodão branco na boca/corpo", "Columnaris (bactéria)", "Kanamicina ou nitrofurazona", "Alta"],
        ["Algodão branco em feridas/feridas abertas", "Fungo (Saprolegnia)", "Azul de metileno, sal, Pimafix", "Média"],
        ["Escamas arrepiadas como pinha", "Dropsy (infecção interna)", "Kanamicina + isolamento", "Muito alta (prognóstico ruim)"],
        ["Coceira constante, muco excessivo", "Flukes (monogeneas)", "Praziquantel", "Alta"],
        ["Fezes brancas, emagrecimento", "Verme interno", "Metronidazol + levamisol na ração", "Média"],
        ["Nadadeiras corroídas", "Fin rot (bacteriano)", "Sal + antibiótico suave, melhora da água", "Média"],
        ["Barriga inchada sem escamas arrepiadas", "Constipação ou parasita", "Pea test + jejum", "Baixa"],
      ]},
      { titulo: "Protocolo de tratamento", tipo: "passos", passos: [
        { titulo: "Isolar o peixe doente", descricao: "Transfira para o tanque de quarentena. Tratamento no aquário principal contamina bactérias do filtro e prejudica plantas." },
        { titulo: "Remover o carvão ativado", descricao: "Carvão adsorve medicamentos, tornando o tratamento ineficaz. Remova sempre antes de qualquer medicação." },
        { titulo: "Aumentar a aeração", descricao: "Maioria dos medicamentos reduz oxigênio dissolvido. Coloque aerador adicional durante o tratamento." },
        { titulo: "TPA de 30% antes de medicar", descricao: "Reduz matéria orgânica que interfere na eficácia dos medicamentos." },
        { titulo: "Completar o ciclo completo", descricao: "Nunca interromper antes do tempo indicado — mesmo se o peixe parecer curado. Dose incompleta favorece resistência e recidiva." },
      ]},
      { titulo: "Medicamentos para ter em casa", tipo: "lista", itens: [
        "Verde-malaquita: Ich, fungos externos, protozoários — toxic para invertebrados e pulmões (usar ao ar livre)",
        "Azul de metileno: fungos, antiséptico, ovos — excelente para feridas",
        "Sal de aquário (NaCl sem iodo): suporte osmótico geral, auxiliar em muitos tratamentos",
        "Praziquantel: vermes, flukes — preventivo na quarentena de todo peixe novo",
        "Metronidazol: protozoários internos (hexamita, spironucleus) — flagelados",
        "Kanamicina ou eritromicina: infecções bacterianas graves — columnaris, dropsy",
      ]},
      { tipo: "alerta", texto: "NUNCA use antibióticos sem diagnóstico claro. Resistência bacteriana em aquários é real e pode afetar bactérias do filtro. Reserve antibióticos para quando a identificação for certa." },
    ]
  },
  {
    id: "controle-algas", categoria: "saude", emoji: "🦠",
    titulo: "Controle de Algas",
    subtitulo: "Identifique o tipo, corrija a causa, use controle biológico",
    tags: ["algas", "BBA", "barba negra", "filamentosa", "cianobactéria", "diatomácea", "SAE", "controle"],
    conteudo: [
      { tipo: "texto", texto: "Algas são um sintoma de desequilíbrio no aquário — não o problema em si. Combater a alga sem corrigir a causa é trabalho eterno. O triângulo do equilíbrio: luz + CO₂ + nutrientes devem estar proporcionais entre si." },
      { titulo: "Diagnóstico por tipo de alga", tipo: "tabela", colunas: ["Tipo", "Aparência", "Causa raiz", "Solução principal"], linhas: [
        ["Ponto verde (GDA)", "Pontos verdes duros no vidro", "Excesso de luz + nutrientes", "Raspar + reduzir horas de luz"],
        ["Filamentosa verde", "Fios verdes longos e brancos", "Excesso de N+P + luz", "SAE, camarão Amano, podar manual"],
        ["Barba negra (BBA)", "Tufos pretos nas bordas de folhas", "CO₂ instável ou insuficiente", "Estabilizar CO₂, SAE, glutamato direto"],
        ["Cianobactéria", "Tapete azul-esverdeado, cheiro ruim", "Nitrato muito baixo + fluxo fraco", "Eritromicina, aumentar NO₃, mais fluxo"],
        ["Diatomácea (marrom)", "Camada marrom suave no substrato", "Aquário novo, pouca luz", "Otocinclus, mais luz — desaparece sozinha"],
        ["Água verde (GSA)", "Água turva verde opaca", "Alga unicelular em suspensão", "Esterilizador UV, TPA 50%, escuridão 3 dias"],
        ["Cladophora", "Alga verde-escura, rígida, difícil", "Água dura + luz", "Manual + trovoadas de CO₂"],
      ]},
      { titulo: "Os 5 pilares do controle preventivo", tipo: "lista", itens: [
        "1. CO₂ estável: a variação de CO₂ é a principal causa de BBA — use drop checker e timer no solenoide",
        "2. Timer de luz rígido: 8 horas exatas por dia — acima disso favorece algas sem benefício adicional às plantas",
        "3. Fertilização balanceada: falta de macro (especialmente K) cria desequilíbrio que favorece algas específicas",
        "4. TPA semanal: dilui compostos acumulados que criam ambiente propício para algas oportunistas",
        "5. Cobertura vegetal alta: plantas densas esgotam nutrientes antes que as algas possam usar",
      ]},
      { titulo: "Controle biológico — os melhores algívoros", tipo: "tabela", colunas: ["Animal", "Especialidade", "Quantia por 100L", "Cuidado"], linhas: [
        ["SAE (Crossocheilus siamensis)", "Barba negra + filamentosas", "2–3", "Cuidado com falso SAE"],
        ["Camarão Amano (Caridina multidentata)", "Filamentosas finas, todas as algas", "5–10", "Não reproduz em água doce"],
        ["Camarão Neocaridina", "Algas rasas, biofilme", "10–20", "Sensível a medicamentos com cobre"],
        ["Otocinclus", "Diatomácea, alga verde rasa, veludo de vidro", "3–5", "Sensível — só em aquário estabelecido"],
        ["Pleco Ancistrus", "Algas em vidro e madeira", "1", "Pode raspar plantas macias"],
        ["Neritina zebra", "Vidro e decoração", "2–3", "Não se reproduz em água doce"],
      ]},
      { tipo: "dica", texto: "Técnica para barba negra (BBA): com seringa, aplique glutamato de sódio (MSG) puro 3× concentrado diretamente na alga, sem movimentar a água. Aguarde 10 minutos antes de ligar o filtro. A BBA ficará rosa/vermelha em 24h e morrerá. Cuidado com camarões nas proximidades." },
    ]
  },

  // ═══════════════════════ DICAS RÁPIDAS ══════════════════════════════════════
  {
    id: "dicas-agua", categoria: "dicas", emoji: "💡",
    titulo: "Dicas de Qualidade da Água",
    subtitulo: "Truques práticos para manter a água perfeita",
    tags: ["dicas", "qualidade", "água", "amônia", "nitrato", "turva", "espuma", "cheiro"],
    conteudo: [
      { titulo: "Água turva branca", tipo: "texto", texto: "Turbidez leitosa logo após montar o aquário indica bloom bacteriano — completamente normal. As bactérias heterotróficas proliferam antes das nitrificantes. Não troque toda a água — piora o problema. Simplesmente aguarde 3–5 dias." },
      { titulo: "Água turva amarela ou marrom", tipo: "texto", texto: "Indica liberação de taninos de madeira nova (normal e seguro) ou alga unicelular. Se for tanino: coloque carvão ativado temporariamente ou simplesmente aguarde. Se for alga: escuridão total por 3 dias + TPA 50%." },
      { titulo: "Espuma na superfície", tipo: "texto", texto: "Espuma persistente indica alta concentração de proteínas orgânicas — geralmente excesso de alimentação ou peixe morto. Faça TPA e reduza alimentação. Espuma passageira após TPA é normal." },
      { titulo: "Cheiro forte do aquário", tipo: "texto", texto: "Aquário saudável tem cheiro neutro ou levemente terroso (saudável). Cheiro de ovo podre = anaeróbico no substrato — sifone fundo imediatamente. Cheiro de peixe forte = amônia alta ou peixe morto. Cheiro adocicado = cianobactéria." },
      { titulo: "Dicas rápidas essenciais", tipo: "lista", itens: [
        "Nunca adicione mais de 20% de peixes novos de uma vez — mini-ciclo é real",
        "Sempre aclimate por temperatura antes de soltar o peixe (sacolinhas flutuando por 15 min)",
        "pH da água nova deve ser semelhante ao do aquário — diferença > 0,5 causa choque",
        "Prime (Seachem) detoxifica amônia por 24h — ótimo para emergências durante ciclagem",
        "Folha de louro seca no aquário: antimicrobiano suave, abaixa pH levemente, naturalmente",
        "Pedra de argila cerâmica absorve nutrientes — cuidado em aquários plantados",
        "Teste seus reagentes contra água destilada periodicamente — kits antigos dão leituras erradas",
      ]},
    ]
  },
  {
    id: "dicas-peixes", categoria: "dicas", emoji: "🐠",
    titulo: "Dicas do Dia a Dia com os Peixes",
    subtitulo: "Comportamento, estresse, truques e observações importantes",
    tags: ["dicas", "comportamento", "estresse", "aclimatação", "peixe doente", "sinais", "observação"],
    conteudo: [
      { titulo: "Sinais de peixe saudável", tipo: "lista", itens: [
        "✓ Nada ativamente e explora o aquário regularmente",
        "✓ Come com entusiasmo — peixe que recusa comida está doente ou estressado",
        "✓ Nadadeiras abertas e íntegras (não dobradas ou coladas ao corpo)",
        "✓ Olhos brilhantes e limpos (não opacos ou saltados)",
        "✓ Cores vivas — cores apagadas indicam estresse ou doença",
        "✓ Presença na escola (espécies de cardume que ficam sozinhas estão mal)",
      ]},
      { titulo: "Sinais de peixe doente ou estressado", tipo: "lista", itens: [
        "⚠ Fica parado no fundo ou na superfície sem se mover",
        "⚠ Respiração acelerada ou boca na superfície (falta de O₂ ou intoxicação)",
        "⚠ Esfrega o corpo contra decorações (parasitas externos)",
        "⚠ Mancha ou textura estranha no corpo",
        "⚠ Barriga inchada ou escamas arrepiadas",
        "⚠ Comportamento agressivo repentino em peixe normalmente calmo (dor ou hormônios)",
      ]},
      { titulo: "Aclimatação correta de peixe novo", tipo: "passos", passos: [
        { titulo: "Flutuação de temperatura (15–20 min)", descricao: "Coloque a sacola fechada na superfície do aquário. O peixe se acostuma com a temperatura gradualmente." },
        { titulo: "Adição gradual de água do aquário", descricao: "Abra a sacola e adicione 1/4 da água do aquário. Aguarde 5 min. Repita 2–3 vezes. Isso aclimata pH e GH." },
        { titulo: "Transfira o peixe sem a água da loja", descricao: "Use uma rede para pegar o peixe e descarte a água da sacola — ela pode trazer patógenos." },
        { titulo: "Mantenha as luzes apagadas por 2h", descricao: "Reduz estresse nos primeiros momentos. Peixe estressado é vulnerável." },
      ]},
      { titulo: "Truques práticos", tipo: "lista", itens: [
        "Betta solitário? Coloque espelho por 5 min por dia — estimulação comportamental",
        "Peixe novo se escondendo: normal por 1–2 semanas — não force a interação",
        "Corydoras sempre na superfície: déficit de O₂ ou CO₂ alto — aumente aeração",
        "Peixe salta: cobertura obrigatória para bettas, arawanas, rainbowfish",
        "Loach deitado de lado: comportamento normal de descanso — não é morte",
        "Peixes na escuridão total param de comer — 8h de luz é o mínimo para comportamento saudável",
      ]},
    ]
  },
  {
    id: "dicas-plantas", categoria: "dicas", emoji: "🌱",
    titulo: "Dicas Rápidas de Plantas",
    subtitulo: "Truques práticos para plantas mais saudáveis",
    tags: ["dicas", "plantas", "poda", "pearling", "melhor crescimento", "deficiência", "fixar"],
    conteudo: [
      { titulo: "Como fixar anúbias e java fern", tipo: "texto", texto: "Use linha de pesca (nylon transparente 0,20mm) ou cola de gel cianocrilato (Super Bonder gel) para fixar rizoma em madeira ou pedra. O cianocrilato é totalmente seguro em aquário após secar — forma um produto inerte não tóxico." },
      { titulo: "Pearling — o sinal de saúde", tipo: "texto", texto: "Bolhas de oxigênio saindo das folhas durante o dia (pearling) indica fotossíntese ativa — sinal muito positivo. Ocorre quando há CO₂, luz e nutrientes suficientes em conjunto. Um aquário com pearling intenso é um aquário saudável." },
      { titulo: "Poda correta de hastes", tipo: "lista", itens: [
        "Sempre corte a haste logo acima de um nó (onde saem folhinhas laterais)",
        "A parte de cima (com folhas novas): replantar no substrato = nova planta",
        "A parte de baixo (raiz): normalmente vai brotar novamente da raiz",
        "Podar 30% de cada vez — podar tudo cria vácuo de nutrientes que favorece algas",
        "Faça a poda antes da TPA — partículas geradas são removidas pelo sifão",
      ]},
      { titulo: "Truques essenciais", tipo: "lista", itens: [
        "Anúbias ficou com algas nas folhas? Tire do aquário e coloque em balde com água e cloro diluído 1% por 5 min — limpa as algas sem matar a planta. Enxaguar bem antes de devolver.",
        "Plantas novas perdendo folhas na primeira semana: transição submersas/emersas — normal. Aguarde 2 semanas para brotação submersa.",
        "Monte Carlo não fazendo tapete? Plante em grupos menores espaçados (2–3cm entre si) para estimular crescimento lateral.",
        "Java moss amarelando: provavelmente em fluxo de água forte demais — mover para área de menos correnteza.",
        "Vallisnéria derretendo: CO₂ líquido direto na água pode matar vallisnéria — usar buffer ou CO₂ injetado apenas.",
      ]},
      { tipo: "dica", texto: "Fotografe seu aquário toda semana no mesmo horário e mesmo ângulo. Além de acompanhar a evolução, as fotos revelam problemas graduais (algas crescendo lentamente, plantas perdendo vigor) que os olhos acostumados não percebem." },
    ]
  },
  {
    id: "dicas-compra", categoria: "dicas", emoji: "🛒",
    titulo: "Dicas para Compra Consciente",
    subtitulo: "Como escolher um peixe saudável na loja e evitar armadilhas",
    tags: ["dicas", "compra", "loja", "peixe saudável", "verificar", "evitar", "responsabilidade"],
    conteudo: [
      { titulo: "Como avaliar um peixe na loja", tipo: "lista", itens: [
        "✓ Observe o tanque ANTES do peixe — água turva, mortos, outros doentes = não compre nada desse tanque",
        "✓ Peixe saudável: ativo, nadadeiras abertas, olhos brilhantes, sem manchas",
        "✓ Peça para ver o peixe comer — peixe que recusa comida está doente",
        "✓ Verifique a cor: apagada indica estresse ou doença",
        "✓ Prefira lojas com tanques separados por espécie — menos contaminação cruzada",
        "✓ Pergunte sobre a procedência — peixe importado pode ter passado por stress longo",
      ]},
      { titulo: "Armadilhas a evitar", tipo: "lista", itens: [
        "Evite lojas com peixes mortos flutuando — indica problema sistêmico no sistema de água",
        "Nunca compre peixe do mesmo tanque de um peixe claramente doente — todos estão expostos",
        "Desconfie de tanques com medicamento visível (água azul) — podem ter doença ativa",
        "Tamanho adulto: sempre pesquise antes. Pangasius (tubarão d'água doce) chega a 1m",
        "Espécies 'misturadas': algumas lojas misturam espécies incompatíveis — pesquise em casa antes",
        "Peixes exóticos invasores: nunca solte no ambiente natural — é crime ambiental no Brasil",
      ]},
      { titulo: "Ética e responsabilidade", tipo: "lista", itens: [
        "Pesquise o tamanho adulto e requisitos ANTES de comprar — não depois",
        "Se não puder mais cuidar, encontre outro aquarista — nunca solte em rios ou lagos",
        "Prefira espécies reproduzidas em cativeiro a espécies silvestres protegidas",
        "Aprenda sobre espécies ameaçadas — algumas ainda são coletadas ilegalmente na natureza",
        "Compartilhe conhecimento: um aquarista educado compra melhor e cuida melhor",
      ]},
      { tipo: "dica", texto: "Antes de qualquer compra, verifique: você tem o aquário certo para o tamanho adulto da espécie? Os parâmetros da sua água são compatíveis? Você tem tanque de quarentena pronto? Se as 3 respostas forem sim, pode comprar." },
    ]
  },
];

// ── Renderer ──────────────────────────────────────────────────────────────────
function renderSecao(s: Secao, i: number) {
  return (
    <div key={i}>
      {s.titulo && <h4 className="text-white font-semibold text-sm mt-5 mb-2">{s.titulo}</h4>}
      {s.tipo === "texto" && <p className="text-slate-300 text-sm leading-relaxed">{s.texto}</p>}
      {s.tipo === "lista" && (
        <ul className="space-y-1.5 mt-1">
          {s.itens?.map((item, j) => (
            <li key={j} className="flex gap-2.5 text-sm text-slate-300">
              <ChevronRight className="w-3.5 h-3.5 text-cyan-500/70 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {s.tipo === "alerta" && (
        <div className="flex gap-3 p-4 rounded-xl bg-rose-500/8 border border-rose-500/20 mt-1">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-rose-200 text-sm leading-relaxed">{s.texto}</p>
        </div>
      )}
      {s.tipo === "dica" && (
        <div className="flex gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 mt-1">
          <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-100 text-sm leading-relaxed">{s.texto}</p>
        </div>
      )}
      {s.tipo === "tabela" && s.colunas && s.linhas && (
        <div className="overflow-x-auto rounded-xl border border-white/8 mt-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/8">
                {s.colunas.map((c, j) => <th key={j} className="text-left px-3 py-2 text-slate-400 font-semibold text-xs whitespace-nowrap">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {s.linhas.map((row, j) => (
                <tr key={j} className={j % 2 === 0 ? "bg-white/2" : ""}>
                  {row.map((cell, k) => <td key={k} className={`px-3 py-2 text-xs ${k === 0 ? "text-slate-200 font-medium" : "text-slate-400"}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {s.tipo === "passos" && s.passos && (
        <ol className="space-y-3 mt-1">
          {s.passos.map((passo, j) => (
            <li key={j} className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{j + 1}</div>
              <div>
                <div className="text-white font-semibold text-sm mb-0.5">{passo.titulo}</div>
                <p className="text-slate-400 text-xs leading-relaxed">{passo.descricao}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ── Busca no conteúdo ─────────────────────────────────────────────────────────
function buscaMatch(artigo: Artigo, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  if (artigo.titulo.toLowerCase().includes(q)) return true;
  if (artigo.subtitulo.toLowerCase().includes(q)) return true;
  if (artigo.tags.some(t => t.toLowerCase().includes(q))) return true;
  for (const s of artigo.conteudo) {
    if (s.texto?.toLowerCase().includes(q)) return true;
    if (s.titulo?.toLowerCase().includes(q)) return true;
    if (s.itens?.some(it => it.toLowerCase().includes(q))) return true;
    if (s.passos?.some(p => p.titulo.toLowerCase().includes(q) || p.descricao.toLowerCase().includes(q))) return true;
    if (s.linhas?.some(row => row.some(cell => cell.toLowerCase().includes(q)))) return true;
  }
  return false;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EducacaoPage() {
  const [catAtiva, setCatAtiva] = useState<Categoria | null>(null);
  const [artigoAberto, setArtigoAberto] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const artigosFiltrados = useMemo(() => {
    return ARTIGOS.filter(a => {
      const catOk = catAtiva ? a.categoria === catAtiva : true;
      const buscaOk = buscaMatch(a, busca);
      return catOk && buscaOk;
    });
  }, [catAtiva, busca]);

  const catInfo = CATEGORIAS.find(c => c.id === catAtiva);
  const buscaAtiva = busca.trim().length > 0;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative py-12 px-6 sm:px-8 overflow-hidden border-b border-cyan-900/15">
        <div className="absolute inset-0 bg-gradient-to-b from-[#041e36]/60 to-ocean-950" />
        <BubbleBackground count={8} />
        <div className="relative z-10 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
              Guia de <span className="text-gradient">Educação</span>
            </h1>
            <p className="text-slate-400 text-base">{ARTIGOS.length} artigos — do ciclo do nitrogênio ao aquapaisagismo.</p>
          </div>
          {/* Busca */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar — ex: pH, ich, anúbias, TPA…"
              value={busca}
              onChange={e => { setBusca(e.target.value); setCatAtiva(null); }}
              className="input-ocean-icon pr-9"
            />
            {busca && (
              <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-8 py-6 space-y-6">

        {/* Categorias — ocultar durante busca */}
        {!buscaAtiva && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIAS.map(cat => {
              const count = ARTIGOS.filter(a => a.categoria === cat.id).length;
              const ativa = catAtiva === cat.id;
              return (
                <button key={cat.id}
                  onClick={() => { setCatAtiva(ativa ? null : cat.id); setArtigoAberto(null); }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all hover:scale-[1.02] active:scale-100 ${ativa ? `${cat.corBorda} ${cat.cor}` : "border-white/8 bg-white/2 hover:border-white/15"}`}
                >
                  <div className={`w-16 h-12 rounded-xl overflow-hidden transition-opacity ${ativa ? "opacity-100" : "opacity-50"}`}>
                    {cat.ilustracao}
                  </div>
                  <div>
                    <div className={`text-xs font-bold leading-tight ${ativa ? cat.corTexto : "text-slate-300"}`}>{cat.label}</div>
                    <div className="text-slate-700 text-xs">{count} artigo{count !== 1 ? "s" : ""}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Label categoria ou resultado de busca */}
        {(catInfo || buscaAtiva) && (
          <div className="flex items-center gap-3 flex-wrap">
            {catInfo && !buscaAtiva && (
              <>
                <span className={`font-bold text-sm ${catInfo.corTexto}`}>{catInfo.label}</span>
                <span className="text-slate-600 text-xs">— {catInfo.descricao}</span>
              </>
            )}
            {buscaAtiva && (
              <span className="text-slate-400 text-sm">
                {artigosFiltrados.length} resultado{artigosFiltrados.length !== 1 ? "s" : ""} para <span className="text-white font-semibold">"{busca}"</span>
              </span>
            )}
            <button onClick={() => { setCatAtiva(null); setBusca(""); }} className="ml-auto text-xs text-slate-600 hover:text-slate-400 transition-colors">
              Limpar filtro
            </button>
          </div>
        )}

        {/* Sem resultados */}
        {artigosFiltrados.length === 0 && (
          <div className="text-center py-16 glass rounded-2xl border border-white/5">
            <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-1">Nenhum resultado para "{busca}"</p>
            <p className="text-slate-600 text-sm">Tente termos como: pH, amônia, ich, filtro, plantas, TPA</p>
          </div>
        )}

        {/* Lista de artigos */}
        <div className="space-y-2">
          {artigosFiltrados.map(artigo => {
            const aberto = artigoAberto === artigo.id;
            const cat = CATEGORIAS.find(c => c.id === artigo.categoria)!;
            return (
              <div key={artigo.id}
                className={`rounded-2xl border transition-all overflow-hidden ${aberto ? `${cat.corBorda} bg-white/[0.02]` : "border-white/6 hover:border-white/12"}`}
              >
                <button className="w-full flex items-center gap-4 px-5 py-3.5 text-left"
                  onClick={() => setArtigoAberto(aberto ? null : artigo.id)}>
                  <div className={`w-9 h-9 rounded-xl ${cat.cor} border ${cat.corBorda} flex items-center justify-center flex-shrink-0 text-lg leading-none`}>
                    {artigo.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{artigo.titulo}</span>
                      {!catAtiva && !buscaAtiva && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${cat.cor} border ${cat.corBorda} ${cat.corTexto}`}>
                          {cat.label}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{artigo.subtitulo}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`} />
                </button>
                {aberto && (
                  <div className="px-5 pb-6 border-t border-white/5 pt-4 space-y-3">
                    {artigo.conteudo.map((s, i) => renderSecao(s, i))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
