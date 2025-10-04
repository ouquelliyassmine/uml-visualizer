"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-green-50 to-slate-100" />
        <div className="absolute inset-0 bg-gradient-to-tl from-red-50/40 via-transparent to-yellow-50/40" />

        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" fill="none">
            <g className="animate-pulse">
              <path d="M50 200 Q200 150 400 200 T700 180 Q850 170 1000 190" stroke="url(#irrigationGrad)" strokeWidth="3" fill="none" opacity="0.6" />
              <path d="M100 400 Q300 350 500 400 T800 380 Q950 370 1100 390" stroke="url(#techGrad)" strokeWidth="3" fill="none" opacity="0.6" />
              <path d="M150 600 Q350 550 550 600 T850 580 Q1000 570 1150 590" stroke="url(#fieldGrad)" strokeWidth="3" fill="none" opacity="0.6" />
            </g>
            <g>
              <circle cx="200" cy="180" r="6" fill="#F59E0B" className="animate-ping" />
              <circle cx="400" cy="200" r="4" fill="#16A34A" />
              <circle cx="600" cy="170" r="5" fill="#DC2626" className="animate-pulse" />
              <circle cx="800" cy="185" r="4" fill="#F59E0B" />
              <circle cx="300" cy="380" r="5" fill="#16A34A" className="animate-ping" />
              <circle cx="500" cy="400" r="6" fill="#DC2626" />
              <circle cx="700" cy="370" r="4" fill="#F59E0B" className="animate-pulse" />
              <circle cx="900" cy="395" r="5" fill="#16A34A" />
            </g>
            <defs>
              <linearGradient id="irrigationGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#16A34A" stopOpacity="0" />
                <stop offset="50%" stopColor="#16A34A" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0" />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="fieldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#DC2626" stopOpacity="0" />
                <stop offset="50%" stopColor="#DC2626" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Orbs */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-300/30 via-yellow-400/20 to-orange-400/30 blur-3xl transition-all duration-1000 animate-pulse"
          style={{ transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`, left: "5%", top: "10%" }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-green-400/25 via-emerald-500/20 to-teal-400/25 blur-3xl transition-all duration-1000 animate-pulse"
          style={{ transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`, right: "10%", top: "30%" }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-br from-red-300/20 via-rose-400/15 to-pink-400/20 blur-3xl transition-all duration-1000"
          style={{ transform: `translate(${mousePosition.x * 0.025}px, ${-mousePosition.y * 0.025}px)`, left: "20%", bottom: "20%" }}
        />

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-12 h-12 bg-amber-400/20 rotate-45 rounded-lg animate-spin" style={{ animationDuration: "20s" }} />
          <div className="absolute top-40 right-32 w-8 h-8 bg-green-400/25 rotate-[12deg] rounded-full animate-bounce" />
          <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-red-400/15 rounded-full animate-pulse" />
          <div className="absolute top-1/2 right-20 w-10 h-10 bg-yellow-400/20 rotate-45 animate-spin" style={{ animationDuration: "15s" }} />
          <div className="absolute bottom-32 right-1/3 w-6 h-6 bg-emerald-400/30 rounded-full animate-ping" />
          <div className="absolute top-32 left-1/3 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-amber-400/20 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-green-400/25 animate-bounce" />
          <div className="absolute top-2/3 left-16 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-l-transparent border-r-transparent border-b-red-400/20 animate-pulse" />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(245,158,11,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(22,163,74,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(220,38,38,0.05),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.08)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_70%_40%_at_50%_0%,#000_60%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-amber-400/40 to-transparent -translate-x-1/2 animate-pulse" />
        <div className="absolute top-0 left-1/3 w-px h-24 bg-gradient-to-b from-green-400/30 to-transparent animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-0 right-1/3 w-px h-28 bg-gradient-to-b from-red-400/35 to-transparent animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* NAV */}
      <nav className="relative z-50 flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-2 ring-amber-200 shadow-lg bg-white">
            <Image
              src="/images/Concours-de-Recrutement-ORMVAO-2024-removebg-preview.png"
              alt="ORMVA Ouarzazate"
              fill
              sizes="48px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-800 font-bold text-lg">TechOasis</span>
            <span className="text-xs text-green-700 font-medium">ORMVA • Ouarzazate</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-slate-700">
          <Link href="/features" className="hover:text-amber-600 transition-colors font-medium">Fonctionnalités</Link>
          <a href="#" className="hover:text-green-600 transition-colors font-medium">Solutions</a>
          <a href="#" className="hover:text-amber-600 transition-colors font-medium">Support</a>
          <a href="#" className="hover:text-green-600 transition-colors font-medium">Contact</a>
        </div>

        <Link
          href="/login"
          className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold shadow-lg"
          aria-label="Se connecter"
        >
          Connexion
        </Link>
      </nav>

 
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <div className={`text-center max-w-6xl mx-auto transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center px-6 py-3 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 backdrop-blur-sm mb-8 shadow-lg">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 mr-3 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-slate-700 font-semibold">ORMVA Ouarzazate • Solution Informatique Premium</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">Tech</span>
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">Oasis</span>
          </h1>

          <p className="text-2xl md:text-3xl text-slate-700 mb-4 font-light">Plateforme de Gestion & Support Informatique</p>

          <p className="text-lg text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            Supervisez et gérez l’ensemble de votre parc informatique — matériels, logiciels, licences et utilisateurs — en temps réel pour gagner en fiabilité, sécurité et maîtrise des coûts.
          </p>

          <div className="flex justify-center">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center px-12 py-5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/25"
              aria-label="Accéder à la plateforme (se connecter)"
            >
              <span className="relative z-10 flex items-center text-lg">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Accéder à la plateforme
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>
        </div>

    
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-8 bg-gradient-to-r from-slate-50 to-amber-50 border-t border-amber-200">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-bounce" />
          <div className="w-3 h-3 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>
        <p className="text-slate-600 font-medium mb-2">© 2025 TechVision Solutions • ORMVA Ouarzazate</p>
        <p className="text-slate-500 text-sm">Office Régional de Mise en Valeur Agricole • Région de Drâa-Tafilalet</p>
      </div>
    </div>
  );
}



