import Link from "next/link";
import { Waves, Github, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-cyan-900/20 bg-ocean-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Waves className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black">
                <span className="text-gradient">Aqua</span>
                <span className="text-white">Brasil</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              A maior plataforma de aquarismo do Brasil. Ferramentas, catálogo
              de espécies e comunidade para aquaristas de todos os níveis.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Instagram, Youtube, Github].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Ferramentas</h4>
            <ul className="space-y-2.5">
              {[
                ["Catálogo de Peixes", "/catalogo"],
                ["Compatibilidade", "/compatibilidade"],
                ["Calendário de Medidas", "/calendario"],
                ["Calculadora de Volume", "#"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Comunidade</h4>
            <ul className="space-y-2.5">
              {[
                ["Fórum", "/forum"],
                ["Artigos", "#"],
                ["Doenças Comuns", "#"],
                ["Guias para Iniciantes", "#"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-cyan-900/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            © 2025 AquaBrasil. Todos os direitos reservados.
          </p>
          <p className="text-slate-600 text-xs">
            Feito com 💙 para a comunidade aquarista brasileira
          </p>
        </div>
      </div>
    </footer>
  );
}
