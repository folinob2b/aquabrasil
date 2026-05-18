"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BubbleBackground from "@/components/BubbleBackground";
import {
  Trash2, RotateCcw, FlipHorizontal, ZoomIn, ZoomOut, X, Plus, Layers,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Categoria = "rocha" | "tronco" | "planta";

interface ItemDef {
  id: string;
  nome: string;
  categoria: Categoria;
  descricao: string;
  render: (mirror: boolean) => React.ReactNode;
  thumbRender: () => React.ReactNode;
  defaultW: number; // % of tank width
  defaultH: number; // % of tank height
  anchorY: "bottom" | "top"; // where item anchors relative to substrate
}

interface PlacedItem {
  uid: string;
  defId: string;
  x: number;    // % from left (center of item)
  y: number;    // % from top  (center of item)
  scaleW: number;
  scaleH: number;
  mirror: boolean;
  z: number;
}

interface TankPreset {
  label: string;
  w: number;
  h: number;
  litros: number;
}

// ── Tank presets ───────────────────────────────────────────────────────────────

const TANKS: TankPreset[] = [
  { label: "Nano 30", w: 30, h: 20, litros: 18 },
  { label: "60 cm",   w: 60, h: 35, litros: 75 },
  { label: "90 cm",   w: 90, h: 45, litros: 175 },
  { label: "120 cm",  w: 120, h: 50, litros: 270 },
];

// ── SVG item library ──────────────────────────────────────────────────────────

const ITEMS: ItemDef[] = [
  // ── ROCHAS ────────────────────────────────────────────────────────────────
  {
    id: "dragon-stone",
    nome: "Dragon Stone",
    categoria: "rocha",
    descricao: "Textura cragosa, cavidades naturais — estética wabi-kusa",
    defaultW: 18, defaultH: 22, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 80 65" className="w-full h-full">
        <defs>
          <linearGradient id="ds-t" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6b5a3e"/>
            <stop offset="100%" stopColor="#2e2016"/>
          </linearGradient>
        </defs>
        <polygon points="5,62 0,40 12,18 28,5 52,2 70,14 80,38 75,62" fill="url(#ds-t)" stroke="#1a1008" strokeWidth="1"/>
        <path d="M20,55 Q30,35 45,40 Q55,44 60,30" stroke="#4a3520" strokeWidth="2" fill="none" opacity="0.6"/>
        <circle cx="35" cy="28" r="4" fill="#1e1208" opacity="0.5"/>
        <circle cx="55" cy="42" r="3" fill="#1e1208" opacity="0.4"/>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 80 65" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs>
          <linearGradient id="ds" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7a6548"/>
            <stop offset="60%" stopColor="#4a3520"/>
            <stop offset="100%" stopColor="#2a180a"/>
          </linearGradient>
          <linearGradient id="ds-light" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,220,150,0.15)"/>
            <stop offset="100%" stopColor="transparent"/>
          </linearGradient>
        </defs>
        <polygon points="5,62 0,40 12,18 28,5 52,2 70,14 80,38 75,62" fill="url(#ds)" stroke="#1a0e04" strokeWidth="1.5"/>
        <polygon points="5,62 0,40 12,18 28,5 52,2 70,14 80,38 75,62" fill="url(#ds-light)"/>
        <path d="M20,55 Q30,35 45,40 Q55,44 60,30" stroke="#3a2812" strokeWidth="2.5" fill="none" opacity="0.7"/>
        <path d="M40,58 Q42,45 50,38 Q56,33 62,20" stroke="#3a2812" strokeWidth="1.5" fill="none" opacity="0.5"/>
        <circle cx="35" cy="28" r="5" fill="#1e1208" opacity="0.6"/>
        <circle cx="56" cy="43" r="3.5" fill="#1e1208" opacity="0.5"/>
        <circle cx="22" cy="38" r="2.5" fill="#1e1208" opacity="0.4"/>
      </svg>
    ),
  },
  {
    id: "seiryu",
    nome: "Seiryu Stone",
    categoria: "rocha",
    descricao: "Pedra angular azul-cinza — estética aquascape japonesa",
    defaultW: 14, defaultH: 26, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 60 80" className="w-full h-full">
        <defs><linearGradient id="sy-t" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#5e6e82"/><stop offset="100%" stopColor="#1e2835"/></linearGradient></defs>
        <polygon points="30,2 55,25 58,55 45,78 15,78 2,55 5,25" fill="url(#sy-t)" stroke="#111820" strokeWidth="1"/>
        <line x1="30" y1="2" x2="10" y2="78" stroke="#2e3e52" strokeWidth="1.5" opacity="0.7"/>
        <line x1="30" y1="2" x2="50" y2="78" stroke="#2e3e52" strokeWidth="1" opacity="0.5"/>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs>
          <linearGradient id="sy" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6e7e92"/><stop offset="50%" stopColor="#3e4e62"/><stop offset="100%" stopColor="#1e2835"/></linearGradient>
          <linearGradient id="sy-hi" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(180,210,255,0.18)"/><stop offset="100%" stopColor="transparent"/></linearGradient>
        </defs>
        <polygon points="30,2 55,25 58,55 45,78 15,78 2,55 5,25" fill="url(#sy)" stroke="#0e1520" strokeWidth="1.5"/>
        <polygon points="30,2 55,25 58,55 45,78 15,78 2,55 5,25" fill="url(#sy-hi)"/>
        <line x1="30" y1="2" x2="8" y2="78" stroke="#1e2e42" strokeWidth="2" opacity="0.8"/>
        <line x1="30" y1="2" x2="52" y2="78" stroke="#1e2e42" strokeWidth="1.5" opacity="0.6"/>
        <line x1="15" y1="38" x2="55" y2="50" stroke="#1e2e42" strokeWidth="1" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: "lava-rock",
    nome: "Lava Rock",
    categoria: "rocha",
    descricao: "Rocha vulcânica porosa — coloniza bactérias nitrificantes",
    defaultW: 16, defaultH: 16, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 70 60" className="w-full h-full">
        <defs><radialGradient id="lv-t" cx="35%" cy="35%"><stop offset="0%" stopColor="#7a2a1a"/><stop offset="100%" stopColor="#2e0e08"/></radialGradient></defs>
        <ellipse cx="35" cy="35" rx="33" ry="25" fill="url(#lv-t)" stroke="#180604" strokeWidth="1"/>
        <circle cx="22" cy="28" r="4" fill="#1a0604" opacity="0.6"/>
        <circle cx="42" cy="20" r="3" fill="#1a0604" opacity="0.5"/>
        <circle cx="50" cy="38" r="5" fill="#1a0604" opacity="0.6"/>
        <circle cx="30" cy="44" r="3" fill="#1a0604" opacity="0.4"/>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 70 60" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs><radialGradient id="lv" cx="35%" cy="35%"><stop offset="0%" stopColor="#8a3a2a"/><stop offset="50%" stopColor="#5a1a0a"/><stop offset="100%" stopColor="#2a0a04"/></radialGradient></defs>
        <ellipse cx="35" cy="35" rx="33" ry="25" fill="url(#lv)" stroke="#180604" strokeWidth="1.5"/>
        <circle cx="22" cy="28" r="5" fill="#1a0604" opacity="0.7"/>
        <circle cx="42" cy="20" r="4" fill="#1a0604" opacity="0.6"/>
        <circle cx="50" cy="38" r="6" fill="#1a0604" opacity="0.7"/>
        <circle cx="30" cy="44" r="4" fill="#1a0604" opacity="0.5"/>
        <circle cx="15" cy="40" r="3" fill="#1a0604" opacity="0.4"/>
        <circle cx="55" cy="25" r="3" fill="#1a0604" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: "river-rock-lg",
    nome: "Seixo Grande",
    categoria: "rocha",
    descricao: "Seixo liso e arredondado — naturalidade de rio",
    defaultW: 20, defaultH: 14, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 90 55" className="w-full h-full">
        <defs><radialGradient id="rr-t" cx="40%" cy="40%"><stop offset="0%" stopColor="#8a8a8a"/><stop offset="100%" stopColor="#2e2e2e"/></radialGradient></defs>
        <ellipse cx="45" cy="32" rx="43" ry="22" fill="url(#rr-t)" stroke="#1a1a1a" strokeWidth="1"/>
        <ellipse cx="32" cy="26" rx="8" ry="4" fill="rgba(255,255,255,0.08)"/>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 90 55" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs>
          <radialGradient id="rr" cx="38%" cy="35%"><stop offset="0%" stopColor="#9a9a9a"/><stop offset="50%" stopColor="#5a5a5a"/><stop offset="100%" stopColor="#2a2a2a"/></radialGradient>
        </defs>
        <ellipse cx="45" cy="32" rx="43" ry="22" fill="url(#rr)" stroke="#141414" strokeWidth="1.5"/>
        <ellipse cx="30" cy="24" rx="10" ry="5" fill="rgba(255,255,255,0.10)"/>
      </svg>
    ),
  },
  {
    id: "river-rock-sm",
    nome: "Seixo Pequeno",
    categoria: "rocha",
    descricao: "Pedregulhos lisos — agrupamentos naturalistas",
    defaultW: 10, defaultH: 8, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <defs><radialGradient id="rs-t" cx="40%" cy="40%"><stop offset="0%" stopColor="#7a7a6a"/><stop offset="100%" stopColor="#2e2e22"/></radialGradient></defs>
        <ellipse cx="18" cy="24" rx="16" ry="12" fill="url(#rs-t)" stroke="#1a1a12" strokeWidth="1"/>
        <ellipse cx="40" cy="26" rx="18" ry="12" fill="url(#rs-t)" stroke="#1a1a12" strokeWidth="1"/>
        <ellipse cx="30" cy="22" rx="12" ry="9" fill="url(#rs-t)" stroke="#1a1a12" strokeWidth="1"/>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 60 40" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs>
          <radialGradient id="rs" cx="38%" cy="35%"><stop offset="0%" stopColor="#8a8a78"/><stop offset="60%" stopColor="#4e4e3e"/><stop offset="100%" stopColor="#28281a"/></radialGradient>
        </defs>
        <ellipse cx="18" cy="24" rx="16" ry="12" fill="url(#rs)" stroke="#14140c" strokeWidth="1"/>
        <ellipse cx="42" cy="26" rx="16" ry="12" fill="url(#rs)" stroke="#14140c" strokeWidth="1"/>
        <ellipse cx="30" cy="20" rx="13" ry="10" fill="url(#rs)" stroke="#14140c" strokeWidth="1"/>
        <ellipse cx="14" cy="20" rx="6" ry="3" fill="rgba(255,255,255,0.08)"/>
        <ellipse cx="40" cy="22" rx="7" ry="3" fill="rgba(255,255,255,0.08)"/>
      </svg>
    ),
  },
  {
    id: "pagoda",
    nome: "Pagoda Stone",
    categoria: "rocha",
    descricao: "Camadas horizontais sobrepostas — afloramento rochoso",
    defaultW: 12, defaultH: 30, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 50 90" className="w-full h-full">
        <defs><linearGradient id="pg-t" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#7a6840"/><stop offset="100%" stopColor="#2e2414"/></linearGradient></defs>
        {[0,1,2,3,4].map(i => (
          <rect key={i} x={5+i*2} y={10+i*16} width={40-i*4} height={13} rx="2" fill="url(#pg-t)" stroke="#1a1008" strokeWidth="0.8"/>
        ))}
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 50 90" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8a7850"/><stop offset="50%" stopColor="#5a4a28"/><stop offset="100%" stopColor="#2e2010"/></linearGradient>
          <linearGradient id="pg-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(255,220,140,0.12)"/><stop offset="100%" stopColor="transparent"/></linearGradient>
        </defs>
        {[0,1,2,3,4].map(i => (
          <g key={i}>
            <rect x={4+i*2} y={8+i*16} width={42-i*4} height={13} rx="2" fill="url(#pg)" stroke="#18100a" strokeWidth="1"/>
            <rect x={4+i*2} y={8+i*16} width={42-i*4} height={6} rx="2" fill="url(#pg-top)"/>
          </g>
        ))}
      </svg>
    ),
  },

  // ── TRONCOS ────────────────────────────────────────────────────────────────
  {
    id: "spider-wood",
    nome: "Spider Wood",
    categoria: "tronco",
    descricao: "Ramos finos e ramificados — composições etéreas e orgânicas",
    defaultW: 38, defaultH: 42, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        <g stroke="#6b3e1a" strokeLinecap="round" fill="none">
          <path d="M60,95 Q50,70 30,55 Q15,45 5,25" strokeWidth="5"/>
          <path d="M60,95 Q65,60 85,40 Q100,25 110,10" strokeWidth="4"/>
          <path d="M45,70 Q35,55 20,48" strokeWidth="3"/>
          <path d="M70,65 Q85,52 95,35 Q105,20 108,8" strokeWidth="2.5"/>
          <path d="M38,58 Q28,45 18,40" strokeWidth="2"/>
          <path d="M80,50 Q88,38 92,25" strokeWidth="2"/>
        </g>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs>
          <linearGradient id="sw" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#3a1e08"/><stop offset="100%" stopColor="#7a4a20"/></linearGradient>
        </defs>
        <g strokeLinecap="round" fill="none">
          <path d="M60,98 Q52,72 28,55 Q12,44 4,22" stroke="#3a1e08" strokeWidth="7"/>
          <path d="M60,98 Q68,62 88,42 Q102,28 112,8" stroke="#3a1e08" strokeWidth="6"/>
          <path d="M42,72 Q30,57 16,48" stroke="#4a2810" strokeWidth="4.5"/>
          <path d="M72,68 Q87,54 98,36 Q106,22 110,8" stroke="#4a2810" strokeWidth="4"/>
          <path d="M35,58 Q22,46 12,38" stroke="#5a3218" strokeWidth="3"/>
          <path d="M82,52 Q92,40 96,26 Q100,14 104,6" stroke="#5a3218" strokeWidth="3"/>
          <path d="M48,64 Q40,52 32,46" stroke="#6a4228" strokeWidth="2.5"/>
          <path d="M76,55 Q84,44 90,30" stroke="#6a4228" strokeWidth="2.5"/>
          <path d="M25,50 Q18,42 10,36" stroke="#6a4228" strokeWidth="2"/>
          <path d="M96,32 Q102,20 108,10" stroke="#6a4228" strokeWidth="2"/>
        </g>
      </svg>
    ),
  },
  {
    id: "manzanita",
    nome: "Manzanita",
    categoria: "tronco",
    descricao: "Galhos lisos e curvos — aspecto de árvore submersa",
    defaultW: 30, defaultH: 48, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 100 120" className="w-full h-full">
        <g stroke="#7a4a20" strokeLinecap="round" fill="none">
          <path d="M50,118 Q48,85 42,65 Q36,45 20,22 Q12,10 8,2" strokeWidth="6"/>
          <path d="M50,118 Q52,80 60,58 Q70,35 85,15 Q92,5 95,2" strokeWidth="5"/>
          <path d="M44,80 Q36,68 25,55" strokeWidth="4"/>
          <path d="M55,75 Q65,62 78,45" strokeWidth="3.5"/>
          <path d="M40,65 Q30,52 20,46" strokeWidth="2.5"/>
          <path d="M60,58 Q72,44 80,30" strokeWidth="2.5"/>
        </g>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <g strokeLinecap="round" fill="none">
          <path d="M50,118 Q48,84 42,64 Q36,44 18,20 Q10,8 6,2" stroke="#3e2208" strokeWidth="9"/>
          <path d="M50,118 Q52,80 62,58 Q72,34 88,14 Q94,5 96,1" stroke="#3e2208" strokeWidth="7"/>
          <path d="M44,82 Q35,68 22,54" stroke="#4e2e10" strokeWidth="5.5"/>
          <path d="M56,76 Q68,62 80,44" stroke="#4e2e10" strokeWidth="5"/>
          <path d="M40,66 Q28,52 18,44" stroke="#5e3a18" strokeWidth="4"/>
          <path d="M62,60 Q74,46 82,30 Q88,18 90,8" stroke="#5e3a18" strokeWidth="4"/>
          <path d="M35,55 Q25,44 16,36" stroke="#6e4a28" strokeWidth="3"/>
          <path d="M68,50 Q78,38 84,24" stroke="#6e4a28" strokeWidth="3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "malaysia",
    nome: "Malaysia Driftwood",
    categoria: "tronco",
    descricao: "Tronco denso e sinuoso — libera taninos, submersão garantida",
    defaultW: 45, defaultH: 28, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 150 80" className="w-full h-full">
        <defs><linearGradient id="ml-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5a3820"/><stop offset="100%" stopColor="#1e100a"/></linearGradient></defs>
        <path d="M5,65 Q25,40 55,38 Q80,36 100,50 Q120,62 145,55" stroke="url(#ml-t)" strokeWidth="18" fill="none" strokeLinecap="round"/>
        <path d="M5,65 Q25,40 55,38 Q80,36 100,50 Q120,62 145,55" stroke="#7a5030" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 150 80" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs>
          <linearGradient id="ml" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6a4828"/><stop offset="50%" stopColor="#3e2412"/><stop offset="100%" stopColor="#1e100a"/></linearGradient>
        </defs>
        <path d="M5,68 Q30,42 58,40 Q82,38 104,52 Q124,64 148,56" stroke="#1a0c06" strokeWidth="26" fill="none" strokeLinecap="round"/>
        <path d="M5,68 Q30,42 58,40 Q82,38 104,52 Q124,64 148,56" stroke="url(#ml)" strokeWidth="22" fill="none" strokeLinecap="round"/>
        <path d="M5,68 Q30,42 58,40 Q82,38 104,52 Q124,64 148,56" stroke="rgba(120,80,40,0.3)" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <path d="M40,44 Q55,50 65,56" stroke="#2a1408" strokeWidth="3" fill="none" opacity="0.6"/>
        <path d="M85,42 Q98,46 108,54" stroke="#2a1408" strokeWidth="3" fill="none" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: "cholla",
    nome: "Cholla Wood",
    categoria: "tronco",
    descricao: "Tronco cilíndrico e oco — abrigo perfeito para nano peixes",
    defaultW: 8, defaultH: 30, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 30 90" className="w-full h-full">
        <defs><linearGradient id="ch-t" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#9a6a30"/><stop offset="100%" stopColor="#4a2e10"/></linearGradient></defs>
        <rect x="8" y="4" width="14" height="82" rx="7" fill="url(#ch-t)" stroke="#2a1408" strokeWidth="1"/>
        {[12,24,36,48,60,72].map(y => <line key={y} x1="8" y1={y} x2="22" y2={y} stroke="#2a1408" strokeWidth="1" opacity="0.6"/>)}
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 30 90" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs>
          <linearGradient id="ch" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#aa7a38"/><stop offset="50%" stopColor="#6a4018"/><stop offset="100%" stopColor="#3a1e08"/></linearGradient>
        </defs>
        <rect x="7" y="3" width="16" height="84" rx="8" fill="url(#ch)" stroke="#200e04" strokeWidth="1.5"/>
        <rect x="10" y="3" width="4" height="84" fill="rgba(255,200,100,0.06)" rx="2"/>
        {[10,20,30,40,50,60,70,80].map(y => (
          <line key={y} x1="7" y1={y} x2="23" y2={y} stroke="#20100a" strokeWidth="1.2" opacity="0.55"/>
        ))}
      </svg>
    ),
  },
  {
    id: "bonsai",
    nome: "Bonsai Driftwood",
    categoria: "tronco",
    descricao: "Estrutura em árvore vertical — ponto focal elegante",
    defaultW: 22, defaultH: 50, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 80 120" className="w-full h-full">
        <g stroke="#5a3010" strokeLinecap="round" fill="none">
          <path d="M40,118 Q40,85 38,65 Q36,45 38,20 Q39,10 40,4" strokeWidth="6"/>
          <path d="M38,65 Q22,55 10,42" strokeWidth="3"/>
          <path d="M38,65 Q54,55 66,44" strokeWidth="3"/>
          <path d="M39,40 Q28,30 18,22" strokeWidth="2.5"/>
          <path d="M39,40 Q50,30 60,22" strokeWidth="2.5"/>
          <path d="M22,55 Q12,48 5,40" strokeWidth="2"/>
          <path d="M54,55 Q64,48 72,40" strokeWidth="2"/>
        </g>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 80 120" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <g strokeLinecap="round" fill="none">
          <path d="M40,118 Q40,84 38,64 Q36,44 38,20 Q39,9 40,3" stroke="#28120a" strokeWidth="10"/>
          <path d="M40,118 Q40,84 38,64 Q36,44 38,20 Q39,9 40,3" stroke="#5a2e10" strokeWidth="6"/>
          <path d="M38,66 Q20,54 8,40" stroke="#28120a" strokeWidth="5"/><path d="M38,66 Q20,54 8,40" stroke="#5a2e10" strokeWidth="3"/>
          <path d="M38,66 Q56,54 68,42" stroke="#28120a" strokeWidth="5"/><path d="M38,66 Q56,54 68,42" stroke="#5a2e10" strokeWidth="3"/>
          <path d="M39,42 Q26,30 14,20" stroke="#28120a" strokeWidth="4"/><path d="M39,42 Q26,30 14,20" stroke="#5a2e10" strokeWidth="2.5"/>
          <path d="M39,42 Q52,30 62,20" stroke="#28120a" strokeWidth="4"/><path d="M39,42 Q52,30 62,20" stroke="#5a2e10" strokeWidth="2.5"/>
          <path d="M20,55 Q10,46 4,38" stroke="#3a1e0c" strokeWidth="3"/>
          <path d="M56,54 Q66,46 74,38" stroke="#3a1e0c" strokeWidth="3"/>
          <path d="M14,22 Q8,16 4,10" stroke="#3a1e0c" strokeWidth="2"/>
          <path d="M62,21 Q68,14 74,8" stroke="#3a1e0c" strokeWidth="2"/>
        </g>
      </svg>
    ),
  },

  // ── PLANTAS ────────────────────────────────────────────────────────────────
  {
    id: "vallisneria",
    nome: "Vallisneria",
    categoria: "planta",
    descricao: "Folhas longas ondulantes — background dramático em cortina",
    defaultW: 7, defaultH: 55, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 40 100" className="w-full h-full">
        {[0,1,2,3].map(i => (
          <path key={i} d={`M${12+i*5},98 Q${10+i*5},60 ${8+i*5+Math.sin(i)*8},20 Q${9+i*5},10 ${11+i*5},2`}
            stroke={i%2===0?"#2d7a3a":"#3a9048"} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        ))}
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 40 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        {[
          {x:8, sw:3, c:"#1e5a28"}, {x:14,sw:2.5,c:"#2d7a3a"}, {x:20,sw:2,c:"#3a9048"},
          {x:26,sw:2.5,c:"#2a6e34"}, {x:32,sw:2,c:"#3a9048"},
        ].map(({x,sw,c},i)=>(
          <path key={i} d={`M${x},100 Q${x-4+i},65 ${x+Math.sin(i*1.5)*6},30 Q${x+2},12 ${x+1},2`}
            stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round"/>
        ))}
      </svg>
    ),
  },
  {
    id: "rotala",
    nome: "Rotala / Haste",
    categoria: "planta",
    descricao: "Hastes avermelhadas em tufo — background com cores quentes",
    defaultW: 10, defaultH: 38, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 50 90" className="w-full h-full">
        {[0,1,2,3,4].map(i=>(
          <g key={i}>
            <line x1={8+i*8} y1="88" x2={8+i*8} y2="20" stroke={i%2?"#8a3020":"#a04030"} strokeWidth="2"/>
            {[20,30,40,50,60,70,80].map(y=>(
              <ellipse key={y} cx={8+i*8} cy={y} rx="5" ry="3" fill={i%2?"#5a8030":"#6a9040"} transform={`rotate(${i%2?30:-30},${8+i*8},${y})`}/>
            ))}
          </g>
        ))}
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 50 90" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        {[
          {x:6,c:"#7a2818",lc:"#4a7028"},{x:14,c:"#a03828",lc:"#5a8030"},
          {x:22,c:"#8a3020",lc:"#4a7028"},{x:30,c:"#a03828",lc:"#5a8030"},
          {x:38,c:"#7a2818",lc:"#4a7028"},
        ].map(({x,c,lc},i)=>(
          <g key={i}>
            <line x1={x} y1="90" x2={x} y2="16" stroke={c} strokeWidth="2.5"/>
            {[18,26,34,42,50,58,66,76].map(y=>(
              <ellipse key={y} cx={x} cy={y} rx="6" ry="3.5" fill={lc} transform={`rotate(${i%2?35:-35},${x},${y})`}/>
            ))}
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "echinodorus",
    nome: "Echinodorus",
    categoria: "planta",
    descricao: "Espada-d'água — ponto focal de médio porte com folhas largas",
    defaultW: 18, defaultH: 30, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 70 80" className="w-full h-full">
        {[[-25,60],[-15,45],[0,30],[15,45],[25,60]].map(([a,l],i)=>(
          <path key={i} d={`M35,78 Q${35+Math.sin((a||0)*0.04)*20},${78-(l||40)*0.5} ${35+(a||0)},${78-(l||40)}`}
            stroke={i===2?"#2a7a38":"#3a9048"} strokeWidth={i===2?3:2} fill="none" strokeLinecap="round"/>
        ))}
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 70 80" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs>
          <linearGradient id="ech" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a9a50"/><stop offset="100%" stopColor="#1a5a28"/></linearGradient>
        </defs>
        {[
          {dx:-28,dy:0,sw:8,rx:10,ry:5},
          {dx:-16,dy:-10,sw:10,rx:12,ry:6},
          {dx:0,dy:-20,sw:12,rx:14,ry:7},
          {dx:16,dy:-10,sw:10,rx:12,ry:6},
          {dx:28,dy:0,sw:8,rx:10,ry:5},
        ].map(({dx,dy,sw,rx,ry},i)=>(
          <g key={i}>
            <line x1="35" y1="78" x2={35+dx} y2={78+dy-35} stroke="#1a4a20" strokeWidth="2"/>
            <ellipse cx={35+dx} cy={78+dy-35} rx={rx} ry={ry} fill="url(#ech)"
              transform={`rotate(${dx*1.5},${35+dx},${78+dy-35})`}/>
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "anubias",
    nome: "Anubias",
    categoria: "planta",
    descricao: "Fixar em troncos e rochas — folhas largas e escuras, muito resistente",
    defaultW: 14, defaultH: 16, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 60 55" className="w-full h-full">
        {[[10,40,-20],[22,28,-10],[34,18,5],[46,30,15],[20,50,-5]].map(([cx,cy,r],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="14" ry="9" fill={i%2?"#1e5a28":"#2a7038"} transform={`rotate(${r},${cx},${cy})`}/>
        ))}
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 60 55" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs><linearGradient id="anb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2e7a40"/><stop offset="100%" stopColor="#1a4a28"/></linearGradient></defs>
        {[
          {cx:10,cy:42,rx:15,ry:9,r:-25},{cx:24,cy:28,rx:16,ry:10,r:-10},
          {cx:36,cy:18,rx:17,ry:10,r:5},{cx:48,cy:30,rx:15,ry:9,r:18},
          {cx:18,cy:50,rx:14,ry:8,r:-5},{cx:42,cy:46,rx:13,ry:8,r:15},
        ].map(({cx,cy,rx,ry,r},i)=>(
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#anb)" transform={`rotate(${r},${cx},${cy})`}/>
            <line x1="30" y1="55" x2={cx} y2={cy} stroke="#14381a" strokeWidth="1.5"/>
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "java-moss",
    nome: "Musgo Java",
    categoria: "planta",
    descricao: "Cobertura densa de musgo — cobre rochas e troncos",
    defaultW: 22, defaultH: 10, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 80 35" className="w-full h-full">
        <path d="M2,32 Q15,10 30,18 Q45,5 60,15 Q72,8 78,32 Z" fill="#2d6a30" stroke="#1a4020" strokeWidth="1"/>
        <path d="M5,30 Q18,15 32,22 Q46,8 58,18 Q70,10 76,30" stroke="#3a8040" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 80 35" className="w-full h-full drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs><radialGradient id="jm" cx="50%" cy="30%"><stop offset="0%" stopColor="#4a8840"/><stop offset="100%" stopColor="#1e4e22"/></radialGradient></defs>
        <path d="M0,34 Q12,8 28,18 Q44,4 60,16 Q72,6 80,34 Z" fill="url(#jm)" stroke="#143018" strokeWidth="1"/>
        <path d="M4,30 Q16,12 30,20 Q46,6 60,18 Q72,8 78,28" stroke="#5aa050" strokeWidth="1.5" fill="none" opacity="0.6"/>
        <path d="M8,32 Q22,16 36,22 Q50,10 64,20" stroke="#3a7838" strokeWidth="1" fill="none" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: "carpet",
    nome: "Tapete (Hemianthus)",
    categoria: "planta",
    descricao: "Forragem rasteira de foreground — tapete verde intenso",
    defaultW: 28, defaultH: 8, anchorY: "bottom",
    thumbRender: () => (
      <svg viewBox="0 0 90 28" className="w-full h-full">
        <path d="M0,26 Q22,4 45,12 Q68,2 90,14 L90,26 Z" fill="#3a8a38" stroke="#1e5220" strokeWidth="1"/>
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 90 28" className="w-full h-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs><linearGradient id="cp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#50a848"/><stop offset="100%" stopColor="#1e5220"/></linearGradient></defs>
        <path d="M0,27 Q22,4 45,12 Q68,2 90,14 L90,27 Z" fill="url(#cp)" stroke="#143018" strokeWidth="1"/>
        <path d="M5,22 Q25,8 48,14 Q70,4 88,16" stroke="#70c060" strokeWidth="1.2" fill="none" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: "floating",
    nome: "Planta Flutuante",
    categoria: "planta",
    descricao: "Cobre a superfície — atenua luz e reduz algas",
    defaultW: 25, defaultH: 7, anchorY: "top",
    thumbRender: () => (
      <svg viewBox="0 0 80 25" className="w-full h-full">
        {[[10,12],[25,8],[40,14],[55,8],[68,12]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="12" ry="8" fill={i%2?"#2d7a38":"#3a9048"}/>
        ))}
        {[[18,14],[33,10],[48,15],[62,10]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="10" ry="7" fill={i%2?"#1e5a28":"#2d7a38"} opacity="0.7"/>
        ))}
      </svg>
    ),
    render: (m) => (
      <svg viewBox="0 0 80 25" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" style={{ transform: m ? "scaleX(-1)" : undefined }}>
        <defs><radialGradient id="fl" cx="50%" cy="40%"><stop offset="0%" stopColor="#50a850"/><stop offset="100%" stopColor="#1e5228"/></radialGradient></defs>
        {[[8,12,14,9],[22,8,15,9],[38,14,16,10],[54,8,15,9],[70,12,13,9]].map(([cx,cy,rx,ry],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#fl)" stroke="#143018" strokeWidth="0.8"/>
        ))}
        {[[16,15,12,7],[32,10,12,7],[48,16,12,8],[64,10,12,7]].map(([cx,cy,rx,ry],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#2a6a30" opacity="0.75"/>
        ))}
      </svg>
    ),
  },
];

// ── Helper ─────────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2); }

const CAT_LABELS: Record<Categoria | "todos", string> = {
  todos: "Todos", rocha: "Rochas", tronco: "Troncos", planta: "Plantas",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AquascapePage() {
  const [tankIdx, setTankIdx] = useState(1);
  const [catFilter, setCatFilter] = useState<Categoria | "todos">("todos");
  const [placed, setPlaced] = useState<PlacedItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{
    uid: string; startX: number; startY: number; origX: number; origY: number;
  } | null>(null);
  const tankRef = useRef<HTMLDivElement>(null);
  const zCounter = useRef(10);

  const tank = TANKS[tankIdx];
  const ratio = tank.w / tank.h;
  const SUBSTRATE_H = 13; // % of tank height reserved for substrate

  const filteredItems = ITEMS.filter(i => catFilter === "todos" || i.categoria === catFilter);
  const selItem = placed.find(p => p.uid === selected);

  // ── Add item to tank ──
  const addItem = (defId: string) => {
    const def = ITEMS.find(i => i.id === defId)!;
    const newItem: PlacedItem = {
      uid: uid(),
      defId,
      x: 30 + Math.random() * 40,
      y: def.anchorY === "top" ? 8 : 100 - SUBSTRATE_H - def.defaultH / 2 - Math.random() * 5,
      scaleW: 1,
      scaleH: 1,
      mirror: false,
      z: zCounter.current++,
    };
    setPlaced(p => [...p, newItem]);
    setSelected(newItem.uid);
  };

  // ── Remove ──
  const remove = (id: string) => {
    setPlaced(p => p.filter(i => i.uid !== id));
    if (selected === id) setSelected(null);
  };

  // ── Update selected ──
  const patch = (changes: Partial<PlacedItem>) => {
    if (!selected) return;
    setPlaced(p => p.map(i => i.uid === selected ? { ...i, ...changes } : i));
  };

  // ── Bring to front on select ──
  const selectItem = (id: string) => {
    setSelected(id);
    setPlaced(p => p.map(i => i.uid === id ? { ...i, z: zCounter.current++ } : i));
  };

  // ── Mouse drag ──
  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const item = placed.find(p => p.uid === id)!;
    setDrag({ uid: id, startX: e.clientX, startY: e.clientY, origX: item.x, origY: item.y });
    selectItem(id);
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!drag || !tankRef.current) return;
    const rect = tankRef.current.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * 100;
    const dy = ((e.clientY - drag.startY) / rect.height) * 100;
    setPlaced(p => p.map(i =>
      i.uid === drag.uid
        ? { ...i, x: Math.max(2, Math.min(98, drag.origX + dx)), y: Math.max(2, Math.min(95, drag.origY + dy)) }
        : i
    ));
  }, [drag]);

  const onMouseUp = useCallback(() => setDrag(null), []);

  useEffect(() => {
    if (!drag) return;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [drag, onMouseMove, onMouseUp]);

  return (
    <div className="min-h-screen bg-ocean-950">
      <Navbar />
      <main className="flex flex-col">

        {/* ── Hero ── */}
        <section className="relative py-12 px-6 sm:px-8 overflow-hidden border-b border-cyan-900/15">
          <div className="absolute inset-0 bg-gradient-to-b from-[#041e36]/60 to-ocean-950" />
          <BubbleBackground count={8} />
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
              Aquascape <span className="text-gradient">Designer</span>
            </h1>
            <p className="text-slate-400">
              Componha seu aquário virtual — escolha rochas, troncos e plantas, posicione-os e veja como ficaria antes de comprar.
            </p>
          </div>
        </section>

        {/* ── Layout principal ── */}
        <div className="flex flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 200px)" }}>

          {/* ── Sidebar: paleta ── */}
          <aside className="w-full lg:w-72 xl:w-80 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-white/5">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Itens de decoração</p>
              {/* Category filter */}
              <div className="flex gap-1 p-1 bg-white/4 rounded-xl">
                {(["todos", "rocha", "tronco", "planta"] as const).map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${catFilter === c ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300"}`}>
                    {CAT_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>

            {/* Item grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-2">
                {filteredItems.map(item => (
                  <button key={item.id} onClick={() => addItem(item.id)}
                    className="group flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-center">
                    <div className="w-full h-14 flex items-center justify-center">
                      {item.thumbRender()}
                    </div>
                    <span className="text-white text-xs font-semibold leading-tight">{item.nome}</span>
                    <span className="text-slate-600 text-[10px] leading-tight line-clamp-2">{item.descricao}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                      item.categoria === "rocha" ? "bg-stone-800/50 border-stone-600/30 text-stone-400" :
                      item.categoria === "tronco" ? "bg-amber-900/40 border-amber-700/30 text-amber-400" :
                      "bg-green-900/40 border-green-700/30 text-green-400"
                    }`}>
                      {item.categoria === "rocha" ? "Rocha" : item.categoria === "tronco" ? "Tronco" : "Planta"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Área principal: aquário + controles ── */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 gap-4 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Tank size */}
              <div className="flex items-center gap-1 p-1 bg-white/4 rounded-xl">
                {TANKS.map((t, i) => (
                  <button key={i} onClick={() => setTankIdx(i)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${tankIdx === i ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <span className="text-slate-600 text-xs">{tank.w}×{tank.h} cm · {tank.litros} L</span>

              <div className="flex-1" />

              {/* Selected item controls */}
              {selItem && (() => {
                const def = ITEMS.find(d => d.id === selItem.defId)!;
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/4 rounded-xl border border-white/8">
                    <span className="text-slate-400 text-xs mr-1 hidden sm:inline">{def.nome}</span>
                    <button onClick={() => patch({ scaleW: Math.max(0.3, selItem.scaleW - 0.15), scaleH: Math.max(0.3, selItem.scaleH - 0.15) })}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all" title="Diminuir">
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-slate-500 text-xs w-9 text-center">{Math.round(selItem.scaleW * 100)}%</span>
                    <button onClick={() => patch({ scaleW: Math.min(3, selItem.scaleW + 0.15), scaleH: Math.min(3, selItem.scaleH + 0.15) })}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all" title="Aumentar">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    <button onClick={() => patch({ mirror: !selItem.mirror })}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all" title="Espelhar">
                      <FlipHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => patch({ z: zCounter.current++ })}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all" title="Trazer para frente">
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    <button onClick={() => remove(selItem.uid)}
                      className="p-1 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Remover">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })()}

              <button onClick={() => { setPlaced([]); setSelected(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-slate-500 text-xs hover:text-slate-300 hover:border-white/20 transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Limpar
              </button>
            </div>

            {/* Tank canvas */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full"
                style={{ aspectRatio: String(ratio), maxHeight: "62vh" }}>

                {/* Tank outer frame */}
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-900/50 shadow-[0_0_40px_rgba(0,150,200,0.08)] overflow-hidden"
                  ref={tankRef}
                  style={{ cursor: drag ? "grabbing" : "default" }}
                  onClick={() => setSelected(null)}>

                  {/* Water body */}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, #0a2a45 0%, #051828 60%, #030e1a 100%)" }} />

                  {/* Caustic light lines */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
                    style={{ background: "repeating-linear-gradient(20deg, transparent 0px, transparent 20px, rgba(100,220,255,1) 20px, rgba(100,220,255,1) 21px, transparent 21px, transparent 40px)" }} />

                  {/* Surface shimmer */}
                  <div className="absolute top-0 left-0 right-0 pointer-events-none"
                    style={{ height: "4%", background: "linear-gradient(to bottom, rgba(0,200,255,0.18), transparent)" }} />

                  {/* Background plant silhouettes */}
                  <div className="absolute left-0 right-0 pointer-events-none" style={{ bottom: `${SUBSTRATE_H}%`, height: "38%" }}>
                    {[2,8,14,20,26,32,38,44,50,56,62,68,74,80,86,92,98].map((x,i)=>(
                      <div key={i} className="absolute bottom-0 rounded-t-full"
                        style={{
                          left: `${x}%`, width: "3%", opacity: 0.06,
                          height: `${40+Math.sin(i*1.7)*25}%`,
                          background: "linear-gradient(to top, #1a5a28, #2a8a40)",
                        }}/>
                    ))}
                  </div>

                  {/* Substrate */}
                  <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
                    style={{ height: `${SUBSTRATE_H}%`, background: "linear-gradient(to top, #1e0e06 0%, #2e1a0a 60%, #3a2010 100%)" }} />
                  {/* Substrate pebble texture */}
                  <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
                    style={{ height: `${SUBSTRATE_H * 0.5}%`, backgroundImage: "radial-gradient(circle, rgba(80,50,20,0.6) 1.5px, transparent 1.5px)", backgroundSize: "12px 8px", opacity: 0.5 }} />

                  {/* Glass reflection */}
                  <div className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{ background: "linear-gradient(105deg, rgba(255,255,255,0.03) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.02) 100%)" }} />

                  {/* Placed items */}
                  {[...placed].sort((a, b) => a.z - b.z).map(item => {
                    const def = ITEMS.find(d => d.id === item.defId)!;
                    const wPct = def.defaultW * item.scaleW;
                    const hPct = def.defaultH * item.scaleH;
                    const isSelected = selected === item.uid;
                    return (
                      <div
                        key={item.uid}
                        onMouseDown={e => onMouseDown(e, item.uid)}
                        onClick={e => { e.stopPropagation(); selectItem(item.uid); }}
                        className={`absolute transition-[outline] ${isSelected ? "outline outline-2 outline-cyan-400/70 outline-offset-2 rounded" : ""}`}
                        style={{
                          left: `${item.x}%`, top: `${item.y}%`,
                          width: `${wPct}%`, height: `${hPct}%`,
                          transform: "translate(-50%, -50%)",
                          zIndex: item.z,
                          cursor: drag?.uid === item.uid ? "grabbing" : "grab",
                          userSelect: "none",
                        }}
                      >
                        {def.render(item.mirror)}
                        {isSelected && (
                          <button
                            onMouseDown={e => e.stopPropagation()}
                            onClick={e => { e.stopPropagation(); remove(item.uid); }}
                            className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-400 transition-colors z-50 shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Empty state */}
                  {placed.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-4xl mb-3 opacity-20">🪨</div>
                        <p className="text-slate-500 text-sm font-medium">Clique em um item ao lado para adicionar</p>
                        <p className="text-slate-700 text-xs mt-1">Arraste para reposicionar · Selecione para redimensionar</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Item chips list */}
            {placed.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {placed.map(item => {
                  const def = ITEMS.find(d => d.id === item.defId)!;
                  const isSelected = selected === item.uid;
                  return (
                    <button key={item.uid} onClick={() => selectItem(item.uid)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${isSelected ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-white/8 bg-white/3 text-slate-400 hover:border-white/15 hover:text-slate-200"}`}>
                      <span>{def.nome}</span>
                      <X className="w-3 h-3 opacity-40 hover:opacity-100"
                        onClick={e => { e.stopPropagation(); remove(item.uid); }} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tips */}
            <div className="flex gap-4 text-xs text-slate-700 flex-wrap">
              <span>💡 Arraste para mover</span>
              <span>🔍 Use + / – para escalar</span>
              <span>↔️ Espelhe para variar a composição</span>
              <span><Layers className="w-3 h-3 inline mr-1"/>Camadas: selecione e clique para trazer à frente</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
