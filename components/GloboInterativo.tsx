"use client";
import { useRef, useEffect, useCallback } from "react";
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
  const globeEl = useRef<any>(null);

  useEffect(() => {
    const g = globeEl.current;
    if (!g) return;
    g.controls().autoRotate = true;
    g.controls().autoRotateSpeed = 0.4;
    g.pointOfView({ lat: -10, lng: -55, altitude: 2.2 }, 1000);
  }, []);

  const getColor = useCallback(
    (d: object) => ((d as Ponto).id === regiaoSelecionada ? "#ffffff" : (d as Ponto).cor),
    [regiaoSelecionada]
  );

  const getRadius = useCallback(
    (d: object) => 0.4 + Math.sqrt((d as Ponto).count) * 0.18,
    []
  );

  const getLabel = useCallback(
    (d: object) => {
      const p = d as Ponto;
      return `<div style="background:#0a1628;border:1px solid rgba(6,182,212,0.4);border-radius:8px;padding:6px 10px;font-size:12px;color:white;white-space:nowrap"><strong>${p.nome}</strong><br/><span style="color:#67e8f9">${p.count} espécie${p.count !== 1 ? "s" : ""}</span></div>`;
    },
    []
  );

  const handleClick = useCallback(
    (d: object) => onSelect((d as Ponto).id),
    [onSelect]
  );

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundColor="rgba(0,0,0,0)"
      atmosphereColor="#06b6d4"
      atmosphereAltitude={0.12}
      pointsData={pontos}
      pointLat="lat"
      pointLng="lng"
      pointColor={getColor}
      pointRadius={getRadius}
      pointAltitude={0.02}
      pointLabel={getLabel}
      onPointClick={handleClick}
    />
  );
}
