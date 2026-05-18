"use client";
import { useRef, useEffect, useCallback, useState } from "react";
import Globe from "react-globe.gl";
import * as topojson from "topojson-client";

// ISO numérico → IDs de regiões do catálogo
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

// Coordenadas simplificadas dos principais rios
const RIOS = [
  { nome: "Rio Amazonas",   cor: "#06b6d4", coords: [[-74,-4],[-68,-3.5],[-62,-3.2],[-55,-2.5],[-50,-1.5],[-49,-0.5]] },
  { nome: "Rio Negro",      cor: "#0ea5e9", coords: [[-67,2],[-65,1],[-62,0],[-60,-0.5],[-59,-2.5]] },
  { nome: "Rio Orinoco",    cor: "#22d3ee", coords: [[-72,7],[-68,7],[-64,7.5],[-62,7],[-60,6.5]] },
  { nome: "Rio Paraná",     cor: "#38bdf8", coords: [[-51,-15],[-52,-22],[-53,-27],[-57,-32],[-58,-34]] },
  { nome: "Rio São Francisco", cor: "#7dd3fc", coords: [[-47,-11],[-44,-12],[-40,-12],[-37,-9],[-36,-10]] },
  { nome: "Rio Congo",      cor: "#c084fc", coords: [[20,4],[20,-1],[18,-4],[15,-5],[12,-4]] },
  { nome: "Rio Mekong",     cor: "#fb923c", coords: [[100,22],[102,18],[104,14],[105,12],[106,10]] },
  { nome: "Rio Xingu",      cor: "#67e8f9", coords: [[-54,-7],[-52,-5],[-51,-3],[-52,-1.5]] },
];

interface Feature {
  id: number;
  type: string;
  geometry: object;
  properties: Record<string, unknown>;
}

interface Props {
  regioesComPeixes: Set<string>;
  regiaoSelecionada: string | null;
  onSelectRegioes: (regioeIds: string[]) => void;
}

export default function GloboInterativo({ regioesComPeixes, regiaoSelecionada, onSelectRegioes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef    = useRef<any>(null);
  const [dims, setDims]         = useState({ w: 800, h: 600 });
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hoverId, setHoverId]   = useState<number | null>(null);

  // ResizeObserver para dimensões corretas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setDims({ w: Math.floor(width), h: Math.floor(height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Buscar dados do mapa
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(world => {
        const geo = topojson.feature(world, world.objects.countries) as any;
        setFeatures(geo.features);
      })
      .catch(() => {});
  }, []);

  // Configurar controles
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !features.length) return;
    const ctrl = g.controls();
    ctrl.autoRotate    = false;
    ctrl.enableZoom    = true;
    ctrl.minDistance   = 120;
    ctrl.maxDistance   = 700;
    g.pointOfView({ lat: -8, lng: -38, altitude: 2.1 }, 800);
  }, [features]);

  const getColor = useCallback((d: object) => {
    const f = d as Feature;
    const regioes = ISO_PARA_REGIOES[f.id] ?? [];
    const temPeixes = regioes.some(r => regioesComPeixes.has(r));
    const ativo = regioes.some(r => r === regiaoSelecionada);
    const hover = f.id === hoverId;
    if (!temPeixes) return "rgba(255,255,255,0.03)";
    if (ativo)      return "rgba(6,182,212,0.55)";
    if (hover)      return "rgba(6,182,212,0.35)";
    return "rgba(6,182,212,0.12)";
  }, [regioesComPeixes, regiaoSelecionada, hoverId]);

  const getSideColor = useCallback((d: object) => {
    const f = d as Feature;
    const regioes = ISO_PARA_REGIOES[f.id] ?? [];
    const temPeixes = regioes.some(r => regioesComPeixes.has(r));
    return temPeixes ? "rgba(6,182,212,0.15)" : "rgba(0,0,0,0)";
  }, [regioesComPeixes]);

  const getStroke = useCallback((d: object) => {
    const f = d as Feature;
    const regioes = ISO_PARA_REGIOES[f.id] ?? [];
    const temPeixes = regioes.some(r => regioesComPeixes.has(r));
    const hover = f.id === hoverId;
    if (!temPeixes) return "rgba(255,255,255,0.06)";
    if (hover) return "#06b6d4";
    return "rgba(6,182,212,0.4)";
  }, [regioesComPeixes, hoverId]);

  const getAlt = useCallback((d: object) => {
    const f = d as Feature;
    const regioes = ISO_PARA_REGIOES[f.id] ?? [];
    const ativo = regioes.some(r => r === regiaoSelecionada);
    const hover = f.id === hoverId;
    if (ativo) return 0.06;
    if (hover) return 0.04;
    return 0.005;
  }, [regiaoSelecionada, hoverId]);

  const getLabel = useCallback((d: object) => {
    const f = d as Feature;
    const regioes = ISO_PARA_REGIOES[f.id] ?? [];
    const temPeixes = regioes.some(r => regioesComPeixes.has(r));
    if (!temPeixes) return "";
    return `<div style="background:#0a1628dd;border:1px solid rgba(6,182,212,0.5);border-radius:8px;padding:6px 10px;font-size:12px;font-family:sans-serif;white-space:nowrap">
      <div style="color:#67e8f9;font-weight:600">${f.properties?.name ?? "Região"}</div>
    </div>`;
  }, [regioesComPeixes]);

  const handleHover = useCallback((d: object | null) => {
    setHoverId(d ? (d as Feature).id : null);
  }, []);

  const handleClick = useCallback((d: object) => {
    const f = d as Feature;
    const regioes = ISO_PARA_REGIOES[f.id] ?? [];
    const comPeixes = regioes.filter(r => regioesComPeixes.has(r));
    if (comPeixes.length > 0) onSelectRegioes(comPeixes);
  }, [regioesComPeixes, onSelectRegioes]);

  // Dados dos rios como paths
  const riosData = RIOS.map(r => ({
    coords: r.coords.map(([lng, lat]) => ({ lat, lng, alt: 0.003 })),
    cor: r.cor,
    nome: r.nome,
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
          polygonCapColor={getColor}
          polygonSideColor={getSideColor}
          polygonStrokeColor={getStroke}
          polygonAltitude={getAlt}
          polygonLabel={getLabel}
          onPolygonHover={handleHover}
          onPolygonClick={handleClick}
          pathsData={riosData}
          pathPoints="coords"
          pathPointLat={(p: any) => p.lat}
          pathPointLng={(p: any) => p.lng}
          pathPointAlt={(p: any) => p.alt}
          pathColor={(d: any) => d.cor}
          pathStroke={1.2}
          pathDashLength={0.4}
          pathDashGap={0.15}
          pathDashAnimateTime={8000}
        />
      )}
    </div>
  );
}
