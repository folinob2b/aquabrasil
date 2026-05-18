"use client";
import { useRef, useEffect, useCallback, useState } from "react";
import Globe from "react-globe.gl";

interface Ponto {
  id: string;
  nome: string;
  lat: number;
  lng: number;
  cor: string;
  count: number;
}

interface Props {
  pontos: Ponto[];
  regiaoSelecionada: string | null;
  onSelect: (id: string) => void;
}

export default function GloboInterativo({ pontos, regiaoSelecionada, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef    = useRef<any>(null);
  const [dims, setDims] = useState({ w: 600, h: 500 });

  // Medir container com ResizeObserver
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

  // Configurar controles após mount
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = false;
    controls.enableZoom = true;
    controls.minDistance = 150;
    controls.maxDistance = 600;
    g.pointOfView({ lat: -10, lng: -40, altitude: 2 }, 800);
  }, []);

  const getColor = useCallback(
    (d: object) => (d as Ponto).id === regiaoSelecionada ? "#ffffff" : (d as Ponto).cor,
    [regiaoSelecionada]
  );

  const getRadius = useCallback(
    (d: object) => 0.5 + Math.sqrt((d as Ponto).count) * 0.22,
    []
  );

  const getLabel = useCallback((d: object) => {
    const p = d as Ponto;
    return `<div style="background:#0a1628cc;backdrop-filter:blur(8px);border:1px solid rgba(6,182,212,0.5);border-radius:10px;padding:8px 12px;font-family:sans-serif;white-space:nowrap">
      <div style="font-size:13px;font-weight:700;color:#fff">${p.nome}</div>
      <div style="font-size:11px;color:#67e8f9;margin-top:2px">${p.count} espécie${p.count !== 1 ? "s" : ""}</div>
    </div>`;
  }, []);

  const handleClick = useCallback(
    (d: object) => onSelect((d as Ponto).id),
    [onSelect]
  );

  return (
    <div ref={containerRef} className="w-full h-full">
      <Globe
        ref={globeRef}
        width={dims.w}
        height={dims.h}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#06b6d4"
        atmosphereAltitude={0.14}
        pointsData={pontos}
        pointLat="lat"
        pointLng="lng"
        pointColor={getColor}
        pointRadius={getRadius}
        pointAltitude={0.025}
        pointLabel={getLabel}
        onPointClick={handleClick}
      />
    </div>
  );
}
