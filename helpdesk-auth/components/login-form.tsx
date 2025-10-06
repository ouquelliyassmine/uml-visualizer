"use client"

import Link from "next/link"
import Image from "next/image"
import { useActionState, useMemo } from "react"
import { login } from "@/app/actions/auth"


function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)


  const particles = useMemo(() => {
    const rnd = mulberry32(123456)
    return Array.from({ length: 20 }, () => ({
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      delay: `${rnd() * 3}s`,
      duration: `${2 + rnd() * 2}s`,
    }))
  }, [])

  return (
    <>
    
      <div className="fixed inset-0">
        <Image
          src="/images/gestion-parc-informatique.webp"
          alt="Bureau moderne avec réseau de connexion"
          fill
          style={{ objectFit: "cover" }}
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-amber-900/60 to-green-900/70" />
      </div>

   
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-amber-400/30 to-yellow-600/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/30 to-emerald-600/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute inset-0">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-400/30 rounded-full animate-ping"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center w-full overflow-y-auto py-6">
        <div className="w-full px-4 md:px-8">
        
          <div className="mx-auto w-full max-w-sm transform origin-center scale-[0.8] md:scale-[0.75] lg:scale-[0.7] transition-transform duration-300">
            {/* Logo + Branding */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-3 mb-3">
                <Image
                  src="/images/Concours-de-Recrutement-ORMVAO-2024-removebg-preview.png"
                  alt="ORMVA Ouarzazate"
                  width={48}
                  height={48}
                  className="rounded-xl ring-2 ring-amber-300/50 bg-white/5 p-1 shadow-lg object-contain"
                  priority
                />
                <span className="text-xl font-bold text-white">TechOasis</span>
              </div>
              <p className="text-amber-100/80 text-xs font-medium">ORMVA • Ouarzazate</p>
            </div>

            {/* Carte */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden ring-1 ring-amber-400/20">
              {/* En-tête */}
              <div className="px-6 pt-6 pb-4 text-center">
                <h1 className="text-2xl font-bold text-white mb-1">Bienvenue !</h1>
                <p className="text-amber-100/80 text-sm">Connectez-vous à votre espace</p>
              </div>

              {/* Form */}
              <div className="px-6 pb-6">
                <form action={formAction} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-medium text-amber-100">
                      Adresse email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 text-sm"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-xs font-medium text-amber-100">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 text-sm"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center text-amber-100">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-amber-500 bg-white/10 border-white/20 rounded focus:ring-amber-400 focus:ring-2"
                      />
                      <span className="ml-2">Se souvenir de moi</span>
                    </label>
                    <Link href="#" className="text-amber-300 hover:text-amber-200 transition-colors font-medium">
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="group relative w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/25 focus:outline-none focus:ring-4 focus:ring-amber-500/50 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isPending ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                          </svg>
                          Se connecter
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </form>

                {/* Status */}
                {state?.message && (
                  <div
                    className={`mt-4 p-3 rounded-xl text-center font-medium ${
                      state.success
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 text-sm">
                      {state.success ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {state.message}
                    </div>
                  </div>
                )}

                {/* Social */}
                <div className="mt-5">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-transparent text-amber-200">Ou continuez avec</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <a
                      href="https://www.agrisud.org/web/ormvao-office-regional-de-mise-en-valeur-agricole-de-ouarzazate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-amber-500/20 hover:border-amber-400/30 transition-all duration-300"
                      aria-label="Visiter le site ORMVA Ouarzazate"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-8.09 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      </svg>
                      <span className="ml-2 text-sm">Google</span>
                    </a>

                    <a
                      href="https://web.facebook.com/ouarzazate.ormva/?locale=fr_FR&_rdc=1&_rdr#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-green-500/20 hover:border-green-400/30 transition-all duration-300"
                      aria-label="Visiter la page Facebook ORMVA Ouarzazate"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span className="ml-2 text-sm">Facebook</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white/5 border-t border-white/10 text-center">
                <p className="text-amber-100/80 text-sm">
                  Pas encore de compte ?{" "}
                  <Link href="/register" className="text-amber-300 hover:text-amber-200 font-medium transition-colors">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center mt-6">
              <div className="flex justify-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
              <p className="text-amber-200/60 text-xs font-medium">TechOasis © 2025 - ORMVA Ouarzazate</p>
              <p className="text-amber-200/40 text-[10px] mt-1">Office Régional de Mise en Valeur Agricole</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
