"use client";
import { useRef, useEffect, useCallback, useState } from "react";
import Globe from "react-globe.gl";
import * as topojson from "topojson-client";

// ISO numérico → regiões do catálogo
const ISO_PARA_REGIOES: Record<number, string[]> = {
  76:  ["amazonia","rio-negro","rio-xingu","rio-sf","rio-parana","brasil-c"],
  862: ["orinoco","llanos"],
  170: ["colombia","amazonia"],
  604: ["peru","amazonia"],
  68:  ["bolivia"],
  32:  ["prata"],
  858: ["prata"],
  600: ["prata"],
  328: ["guiana"],
  740: ["guiana"],
  780: ["caribe"],
  484: ["centroam"],
  320: ["centroam"],
  340: ["centroam"],
  84:  ["centroam"],
  180: ["congo"],
  140: ["congo"],
  454: ["malawi"],
  834: ["malawi"],
  356: ["india"],
  50:  ["bangladesh"],
  524: ["bangladesh"],
  144: ["srilanka"],
  764: ["tailandia"],
  418: ["tailandia"],
  704: ["vietnam"],
  116: ["vietnam"],
  458: ["malasia","borneo"],
  702: ["malasia"],
  360: ["borneo","sumatra","papua"],
  598: ["papua"],
  566: ["africa-o"],
  204: ["africa-o"],
  288: ["africa-o"],
};

// Nomes dos países relevantes (world-atlas não inclui nomes)
const NOMES: Record<number, string> = {
  76:"Brasil", 862:"Venezuela", 170:"Colômbia", 604:"Peru", 68:"Bolívia",
  32:"Argentina", 858:"Uruguai", 600:"Paraguai", 328:"Guiana", 740:"Suriname",
  780:"Trinidad e Tobago", 484:"México", 320:"Guatemala", 340:"Honduras", 84:"Belize",
  180:"R. D. Congo", 140:"Rep. Centro-Africana", 454:"Malawi", 834:"Tanzânia",
  356:"Índia", 50:"Bangladesh", 524:"Nepal", 144:"Sri Lanka",
  764:"Tailândia", 418:"Laos", 704:"Vietnã", 116:"Camboja",
  458:"Malásia", 702:"Singapura", 360:"Indonésia", 598:"Papua Nova Guiné",
  566:"Nigéria", 204:"Benin", 288:"Gana",
};

// Principais rios — caminhos simplificados [lng, lat]
const RIOS = [
  { nome: "Rio Amazonas",       cor: "#22d3ee88", pts: [[-74,-4],[-68,-3.5],[-62,-3.2],[-56,-2.5],[-50,-1.5],[-49.2,-0.2]] },
  { nome: "Rio Negro",          cor: "#0ea5e988", pts: [[-67,2.5],[-65,1.2],[-62,0.2],[-60,-0.5],[-59.5,-2.8]] },
  { nome: "Rio Xingu",          cor: "#06b6d488", pts: [[-53.5,-12],[-52.5,-7],[-52,-4],[-51.9,-1.5]] },
  { nome: "Rio Tapajós",        cor: "#38bdf888", pts: [[-56,-14],[-55,-8],[-55,-4],[-54.9,-2.4]] },
  { nome: "Rio São Francisco",  cor: "#7dd3fc88", pts: [[-47.5,-20],[-44,-14],[-41,-11],[-38,-9],[-36.5,-10.5]] },
  { nome: "Rio Paraná",         cor: "#bae6fd88", pts: [[-51,-14],[-52,-21],[-53,-26],[-57,-32],[-58.4,-34.5]] },
  { nome: "Rio Orinoco",        cor: "#34d39988", pts: [[-71,7],[-67,7.2],[-63,7.5],[-61.5,7],[-60.5,6.4]] },
  { nome: "Rio Congo",          cor: "#c084fc88", pts: [[19,4],[19.5,-1],[18.5,-4],[16,-5],[12.5,-4]] },
  { nome: "Rio Mekong",         cor: "#fb923c88", pts: [[99,22],[101,18],[103,14],[104,12],[106,10.5]] },
];

function getIso(feature: any): number {
  return Number(feature.id ?? feature.properties?.ISO_N3 ?? 0);
}

interface Props {
  regioesComPeixes: Set<string>;
  regiaoSelecionada: string | null;
  onSelectRegioes: (ids: string[]) => void;
}

