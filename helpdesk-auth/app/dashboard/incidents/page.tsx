"use client"

import { useActionState, useEffect } from "react"
import { createIncident } from "@/app/actions/incidents"

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Loader2, CheckCircle, XCircle, Shield, AlertCircle, Clock, Sparkles, Info } from "lucide-react"

function DeclareIncidentPage() {
  const [state, formAction, isPending] = useActionState(createIncident, null)

  useEffect(() => {
    if (state?.success) {
      const form = document.querySelector("form") as HTMLFormElement
      if (form) setTimeout(() => form.reset(), 1500)
    }
  }, [state?.success])

  return (
    <div className="relative min-h-[calc(100vh-60px)] overflow-hidden">
      {/* الخلفية */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/30 to-stone-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-400/15 to-amber-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,.04),transparent_50%)]" />
      </div>

      {/* ✅ غلاف التصغير + التمركز */}
      <div className="mx-auto max-w-[1800px] px-6 py-12 origin-top transform-gpu scale-[0.90] md:scale-[0.88] 2xl:scale-[0.85] transition-transform duration-300">
        {/* محتوى الصفحة الأصلي */}
        <div className="mx-auto max-w-5xl">
          {/* Badges */}
          <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/80 backdrop-blur-sm px-6 py-3 shadow-lg ring-1 ring-orange-100/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <Shield className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-stone-700">Support ORMVA</span>
              </div>
              <div className="w-px h-4 bg-stone-200" />
              <span className="text-xs text-stone-600 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-500" />
                Priorisation intelligente
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50/80 px-4 py-2 ring-1 ring-emerald-200/50">
              <Clock className="h-3 w-3 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">Réponse moyenne &lt; 5 minutes</span>
            </div>
          </div>

          <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-2xl ring-1 ring-stone-200/50 overflow-hidden rounded-2xl">
            <CardHeader className="relative bg-gradient-to-br from-stone-50/80 to-orange-50/50 border-b border-stone-100/50">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(251,146,60,.02)_25%,rgba(251,146,60,.02)_50%,transparent_50%,transparent_75%,rgba(251,146,60,.02)_75%)] bg-[length:20px_20px]" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-blue-100/60 ring-1 ring-blue-200/40">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-stone-600 tracking-wide">ASSISTANCE TECHNIQUE</span>
                </div>
                <CardTitle className="text-3xl font-bold mb-2">
                  <span className="text-stone-800">
                    Déclarer <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">un incident</span>
                  </span>
                </CardTitle>
                <CardDescription className="text-stone-600 leading-relaxed">
                  Décrivez votre problème avec précision pour une résolution optimale.
                  Les champs marqués d'un <span className="font-semibold text-blue-600">*</span> sont obligatoires.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Message d'état */}
              {state && state.message && (
                <div
                  className={`mb-8 flex items-start gap-4 rounded-2xl border p-6 transition-all duration-300 ${
                    state.success
                      ? "border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-green-50 shadow-lg shadow-emerald-100/50"
                      : "border-red-200/50 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg shadow-red-100/50"
                  }`}
                >
                  <div className={`p-1 rounded-full ${state.success ? "bg-emerald-100" : "bg-red-100"}`}>
                    {state.success ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold ${state.success ? "text-emerald-800" : "text-red-800"}`}>
                      {state.success ? "Succès !" : "Erreur"}
                    </p>
                    <p className={`text-sm ${state.success ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>
                  </div>
                </div>
              )}

              <form action={formAction} className="space-y-8">
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Colonne gauche */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="titre" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                        Titre de l'incident <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="titre"
                        name="titre"
                        placeholder="Ex : Problème de connexion au réseau"
                        disabled={isPending}
                        className="h-12 border-stone-200 bg-white/70 backdrop-blur-sm rounded-xl 
                                   placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-orange-500/40 
                                   focus-visible:border-orange-300 transition-all duration-200 
                                   hover:bg-white/80 hover:border-stone-300"
                        required
                      />
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-orange-500" />
                        Utilisez un titre clair et descriptif
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                        Description détaillée <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        rows={7}
                        placeholder="Décrivez le problème : contexte, messages d'erreur, étapes pour reproduire le problème..."
                        disabled={isPending}
                        className="border-stone-200 bg-white/70 backdrop-blur-sm rounded-xl 
                                   placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-orange-500/40 
                                   focus-visible:border-orange-300 transition-all duration-200 
                                   hover:bg-white/80 hover:border-stone-300 resize-none"
                        required
                      />
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-orange-500" />
                        Plus la description est précise, plus la résolution sera rapide
                      </p>
                    </div>
                  </div>

                  {/* Colonne droite */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="statut" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full" />
                        Statut initial <span className="text-red-500">*</span>
                      </Label>
                      <Select name="statut" defaultValue="OUVERT" disabled={isPending} required>
                        <SelectTrigger className="h-12 border-stone-200 bg-white/70 backdrop-blur-sm rounded-xl 
                                                 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 
                                                 transition-all duration-200 hover:bg-white/80 hover:border-stone-300">
                          <SelectValue placeholder="Choisir le statut" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-stone-200 bg-white/95 backdrop-blur-sm">
                          <SelectItem value="OUVERT" className="rounded-lg">🟢 Ouvert</SelectItem>
                          <SelectItem value="EN_COURS" className="rounded-lg">🔵 En cours</SelectItem>
                          <SelectItem value="EN_ATTENTE" className="rounded-lg">🟡 En attente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="priorite" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
                        Niveau de priorité <span className="text-red-500">*</span>
                      </Label>
                      <Select name="priorite" defaultValue="MOYENNE" disabled={isPending} required>
                        <SelectTrigger className="h-12 border-stone-200 bg-white/70 backdrop-blur-sm rounded-xl 
                                                 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 
                                                 transition-all duration-200 hover:bg-white/80 hover:border-stone-300">
                          <SelectValue placeholder="Évaluer la priorité" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-stone-200 bg-white/95 backdrop-blur-sm">
                          <SelectItem value="BASSE" className="rounded-lg">🟢 Basse - Non bloquant</SelectItem>
                          <SelectItem value="MOYENNE" className="rounded-lg">🟡 Moyenne - Impact modéré</SelectItem>
                          <SelectItem value="HAUTE" className="rounded-lg">🟠 Haute - Impact important</SelectItem>
                          <SelectItem value="CRITIQUE" className="rounded-lg">🔴 Critique - Service interrompu</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-stone-500">Évaluez l'impact sur votre activité professionnelle</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="commentaire" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
                        Informations complémentaires
                        <span className="text-xs text-stone-400 font-normal">(optionnel)</span>
                      </Label>
                      <Textarea
                        id="commentaire"
                        name="commentaire"
                        rows={4}
                        placeholder="Équipe concernée, localisation, numéro d'inventaire, tentatives de résolution..."
                        disabled={isPending}
                        className="border-stone-200 bg-white/70 backdrop-blur-sm rounded-xl 
                                   placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-orange-500/40 
                                   focus-visible:border-orange-300 transition-all duration-200 
                                   hover:bg-white/80 hover:border-stone-300 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600
                             hover:from-orange-600 hover:via-orange-700 hover:to-amber-700
                             text-white font-semibold shadow-xl hover:shadow-2xl
                             transition-all duration-300 transform hover:-translate-y-0.5
                             disabled:opacity-50 disabled:transform-none disabled:hover:shadow-xl
                             ring-2 ring-orange-500/20 hover:ring-orange-500/30"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Envoi en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-white/20 rounded-full">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <span>Déclarer l'incident</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="bg-gradient-to-r from-stone-50/50 to-orange-50/30 border-t border-stone-100/50 p-6">
              <div className="w-full flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-stone-600">
                  <div className="p-1 bg-emerald-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span>Notre équipe de support vous contactera rapidement</span>
                </div>
                <div className="flex items-center gap-2 text-stone-500">
                  <Shield className="h-4 w-4 text-orange-500" />
                  <span className="text-xs">Données sécurisées</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DeclareIncidentPage
