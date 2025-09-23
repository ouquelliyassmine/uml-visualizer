"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Plus, BookOpen, Eye, Edit, Trash2, ArrowLeft, User, Clock, Grid, List, Sparkles, Filter } from "lucide-react"

/* ========= Types ========= */
interface Author {
  nom: string
  prenom: string
}
interface Article {
  id: number
  titre: string
  contenu: string
  auteur: Author | null
  dateCreation: string
  vues: number
}

/* ========= UI Primitives ========= */
const Card = ({
  children,
  className = "",
  onClick,
}: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
)

interface ButtonProps {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  disabled?: boolean
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
}: ButtonProps) => {
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white font-medium",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium",
    danger: "bg-red-500 hover:bg-red-600 text-white font-medium",
    ghost: "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
    outline: "border border-gray-300 hover:border-orange-300 bg-white hover:bg-orange-50 text-gray-700",
  }
  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  )
}

/* ========= Helpers réseau sûrs ========= */
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api"
const KB_URL = `${API_BASE}/utilisateur/base-connaissance`

/** Lit le corps sans planter si vide / non-JSON. Retourne: object | string | null */
async function readBody(res: Response): Promise<any> {
  // 204 = No Content
  if (res.status === 204) return null
  const text = await res.text().catch(() => "")
  if (!text) return null
  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text)
    } catch {
      throw new Error("Réponse JSON invalide du serveur")
    }
  }
  return text // HTML ou texte simple
}