export default function GloboInterativo({ regioesComPeixes, regiaoSelecionada, onSelectRegioes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef     = useRef<any>(null);
  const [dims, setDims]     = useState({ w: 800, h: 600 });
  const [features, setFeatures] = useState<any[]>([]);
  const [hoverIso, setHoverIso] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0 && height > 0) setDims({ w: Math.floor(width), h: Math.floor(height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(world => {
        const geo = (topojson.feature as any)(world, world.objects.countries);
        setFeatures(geo.features ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g || !features.length) return;
    const ctrl = g.controls();
    ctrl.autoRotate  = false;
    ctrl.enableZoom  = true;
    ctrl.minDistance = 120;
    ctrl.maxDistance = 700;
    g.pointOfView({ lat: -8, lng: -38, altitude: 2.1 }, 1000);
  }, [features]);

  const getCapColor = useCallback((d: any) => {
    const iso = getIso(d);
    const regioes = ISO_PARA_REGIOES[iso] ?? [];
    const temPeixes = regioes.some(r => regioesComPeixes.has(r));
    const ativo = regioes.some(r => r === regiaoSelecionada);
    const hover = iso === hoverIso;
    if (!temPeixes) return "rgba(255,255,255,0.03)";
    if (ativo)      return "rgba(6,182,212,0.55)";
    if (hover)      return "rgba(6,182,212,0.32)";
    return "rgba(6,182,212,0.10)";
  }, [regioesComPeixes, regiaoSelecionada, hoverIso]);

  const getSideColor = useCallback((d: any) => {
    const iso = getIso(d);
    const regioes = ISO_PARA_REGIOES[iso] ?? [];
    return regioes.some(r => regioesComPeixes.has(r)) ? "rgba(6,182,212,0.12)" : "rgba(0,0,0,0)";
  }, [regioesComPeixes]);

  const getStroke = useCallback((d: any) => {
    const iso = getIso(d);
    const regioes = ISO_PARA_REGIOES[iso] ?? [];
    const temPeixes = regioes.some(r => regioesComPeixes.has(r));
    if (!temPeixes) return "rgba(255,255,255,0.05)";
    return iso === hoverIso ? "#67e8f9" : "rgba(6,182,212,0.5)";
  }, [regioesComPeixes, hoverIso]);

  const getLabel = useCallback((d: any) => {
    const iso = getIso(d);
    const regioes = ISO_PARA_REGIOES[iso] ?? [];
    if (!regioes.some(r => regioesComPeixes.has(r))) return "";
    const nome = NOMES[iso] ?? "";
    if (!nome) return "";
    return `<div style="background:#061220ee;border:1px solid rgba(6,182,212,0.6);border-radius:8px;padding:5px 10px;font-size:12px;font-family:sans-serif;color:#e2e8f0;white-space:nowrap">${nome}</div>`;
  }, [regioesComPeixes]);

  const handleHover = useCallback((d: any) => {
    setHoverIso(d ? getIso(d) : null);
  }, []);

  const handleClick = useCallback((d: any) => {
    const iso = getIso(d);
    const regioes = (ISO_PARA_REGIOES[iso] ?? []).filter(r => regioesComPeixes.has(r));
    if (regioes.length) onSelectRegioes(regioes);
  }, [regioesComPeixes, onSelectRegioes]);

  const riosData = RIOS.map(r => ({
    coords: r.pts.map(([lng, lat]) => ({ lat, lng, alt: 0.001 })),
    cor: r.cor,
  }));

  return (
    <div ref={containerRef} className="w-full h-full">
      {features.length > 0 && (
        <Globe
          ref={globeRef}
          width={dims.w}
          height={dims.h}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#06b6d4"
          atmosphereAltitude={0.12}
          polygonsData={features}
          polygonCapColor={getCapColor}
          polygonSideColor={getSideColor}
          polygonStrokeColor={getStroke}
          polygonAltitude={0.005}
          polygonLabel={getLabel}
          onPolygonHover={handleHover}
          onPolygonClick={handleClick}
          pathsData={riosData}
          pathPoints="coords"
          pathPointLat={(p: any) => p.lat}
          pathPointLng={(p: any) => p.lng}
          pathPointAlt={(p: any) => p.alt}
          pathColor={(d: any) => d.cor}
          pathStroke={1.5}
          pathDashLength={0.5}
          pathDashGap={0.2}
          pathDashAnimateTime={10000}
        />
      )}
    </div>
  );
}
