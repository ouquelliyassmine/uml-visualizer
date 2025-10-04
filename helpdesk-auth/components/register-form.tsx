"use client"

import Link from "next/link"
import Image from "next/image"
import { useActionState, useState } from "react"
import { register } from "@/app/actions/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, null)
  const [role, setRole] = useState("")

  return (
    <>
      {/* Background + overlay */}
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

      {/* Décor (facultatif) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-amber-400/30 to-yellow-600/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/30 to-emerald-600/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* ===== Contenu (réduit) ===== */}
      <div className="relative z-10 min-h-screen flex items-center justify-center w-full overflow-y-auto py-6">
        <div className="w-full px-4 md:px-8">
          {/* Zoom-out plus fort + card plus étroite */}
          <div className="mx-auto w-full max-w-sm transform origin-center scale-[0.8] md:scale-[0.75] lg:scale-[0.7] transition-transform duration-300">
            {/* Branding */}
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

            {/* Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden ring-1 ring-amber-400/20">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 text-center">
                <h1 className="text-2xl font-bold text-white mb-1">Rejoignez-nous !</h1>
                <p className="text-amber-100/80 text-sm">Créez votre compte</p>
              </div>

              {/* Form */}
              <div className="px-6 pb-6">
                <form action={formAction} className="space-y-4">
                  {/* Nom & Prénom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="nom" className="block text-xs font-medium text-amber-100">Nom</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          id="nom" name="nom" type="text" required
                          className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 text-sm"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="prenom" className="block text-xs font-medium text-amber-100">Prénom</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          id="prenom" name="prenom" type="text" required
                          className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 text-sm"
                          placeholder="John"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email & Téléphone (côte à côte dès md) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-xs font-medium text-amber-100">Adresse email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <input
                          id="email" name="email" type="email" required
                          className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 text-sm"
                          placeholder="john.doe@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="telephone" className="block text-xs font-medium text-amber-100">Téléphone</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          id="telephone" name="telephone" type="tel"
                          className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 text-sm"
                          placeholder="06 12 34 56 78"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-xs font-medium text-amber-100">Mot de passe</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password" name="password" type="password" required
                        className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Rôle */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-amber-100">Rôle</label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="w-full h-10 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 text-white border-white/20">
                        <SelectItem value="USER">Utilisateur</SelectItem>
                        <SelectItem value="TECHNICIEN">Technicien</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="role" value={role} />
                  </div>

                  {/* Conditions */}
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox" id="terms" required
                      className="w-4 h-4 mt-0.5 text-amber-500 bg-white/10 border-white/20 rounded focus:ring-amber-400 focus:ring-2"
                    />
                    <label htmlFor="terms" className="text-xs text-amber-100">
                      J'accepte les{" "}
                      <Link href="#" className="text-amber-300 hover:text-amber-200 underline transition-colors">
                        conditions d'utilisation
                      </Link>{" "}
                      et la{" "}
                      <Link href="#" className="text-amber-300 hover:text-amber-200 underline transition-colors">
                        politique de confidentialité
                      </Link>
                    </label>
                  </div>

                  {/* Bouton */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="group relative w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-amber-500/50 disabled:opacity-50"
                  >
                    <span className="relative z-10">{isPending ? "Inscription en cours..." : "Créer mon compte"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </form>

                {/* Statut */}
                {state?.message && (
                  <div
                    className={`mt-4 p-3 rounded-xl text-center font-medium ${
                      state.success
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {state.message}
                  </div>
                )}
              </div>

              {/* Footer card */}
              <div className="px-6 py-4 bg-white/5 border-t border-white/10 text-center">
                <p className="text-amber-100/80 text-sm">
                  Déjà un compte ?{" "}
                  <Link href="/login" className="text-amber-300 hover:text-amber-200 font-medium transition-colors">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center mt-6">
              <p className="text-amber-200/60 text-xs font-medium">TechOasis © 2025 - ORMVA Ouarzazate</p>
              <p className="text-amber-200/40 text-[10px] mt-1">Office Régional de Mise en Valeur Agricole</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