/* ========= Page ========= */
export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newArticle, setNewArticle] = useState({ titre: "", contenu: "" })
  const [editArticle, setEditArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchArticles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchArticles = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(KB_URL, {
        method: "GET",
        credentials: "include",
      })

      if (!res.ok) {
        const errPayload = await readBody(res)
        const msg =
          (typeof errPayload === "object" && errPayload?.message) ||
          (typeof errPayload === "string" && errPayload) ||
          `Erreur ${res.status}`
        throw new Error(msg)
      }

      const payload = await readBody(res)
      const data: Article[] = Array.isArray(payload) ? payload : []
      setArticles(data)
      setSearchResults(data)
    } catch (err: any) {
      setError("Impossible de charger les articles. " + (err?.message || String(err)))
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    if (term) {
      const t = term.toLowerCase()
      const results = articles.filter(
        (a) => (a.titre ?? "").toLowerCase().includes(t) || (a.contenu ?? "").toLowerCase().includes(t),
      )
      setSearchResults(results)
    } else {
      setSearchResults(articles)
    }
  }

  const viewArticle = (article: Article) => {
    const updatedArticles = articles.map((a) => (a.id === article.id ? { ...a, vues: a.vues + 1 } : a))
    setArticles(updatedArticles)
    setSelectedArticle({ ...article, vues: article.vues + 1 })
  }

  const createArticle = async () => {
    if (!newArticle.titre || !newArticle.contenu) {
      alert("Le titre et le contenu sont obligatoires")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(KB_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArticle),
      })

      if (!res.ok) {
        const errPayload = await readBody(res)
        const msg =
          (typeof errPayload === "object" && errPayload?.message) ||
          (typeof errPayload === "string" && errPayload) ||
          `Erreur ${res.status}`
        throw new Error(msg)
      }

      const payload = await readBody(res)
      if (!payload || typeof payload !== "object") {
        throw new Error("Réponse vide ou inattendue après création")
      }
      const createdArticle = payload as Article
      const updatedArticles = [...articles, createdArticle]
      setArticles(updatedArticles)
      setSearchResults(updatedArticles)
      setNewArticle({ titre: "", contenu: "" })
      setShowCreateForm(false)
    } catch (err: any) {
      setError("Erreur lors de la création : " + (err?.message || String(err)))
    } finally {
      setLoading(false)
    }
  }

  const deleteArticle = async (articleId: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cet article ?")) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${KB_URL}/${articleId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        const errPayload = await readBody(res)
        const msg =
          (typeof errPayload === "object" && errPayload?.message) ||
          (typeof errPayload === "string" && errPayload) ||
          `Erreur ${res.status}`
        throw new Error(msg)
      }
      // pas de parsing ici (204 attendu)
      const updatedArticles = articles.filter((a) => a.id !== articleId)
      setArticles(updatedArticles)
      setSearchResults(updatedArticles)
      if (selectedArticle?.id === articleId) setSelectedArticle(null)
    } catch (err: any) {
      setError("Erreur lors de la suppression : " + (err?.message || String(err)))
    } finally {
      setLoading(false)
    }
  }

  const saveEdit = async () => {
    if (!editArticle) return
    if (!editArticle.titre || !editArticle.contenu) {
      alert("Le titre et le contenu sont obligatoires")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${KB_URL}/${editArticle.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: editArticle.titre,
          contenu: editArticle.contenu,
        }),
      })

      if (!res.ok) {
        const errPayload = await readBody(res)
        const msg =
          (typeof errPayload === "object" && errPayload?.message) ||
          (typeof errPayload === "string" && errPayload) ||
          `Erreur ${res.status}`
        throw new Error(msg)
      }

      const payload = await readBody(res)
      if (!payload || typeof payload !== "object") {
        throw new Error("Réponse vide ou inattendue après modification")
      }
      const updated = payload as Article
      setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      setSearchResults((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      setSelectedArticle((s) => (s && s.id === updated.id ? updated : s))
      setEditArticle(null)
    } catch (err: any) {
      setError("Erreur lors de la modification : " + (err?.message || String(err)))
    } finally {
      setLoading(false)
    }
  }

  /* ========= Renders ========= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-6 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <BookOpen className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-2">Erreur</h3>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
          <Button onClick={fetchArticles} variant="primary">
            Réessayer
          </Button>
        </Card>
      </div>
    )
  }

  if (selectedArticle && !editArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedArticle(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle.titre}</h1>
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    {selectedArticle.auteur
                      ? `${selectedArticle.auteur.prenom} ${selectedArticle.auteur.nom}`
                      : "Auteur inconnu"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedArticle.dateCreation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{selectedArticle.vues} vues</span>
                </div>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedArticle.contenu}</div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setEditArticle(selectedArticle)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteArticle(selectedArticle.id)
                  setSelectedArticle(null)
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-orange-500" />
                Base de Connaissances
              </h1>
              <p className="text-gray-600 mt-1">Gérez et partagez vos connaissances</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Article
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Create/Edit Form */}
        {(editArticle || showCreateForm) && (
          <div className="mb-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {editArticle ? "Modifier l'article" : "Créer un nouvel article"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                  <input
                    type="text"
                    value={editArticle ? editArticle.titre : newArticle.titre}
                    onChange={(e) =>
                      editArticle
                        ? setEditArticle({ ...editArticle, titre: e.target.value })
                        : setNewArticle({ ...newArticle, titre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Titre de l'article"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
                  <textarea
                    value={editArticle ? editArticle.contenu : newArticle.contenu}
                    onChange={(e) =>
                      editArticle
                        ? setEditArticle({ ...editArticle, contenu: e.target.value })
                        : setNewArticle({ ...newArticle, contenu: e.target.value })
                    }
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    placeholder="Contenu de l'article..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={editArticle ? saveEdit : createArticle} disabled={loading}>
                    {editArticle ? "Enregistrer" : "Publier"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditArticle(null)
                      setShowCreateForm(false)
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Articles List */}
        {searchResults.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {searchResults.map((article) => (
              <Card
                key={article.id}
                className={`cursor-pointer hover:shadow-md ${viewMode === "list" ? "p-6" : ""}`}
                onClick={() => viewArticle(article)}
              >
                {viewMode === "grid" ? (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.titre}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {(article?.contenu ?? "").slice(0, 120)}
                      {(article?.contenu?.length ?? 0) > 120 ? "..." : ""}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{article.auteur ? `${article.auteur.prenom} ${article.auteur.nom}` : "Anonyme"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{article.vues}</span>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => setEditArticle(article)} className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteArticle(article.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {article.titre}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {(article?.contenu ?? "").slice(0, 150)}
                        {(article?.contenu?.length ?? 0) > 150 ? "..." : ""}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{article.auteur ? `${article.auteur.prenom} ${article.auteur.nom}` : "Anonyme"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.vues} vues</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.dateCreation}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => setEditArticle(article)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteArticle(article.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "Aucun article trouvé" : "Aucun article"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Essayez de modifier votre recherche."
                : "Commencez par créer votre premier article."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un article
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
