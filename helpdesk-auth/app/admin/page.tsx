"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Monitor,
  Package,
  Building2,
  Plus,
  Edit,
  Trash2,
  Settings,
  AlertTriangle,
  TrendingUp,
  Download,
  RefreshCw,
  Key,
  FileText,
  Cpu,
  Printer,
  Smartphone,
  Laptop,
  Server,
} from "lucide-react";

/* ===================== TYPES ===================== */
type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role?: string;
};

type Materiel = {
  id: number;
  type: string;
  marque: string;
  modele: string;
  etat: string;
  utilisateurId?: number | null;
  utilisateurNomComplet?: string | null;
  fournisseurId?: number | null;
  fournisseurNom?: string | null;
};

type Fournisseur = {
  id: number;
  nom: string;
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
};

type Logiciel = {
  id: number;
  nom: string;
  version?: string | null;
  editeur?: string | null;
  licence?: string | null;
  dateExpiration?: string | null; // yyyy-MM-dd
  materielId?: number | null;
  materielNom?: string | null;
};

type KPIKey =
  | "users"
  | "equipements"
  | "licences"
  | "tickets"
  | "fournisseurs"
  | "contrats";
type KpiSnapshot = { t: number; vals: Record<KPIKey, number> };

/* ===================== HELPERS ===================== */
function normalizeRole(r?: string): "admin" | "technicien" | "utilisateur" {
  if (!r) return "utilisateur";
  const v = r.replace(/^ROLE_/i, "").toUpperCase();
  if (v === "ADMIN") return "admin";
  if (v === "TECH" || v === "TECHNICIEN") return "technicien";
  return "utilisateur";
}

const getColorClasses = (color: string): string => {
  const colors: Record<string, string> = {
    blue: "bg-blue-500 text-blue-600 bg-blue-50 border-blue-200",
    green: "bg-green-500 text-green-600 bg-green-50 border-green-200",
    purple: "bg-purple-500 text-purple-600 bg-purple-50 border-purple-200",
    orange: "bg-orange-500 text-orange-600 bg-orange-50 border-orange-200",
    indigo: "bg-indigo-500 text-indigo-600 bg-indigo-50 border-indigo-200",
    emerald: "bg-emerald-500 text-emerald-600 bg-emerald-50 border-emerald-200",
  };
  return colors[color] || colors.orange;
};

const getStatusColor = (statut: string): string => {
  switch ((statut || "").toLowerCase()) {
    case "actif":
    case "en service":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactif":
    case "en maintenance":
      return "bg-red-100 text-red-800 border-red-200";
    case "expire bientôt":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getEquipmentIcon = (type: string): React.ComponentType<any> => {
  switch ((type || "").toLowerCase()) {
    case "ordinateur":
      return Cpu;
    case "portable":
      return Laptop;
    case "serveur":
      return Server;
    case "imprimante":
      return Printer;
    case "smartphone":
      return Smartphone;
    default:
      return Monitor;
  }
};

/* ==== date helpers ==== */
function parseISODate(d?: string | null): Date | null {
  if (!d) return null;
  const dt = new Date(`${d}T00:00:00`);
  return isNaN(dt.getTime()) ? null : dt;
}
function expirationBadge(
  dateISO?: string | null
): { label: string; cls: string } {
  if (!dateISO || dateISO.trim() === "" || dateISO === "null") {
    return { label: "—", cls: "bg-gray-100 text-gray-800 border-gray-200" };
  }
  const dt = parseISODate(dateISO);
  if (!dt) return { label: "—", cls: "bg-gray-100 text-gray-800 border-gray-200" };
  const diffDays = Math.ceil(
    (dt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0)
    return {
      label: "Expirée",
      cls: "bg-red-100 text-red-800 border-red-200",
    };
  if (diffDays <= 30)
    return {
      label: `Expire dans ${diffDays} j`,
      cls: "bg-orange-100 text-orange-800 border-orange-200",
    };
  return { label: "Active", cls: "bg-green-100 text-green-800 border-green-200" };
}
function formatDate(d?: string | null): string {
  if (!d || d.trim() === "" || d === "null") return "—";
  const dt = parseISODate(d);
  if (!dt) return "—";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yy = dt.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

/* ===================== SIMPLE CHARTS (SVG, no deps) ===================== */
const ChartCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-orange-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:border-orange-200">
    <div className="mb-4">
      <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-orange-700 font-medium mt-1">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

const BarChartSVG: React.FC<{
  data: { label: string; value: number }[];
  height?: number;
}> = ({ data, height = 260 }) => {
  const width = 640;
  const margin = { top: 20, right: 20, bottom: 48, left: 40 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;
  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = (iw / Math.max(1, data.length)) * 0.6;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* axes */}
      <line
        x1={margin.left}
        y1={height - margin.bottom}
        x2={width - margin.right}
        y2={height - margin.bottom}
        className="stroke-gray-300"
      />
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={height - margin.bottom}
        className="stroke-gray-300"
      />

      {/* bars */}
      {data.map((d, i) => {
        const x =
          margin.left +
          (iw / data.length) * i +
          ((iw / data.length) - barW) / 2;
        const h = ih * (d.value / max);
        const y = height - margin.bottom - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={8}
              className="fill-orange-500"
            />
            <text
              x={x + barW / 2}
              y={y - 8}
              textAnchor="middle"
              className="fill-gray-800 text-[11px] font-bold"
            >
              {d.value.toLocaleString()}
            </text>
            <text
              x={x + barW / 2}
              y={height - margin.bottom + 16}
              textAnchor="middle"
              className="fill-orange-700 text-[10px] font-medium"
            >
              {d.label}
            </text>
          </g>
        );
      })}
      {/* gridlines */}
      {[0.25, 0.5, 0.75, 1].map((p, i) => {
        const y = margin.top + (1 - p) * ih;
        return (
          <line
            key={i}
            x1={margin.left}
            y1={y}
            x2={width - margin.right}
            y2={y}
            className="stroke-gray-200"
          />
        );
      })}
    </svg>
  );
};

const Sparkline: React.FC<{
  points: number[];
  height?: number;
  label?: string;
}> = ({ points, height = 160, label }) => {
  const width = 640;
  const margin = { top: 16, right: 12, bottom: 24, left: 32 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;

  const vals = points.length ? points : [0];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = Math.max(1, max - min);

  const path = vals
    .map((v, i) => {
      const x =
        margin.left +
        iw * (vals.length === 1 ? 0.5 : i / (vals.length - 1));
      const y = margin.top + ih - ((v - min) / range) * ih;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const last = vals[vals.length - 1] ?? 0;
  const first = vals[0] ?? 0;
  const delta = last - first;
  const positive = delta >= 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-orange-700 font-semibold">
          {label ?? "Évolution"}
        </div>
        <div
          className={`text-xs rounded-full px-2 py-0.5 ${
            positive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {positive ? "+" : ""}
          {delta.toLocaleString()}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* baseline */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          className="stroke-gray-200"
        />
        {/* area under line */}
        <path
          d={`${path} L ${width - margin.right} ${
            height - margin.bottom
          } L ${margin.left} ${height - margin.bottom} Z`}
          className="fill-orange-200/50"
        />
        {/* line */}
        <path d={path} className="stroke-orange-600 fill-none" strokeWidth={3} />
        {/* points */}
        {vals.map((v, i) => {
          const x =
            margin.left +
            iw * (vals.length === 1 ? 0.5 : i / (vals.length - 1));
          const y = margin.top + ih - ((v - min) / range) * ih;
          return <circle key={i} cx={x} cy={y} r={3} className="fill-orange-600" />;
        })}
      </svg>
    </div>
  );
};

/* ===================== PAGE ===================== */
const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    "users" | "equipment" | "software" | "suppliers" | "kpis"
  >("users");

  /* -------- USERS -------- */
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setUsersError(null);
      setUsersLoading(true);
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list: any[] = await res.json();
      const mapped: User[] = list.map((u) => ({
        id: u.id,
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        telephone: u.telephone,
        role: u.role,
      }));
      setUsers(mapped);
    } catch (e: any) {
      setUsersError(e?.message || "Erreur de chargement");
    } finally {
      setUsersLoading(false);
    }
  }
  useEffect(() => {
    if (activeSection === "users") loadUsers();
  }, [activeSection]);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  async function handleDelete(id: number) {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      alert(e?.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<
    Pick<User, "nom" | "prenom" | "email" | "telephone" | "role">
  >({ nom: "", prenom: "", email: "", telephone: "", role: "USER" });

  function openEdit(u: User) {
    setEditId(u.id);
    setEditData({
      nom: u.nom ?? "",
      prenom: u.prenom ?? "",
      email: u.email ?? "",
      telephone: u.telephone ?? "",
      role: u.role ?? "USER",
    });
    setEditError(null);
    setEditOpen(true);
  }
  function closeEdit() {
    setEditOpen(false);
    setEditId(null);
    setEditError(null);
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    try {
      setEditError(null);
      setEditSaving(true);
      const payload = {
        nom: editData.nom?.trim(),
        prenom: editData.prenom?.trim(),
        email: editData.email?.trim(),
        telephone: editData.telephone?.trim() || null,
        role: editData.role,
      };
      const res = await fetch(`/api/admin/users?id=${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const updated = await res.json().catch(() => ({ id: editId, ...payload }));
      setUsers((prev) => prev.map((u) => (u.id === editId ? { ...u, ...updated } : u)));
      setEditSaving(false);
      closeEdit();
    } catch (err: any) {
      setEditSaving(false);
      setEditError(err?.message || "Erreur lors de la mise à jour");
    }
  }

  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createData, setCreateData] = useState<{
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    role: string;
    motDePasse?: string;
  }>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "USER",
    motDePasse: "",
  });

  function openCreate() {
    setCreateData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      role: "USER",
      motDePasse: "",
    });
    setCreateError(null);
    setCreateOpen(true);
  }
  function closeCreate() {
    setCreateOpen(false);
    setCreateError(null);
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      setCreateError(null);
      setCreateSaving(true);
      const payload: any = {
        nom: createData.nom?.trim(),
        prenom: createData.prenom?.trim(),
        email: createData.email?.trim(),
        telephone: createData.telephone?.trim() || null,
        role: createData.role,
      };
      if (createData.motDePasse && createData.motDePasse.trim().length > 0) {
        payload.password = createData.motDePasse.trim();
      }
      const res = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const createdUser = await res.json();
      setUsers((prev) => [createdUser, ...prev]);
      setCreateSaving(false);
      closeCreate();
    } catch (err: any) {
      setCreateSaving(false);
      setCreateError(err?.message || "Erreur lors de la création");
    }
  }

  /* -------- MATERIELS -------- */
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [mLoading, setMLoading] = useState(false);
  const [mError, setMError] = useState<string | null>(null);

  async function loadMateriels(): Promise<Materiel[]> {
    try {
      setMError(null);
      setMLoading(true);
      const res = await fetch("/api/materiels", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list: Materiel[] = await res.json();
      setMateriels(list);
      return list;
    } catch (e: any) {
      setMError(e?.message || "Erreur de chargement des matériels");
      return [];
    } finally {
      setMLoading(false);
    }
  }

  /* -------- FOURNISSEURS -------- */
  const [suppliers, setSuppliers] = useState<Fournisseur[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  const [createFOpen, setCreateFOpen] = useState(false);
  const [createFSaving, setCreateFSaving] = useState(false);
  const [createFError, setCreateFError] = useState<string | null>(null);
  const [createFData, setCreateFData] = useState<{
    nom: string;
    adresse?: string;
    telephone?: string;
    email?: string;
  }>({ nom: "", adresse: "", telephone: "", email: "" });

  const [editFOpen, setEditFOpen] = useState(false);
  const [editFSaving, setEditFSaving] = useState(false);
  const [editFError, setEditFError] = useState<string | null>(null);
  const [editFId, setEditFId] = useState<number | null>(null);
  const [editFData, setEditFData] = useState<{
    nom: string;
    adresse?: string;
    telephone?: string;
    email?: string;
  }>({ nom: "", adresse: "", telephone: "", email: "" });

  async function loadSuppliers() {
    try {
      setSuppliersError(null);
      setSuppliersLoading(true);
      const res = await fetch("/api/fournisseurs", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSuppliers(
        Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []
      );
    } catch (e: any) {
      setSuppliersError(e?.message || "Erreur de chargement des fournisseurs");
    } finally {
      setSuppliersLoading(false);
    }
  }

  function openEditF(f: Fournisseur) {
    setEditFId(f.id);
    setEditFData({
      nom: f.nom || "",
      adresse: f.adresse || "",
      telephone: f.telephone || "",
      email: f.email || "",
    });
    setEditFError(null);
    setEditFOpen(true);
  }
  function closeEditF() {
    setEditFOpen(false);
    setEditFError(null);
    setEditFId(null);
  }

  async function submitCreateFournisseur(e: React.FormEvent) {
    e.preventDefault();
    try {
      setCreateFError(null);
      setCreateFSaving(true);
      const payload = {
        nom: (createFData.nom || "").trim(),
        adresse: (createFData.adresse || "").trim() || null,
        telephone: (createFData.telephone || "").trim() || null,
        email: (createFData.email || "").trim() || null,
      };
      const res = await fetch(`/api/fournisseurs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const created: Fournisseur = await res.json();
      setSuppliers((prev) => [created, ...prev]);
      setCreateFOpen(false);
      setCreateFData({ nom: "", adresse: "", telephone: "", email: "" });
    } catch (err: any) {
      setCreateFError(err?.message || "Erreur lors de la création");
    } finally {
      setCreateFSaving(false);
    }
  }

  async function submitEditFournisseur(e: React.FormEvent) {
    e.preventDefault();
    if (!editFId) return;
    try {
      setEditFError(null);
      setEditFSaving(true);
      const payload = {
        nom: (editFData.nom || "").trim(),
        adresse: (editFData.adresse || "").trim() || null,
        telephone: (editFData.telephone || "").trim() || null,
        email: (editFData.email || "").trim() || null,
      };
      const res = await fetch(`/api/fournisseurs?id=${editFId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const updated = await res.json().catch(() => ({ id: editFId, ...payload }));
      setSuppliers((prev) => prev.map((x) => (x.id === editFId ? { ...x, ...updated } : x)));
      setEditFSaving(false);
      setEditFOpen(false);
    } catch (err: any) {
      setEditFSaving(false);
      setEditFError(err?.message || "Erreur lors de la mise à jour");
    }
  }

  const [deletingSupplierId, setDeletingSupplierId] = useState<number | null>(null);
  async function handleDeleteFournisseur(id: number) {
    if (!confirm("Supprimer ce fournisseur ?")) return;
    try {
      setDeletingSupplierId(id);
      const res = await fetch(`/api/fournisseurs?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      setSuppliers((prev) => prev.filter((f) => f.id !== id));
    } catch (e: any) {
      alert(e?.message || "Erreur lors de la suppression");
    } finally {
      setDeletingSupplierId(null);
    }
  }

  useEffect(() => {
    if (activeSection === "equipment") {
      loadMateriels();
      loadSuppliers();
    } else if (activeSection === "suppliers") {
      loadSuppliers();
    }
  }, [activeSection]);

  // CREATE Matériel
  const [createMOpen, setCreateMOpen] = useState(false);
  const [createMSaving, setCreateMSaving] = useState(false);
  const [createMError, setCreateMError] = useState<string | null>(null);
  const [createMData, setCreateMData] = useState<{
    type: string;
    marque: string;
    modele: string;
    etat: string;
    utilisateurId?: number | "";
    fournisseurId?: number | "";
  }>({
    type: "",
    marque: "",
    modele: "",
    etat: "En service",
    utilisateurId: "",
    fournisseurId: "",
  });

  async function submitCreateMateriel(e: React.FormEvent) {
    e.preventDefault();
    try {
      setCreateMError(null);
      setCreateMSaving(true);
      const payload: any = {
        type: createMData.type?.trim(),
        marque: createMData.marque?.trim(),
        modele: createMData.modele?.trim(),
        etat: createMData.etat?.trim(),
      };
      if (createMData.utilisateurId)
        payload.utilisateurId = Number(createMData.utilisateurId);
      if (createMData.fournisseurId)
        payload.fournisseurId = Number(createMData.fournisseurId);

      const res = await fetch(`/api/materiels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const created = await res.json();
      setMateriels((prev) => [created, ...prev]);
      setCreateMOpen(false);
      setCreateMData({
        type: "",
        marque: "",
        modele: "",
        etat: "En service",
        utilisateurId: "",
        fournisseurId: "",
      });
    } catch (err: any) {
      setCreateMError(err?.message || "Erreur lors de la création");
    } finally {
      setCreateMSaving(false);
    }
  }

  /* -------- LOGICIELS -------- */
  const [logiciels, setLogiciels] = useState<Logiciel[]>([]);
  const [lLoading, setLLoading] = useState(false);
  const [lError, setLError] = useState<string | null>(null);
  const [selectedMaterielId, setSelectedMaterielId] = useState<number | "">("");

  function normalizeLogiciel(raw: any, mats: Materiel[] = []): Logiciel {
    const m = raw.materiel || {};
    let iso: string | null = null;

    if (typeof raw.dateExpiration === "string" && raw.dateExpiration.trim()) {
      iso = raw.dateExpiration;
    } else if (Array.isArray(raw.dateExpiration) && raw.dateExpiration.length >= 3) {
      const [y, mo, d] = raw.dateExpiration;
      iso = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    } else if (typeof raw.dateexpiration === "string" && raw.dateexpiration.trim()) {
      iso = raw.dateexpiration;
    } else if (typeof raw.date_expiration === "string" && raw.date_expiration.trim()) {
      iso = raw.date_expiration;
    }

    const materielId = raw.materielId ?? raw.materiel_id ?? m.id ?? null;

    const materielNom = raw.materielNom ?? raw.materiel_nom ?? null;

    const nameById = new Map(
      mats.map(
        (mm) =>
          [mm.id, `${mm.type ?? "—"} — ${mm.modele ?? "—"} (${mm.marque ?? "—"})`] as const
      )
    );

    return {
      id: raw.id,
      nom: raw.nom,
      version: raw.version ?? null,
      editeur: raw.editeur ?? null,
      licence: raw.licence ?? null,
      dateExpiration: iso,
      materielId,
      materielNom: materielNom ?? nameById.get(materielId ?? -1) ?? null,
    };
  }

  async function loadLogiciels(mid?: number | "") {
    try {
      setLError(null);
      setLLoading(true);
      if (!mid) {
        setLogiciels([]);
        return;
      }
      const res = await fetch(`/api/logiciels?materielId=${mid}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [data];
      setLogiciels(list.map((r) => normalizeLogiciel(r, materiels)));
    } catch (e: any) {
      setLError(e?.message || "Erreur de chargement des logiciels");
    } finally {
      setLLoading(false);
    }
  }

  function openCreateLogiciel() {
    setCreateLData({
      nom: "",
      version: "",
      editeur: "",
      licence: "",
      dateExpiration: "",
      materielId: selectedMaterielId || "",
    });
    setCreateLError(null);
    setCreateLOpen(true);
  }
  function closeCreateLogiciel() {
    setCreateLOpen(false);
    setCreateLError(null);
  }

  const [createLOpen, setCreateLOpen] = useState(false);
  const [createLSaving, setCreateLSaving] = useState(false);
  const [createLError, setCreateLError] = useState<string | null>(null);
  const [createLData, setCreateLData] = useState<{
    nom: string;
    version?: string;
    editeur?: string;
    licence?: string;
    dateExpiration?: string;
    materielId?: number | "";
  }>({
    nom: "",
    version: "",
    editeur: "",
    licence: "",
    dateExpiration: "",
    materielId: "",
  });

  const [editLOpen, setEditLOpen] = useState(false);
  const [editLSaving, setEditLSaving] = useState(false);
  const [editLError, setEditLError] = useState<string | null>(null);
  const [editLId, setEditLId] = useState<number | null>(null);
  const [editLData, setEditLData] = useState<{
    nom?: string;
    version?: string;
    editeur?: string;
    licence?: string;
    dateExpiration?: string;
    materielId?: number | "";
  }>({});

  async function submitCreateLogiciel(e: React.FormEvent) {
    e.preventDefault();
    try {
      setCreateLError(null);
      setCreateLSaving(true);
      const payload: any = {
        nom: (createLData.nom || "").trim(),
        version: (createLData.version || "").trim() || null,
        editeur: (createLData.editeur || "").trim() || null,
        licence: (createLData.licence || "").trim() || null,
        dateExpiration: createLData.dateExpiration || null,
        materielId: createLData.materielId ? Number(createLData.materielId) : null,
      };
      const res = await fetch(`/api/logiciels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const created = await res.json();
      setLogiciels((prev) => [normalizeLogiciel(created, materiels), ...prev]);
      setCreateLSaving(false);
      closeCreateLogiciel();
    } catch (err: any) {
      setCreateLSaving(false);
      setCreateLError(err?.message || "Erreur lors de la création");
    }
  }

  function openEditLogiciel(l: Logiciel) {
    setEditLId(l.id);
    setEditLData({
      nom: l.nom || "",
      version: l.version || "",
      editeur: l.editeur || "",
      licence: l.licence || "",
      dateExpiration: l.dateExpiration || "",
      materielId: l.materielId ?? "",
    });
    setEditLError(null);
    setEditLOpen(true);
  }
  function closeEditLogiciel() {
    setEditLOpen(false);
    setEditLId(null);
    setEditLError(null);
  }

  async function submitEditLogiciel(e: React.FormEvent) {
    e.preventDefault();
    if (!editLId) return;
    try {
      setEditLError(null);
      setEditLSaving(true);
      const payload: any = {
        nom: (editLData.nom || "").trim(),
        version: (editLData.version || "").trim() || null,
        editeur: (editLData.editeur || "").trim() || null,
        licence: (editLData.licence || "").trim() || null,
        dateExpiration: editLData.dateExpiration || null,
        materielId: editLData.materielId ? Number(editLData.materielId) : null,
      };
      const res = await fetch(`/api/logiciels?id=${editLId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const updated = await res.json().catch(() => ({ id: editLId, ...payload }));
      setLogiciels((prev) =>
        prev.map((x) =>
          x.id === editLId ? normalizeLogiciel({ ...x, ...updated }, materiels) : x
        )
      );
      setEditLSaving(false);
      closeEditLogiciel();
    } catch (err: any) {
      setEditLSaving(false);
      setEditLError(err?.message || "Erreur lors de la mise à jour");
    }
  }

  // load default materiel & logiciels when entering "software"
  useEffect(() => {
    if (activeSection === "software") {
      loadMateriels().then((list) => {
        if (!selectedMaterielId && list.length > 0) {
          const firstId = list[0].id;
          setSelectedMaterielId(firstId);
          loadLogiciels(firstId);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "software") loadLogiciels(selectedMaterielId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaterielId]);

  /* ===================== KPI ===================== */
  const [kpiValues, setKpiValues] = useState<Record<KPIKey, number>>({
    users: 0,
    equipements: 0,
    licences: 0,
    tickets: 0,
    fournisseurs: 0,
    contrats: 0,
  });
  const [kpiTrends, setKpiTrends] = useState<Record<KPIKey, number>>({
    users: 0,
    equipements: 0,
    licences: 0,
    tickets: 0,
    fournisseurs: 0,
    contrats: 0,
  });
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiError, setKpiError] = useState<string | null>(null);

  const [kpiHistory, setKpiHistory] = useState<KpiSnapshot[]>([]);

  function loadHistory() {
    try {
      const raw = localStorage.getItem("kpi.history");
      const hist: KpiSnapshot[] = raw ? JSON.parse(raw) : [];
      setKpiHistory(hist);
    } catch {
      /* ignore */
    }
  }

  function pushHistory(current: Record<KPIKey, number>) {
    try {
      const raw = localStorage.getItem("kpi.history");
      const hist: KpiSnapshot[] = raw ? JSON.parse(raw) : [];
      const last = hist[hist.length - 1];
      const changed = !last || JSON.stringify(last.vals) !== JSON.stringify(current);
      const oldEnough = !last || Date.now() - last.t > 30 * 60 * 1000;
      if (changed || oldEnough) {
        const next = [...hist, { t: Date.now(), vals: current }].slice(-20);
        localStorage.setItem("kpi.history", JSON.stringify(next));
        setKpiHistory(next);
      }
    } catch {
      /* ignore */
    }
  }

  function saveAndComputeTrends(current: Record<KPIKey, number>) {
    try {
      const raw = localStorage.getItem("kpi.previous");
      const prev: Partial<Record<KPIKey, number>> = raw ? JSON.parse(raw) : {};
      const trends: Record<KPIKey, number> = {
        users: 0,
        equipements: 0,
        licences: 0,
        tickets: 0,
        fournisseurs: 0,
        contrats: 0,
      };
      (Object.keys(current) as KPIKey[]).forEach((k) => {
        const p = prev[k] ?? 0;
        const c = current[k];
        trends[k] = p === 0 ? 0 : ((c - p) / p) * 100;
      });
      setKpiTrends(trends);
      localStorage.setItem("kpi.previous", JSON.stringify(current));
    } catch {
      // ignore storage errors
    }
  }

  async function countArrayEndpoint(url: string): Promise<number> {
    try {
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      if (Array.isArray(data)) return data.length;
      if (Array.isArray(data?.content)) return data.content.length;
      if (typeof data?.count === "number") return data.count;
      if (Array.isArray(data?.items)) return data.items.length;
      return 0;
    } catch {
      return 0;
    }
  }

  async function fetchAllLogiciels(): Promise<Logiciel[]> {
    try {
      const r = await fetch("/api/logiciels", { credentials: "include" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      const list = Array.isArray(json)
        ? json
        : Array.isArray(json?.content)
        ? json.content
        : [];
      return list.map((l: any) => ({
        id: l.id,
        nom: l.nom,
        version: l.version ?? null,
        editeur: l.editeur ?? null,
        licence: l.licence ?? null,
        dateExpiration: l.dateExpiration ?? l.dateexpiration ?? null,
        materielId: l.materielId ?? null,
        materielNom: l.materielNom ?? null,
      }));
    } catch {
      return [];
    }
  }

  async function loadKpis() {
    try {
      setKpiError(null);
      setKpiLoading(true);

      const [uCount, eCount, fournisseursCount] = await Promise.all([
        countArrayEndpoint("/api/admin/users"),
        countArrayEndpoint("/api/materiels"),
        countArrayEndpoint("/api/fournisseurs"),
      ]);

      const logicielsAll = await fetchAllLogiciels();
      const now = new Date().setHours(0, 0, 0, 0);
      const licencesActives = logicielsAll.filter((l) => {
        if (!l.dateExpiration || l.dateExpiration === "null" || String(l.dateExpiration).trim() === "")
          return true;
        const dt = parseISODate(l.dateExpiration);
        return !!dt && dt.getTime() >= now;
      }).length;

      let ticketsOuverts = 0;
      try {
        const r = await fetch("/api/tickets?status=OPEN", {
          credentials: "include",
        });
        if (r.ok) {
          const d = await r.json();
          if (Array.isArray(d)) ticketsOuverts = d.length;
          else if (Array.isArray(d?.content)) ticketsOuverts = d.content.length;
          else if (typeof d?.open === "number") ticketsOuverts = d.open;
          else if (Array.isArray(d?.items)) ticketsOuverts = d.items.length;
        }
      } catch {}

      let contratsActifs = 0;
      try {
        const r = await fetch("/api/contrats?status=active", {
          credentials: "include",
        });
        if (r.ok) {
          const d = await r.json();
          if (Array.isArray(d)) contratsActifs = d.length;
          else if (Array.isArray(d?.content)) contratsActifs = d.content.length;
          else if (typeof d?.count === "number") contratsActifs = d.count;
        }
      } catch {}

      const current = {
        users: uCount,
        equipements: eCount,
        licences: licencesActives,
        tickets: ticketsOuverts,
        fournisseurs: fournisseursCount,
        contrats: contratsActifs,
      };
      setKpiValues(current);
      pushHistory(current);
      saveAndComputeTrends(current);
    } catch (e: any) {
      setKpiError(e?.message || "Erreur lors du calcul des KPI");
    } finally {
      setKpiLoading(false);
    }
  }

  useEffect(() => {
    if (activeSection === "kpis") {
      loadKpis();
      loadHistory();
    }
  }, [activeSection]);

  function formatTrend(pct: number) {
    const sign = pct > 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}%`;
  }

  function exportKpiCsv() {
    const rows = [
      ["Indicateur", "Valeur", "Tendance", "Généré le"],
      [
        "Utilisateurs Actifs",
        String(kpiValues.users),
        formatTrend(kpiTrends.users),
        new Date().toISOString(),
      ],
      [
        "Équipements",
        String(kpiValues.equipements),
        formatTrend(kpiTrends.equipements),
        new Date().toISOString(),
      ],
      [
        "Licences Actives",
        String(kpiValues.licences),
        formatTrend(kpiTrends.licences),
        new Date().toISOString(),
      ],
      [
        "Tickets Ouverts",
        String(kpiValues.tickets),
        formatTrend(kpiTrends.tickets),
        new Date().toISOString(),
      ],
      [
        "Fournisseurs",
        String(kpiValues.fournisseurs),
        formatTrend(kpiTrends.fournisseurs),
        new Date().toISOString(),
      ],
      [
        "Contrats Actifs",
        String(kpiValues.contrats),
        formatTrend(kpiTrends.contrats),
        new Date().toISOString(),
      ],
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpis_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const menuItems = [
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "equipment", label: "Parc Informatique", icon: Monitor },
    { id: "software", label: "Logiciels & Licences", icon: Package },
    { id: "suppliers", label: "Fournisseurs", icon: Building2 },
    { id: "kpis", label: "Indicateurs KPI", icon: TrendingUp },
  ] as const;

  /* -------- RENDERERS -------- */
  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Gestion des Utilisateurs
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-orange-200 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700 font-medium">Actualiser</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Nouvel Utilisateur</span>
          </button>
        </div>
      </div>

      {usersError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {usersError}
        </div>
      )}
      {usersLoading && <div className="text-sm text-gray-500">Chargement…</div>}

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-orange-100 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Prénom
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-300"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {u.nom || "—"}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {u.prenom || "—"}
                  </td>
                  <td className="px-6 py-4 text-orange-700">{u.email}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {u.telephone || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        normalizeRole(u.role) === "admin"
                          ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200"
                          : normalizeRole(u.role) === "technicien"
                          ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200"
                          : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {normalizeRole(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-orange-600 hover:text-orange-900 p-2 rounded-xl hover:bg-orange-100 transition-all duration-300 transform hover:scale-110"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-xl hover:bg-red-100 transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
                        title="Supprimer"
                        disabled={deletingId === u.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!usersLoading && users.length === 0 && !usersError && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeCreate}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Nouvel utilisateur
              </h3>
              <button
                onClick={closeCreate}
                className="text-gray-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all duration-300"
              >
                ✕
              </button>
            </div>
            {createError && (
              <div className="mb-4 p-4 text-sm rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-red-700">
                {createError}
              </div>
            )}
            <form onSubmit={submitCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Nom
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createData.nom}
                    onChange={(e) =>
                      setCreateData((s) => ({ ...s, nom: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Prénom
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createData.prenom}
                    onChange={(e) =>
                      setCreateData((s) => ({ ...s, prenom: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createData.email}
                    onChange={(e) =>
                      setCreateData((s) => ({ ...s, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createData.telephone ?? ""}
                    onChange={(e) =>
                      setCreateData((s) => ({ ...s, telephone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Rôle
                  </label>
                  <select
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createData.role}
                    onChange={(e) =>
                      setCreateData((s) => ({ ...s, role: e.target.value }))
                    }
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="TECH">TECH</option>
                    <option value="USER">USER</option>
                    <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    <option value="ROLE_TECH">ROLE_TECH</option>
                    <option value="ROLE_USER">ROLE_USER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Mot de passe (optionnel)
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createData.motDePasse ?? ""}
                    onChange={(e) =>
                      setCreateData((s) => ({ ...s, motDePasse: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeCreate}
                  className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-medium"
                  disabled={createSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  disabled={createSaving}
                >
                  {createSaving ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEdit} />
          <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Modifier l'utilisateur
              </h3>
              <button
                onClick={closeEdit}
                className="text-gray-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all duration-300"
              >
                ✕
              </button>
            </div>
            {editError && (
              <div className="mb-4 p-4 text-sm rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-red-700">
                {editError}
              </div>
            )}
            <form onSubmit={submitEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Nom
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editData.nom}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, nom: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Prénom
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editData.prenom}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, prenom: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editData.telephone ?? ""}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, telephone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Rôle
                  </label>
                  <select
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editData.role}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, role: e.target.value }))
                    }
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="TECH">TECH</option>
                    <option value="USER">USER</option>
                    <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    <option value="ROLE_TECH">ROLE_TECH</option>
                    <option value="ROLE_USER">ROLE_USER</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-medium"
                  disabled={editSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  disabled={editSaving}
                >
                  {editSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderEquipment = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Parc Informatique
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={loadMateriels}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-orange-200 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700 font-medium">Actualiser</span>
          </button>
          <button
            onClick={() => setCreateMOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Nouvel Équipement</span>
          </button>
        </div>
      </div>

      {mError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {mError}
        </div>
      )}
      {mLoading && <div className="text-sm text-gray-500">Chargement…</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {materiels.map((m) => {
          const IconComponent = getEquipmentIcon(m.type || "");
          return (
            <div
              key={m.id}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-orange-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:border-orange-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl shadow-lg">
                    <IconComponent className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {m.type} — {m.modele}
                    </h3>
                    <p className="text-sm text-orange-600 font-medium">
                      {m.marque}
                    </p>
                    {m.utilisateurNomComplet && (
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        Assigné à: {m.utilisateurNomComplet}
                      </p>
                    )}
                    {m.fournisseurNom && (
                      <p className="text-xs text-gray-600 font-medium">
                        Fournisseur: {m.fournisseurNom}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${getStatusColor(
                    m.etat || ""
                  )}`}
                >
                  {m.etat}
                </span>
              </div>
            </div>
          );
        })}
        {!mLoading && materiels.length === 0 && !mError && (
          <div className="col-span-full text-center text-gray-500 text-sm">
            Aucun matériel trouvé
          </div>
        )}
      </div>

      {/* CREATE MATERIEL MODAL */}
      {createMOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setCreateMOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Nouvel Équipement
              </h3>
              <button
                onClick={() => setCreateMOpen(false)}
                className="text-gray-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all duration-300"
              >
                ✕
              </button>
            </div>

            {createMError && (
              <div className="mb-4 p-4 text-sm rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-red-700">
                {createMError}
              </div>
            )}

            <form onSubmit={submitCreateMateriel} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Type
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createMData.type}
                    onChange={(e) =>
                      setCreateMData((s) => ({ ...s, type: e.target.value }))
                    }
                    placeholder="Ordinateur / Portable / Imprimante…"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Marque
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createMData.marque}
                    onChange={(e) =>
                      setCreateMData((s) => ({ ...s, marque: e.target.value }))
                    }
                    placeholder="Dell / HP / Canon…"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Modèle
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createMData.modele}
                    onChange={(e) =>
                      setCreateMData((s) => ({ ...s, modele: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    État
                  </label>
                  <select
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createMData.etat}
                    onChange={(e) =>
                      setCreateMData((s) => ({ ...s, etat: e.target.value }))
                    }
                  >
                    <option>En service</option>
                    <option>En maintenance</option>
                    <option>Inactif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Utilisateur (optionnel)
                  </label>
                  <select
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createMData.utilisateurId ?? ""}
                    onChange={(e) =>
                      setCreateMData((s) => ({
                        ...s,
                        utilisateurId: e.target.value ? Number(e.target.value) : "",
                      }))
                    }
                  >
                    <option value="">— Non assigné —</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nom} {u.prenom} — {u.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Fournisseur (optionnel)
                  </label>
                  <select
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createMData.fournisseurId ?? ""}
                    onChange={(e) =>
                      setCreateMData((s) => ({
                        ...s,
                        fournisseurId: e.target.value ? Number(e.target.value) : "",
                      }))
                    }
                  >
                    <option value="">{suppliersLoading ? "Chargement..." : "— Aucun —"}</option>
                    {suppliers.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setCreateMOpen(false)}
                  className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-medium"
                  disabled={createMSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  disabled={createMSaving}
                >
                  {createMSaving ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderSoftware = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Logiciels & Licences
          </h2>
          <select
            className="rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
            value={selectedMaterielId ?? ""}
            onChange={(e) =>
              setSelectedMaterielId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">— Choisir un matériel —</option>
            {materiels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.type} — {m.modele} ({m.marque})
              </option>
            ))}
          </select>
          <button
            onClick={() => loadLogiciels(selectedMaterielId)}
            className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-xl border border-orange-200 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700 font-medium">Actualiser</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateLogiciel}
            disabled={!selectedMaterielId}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            title={!selectedMaterielId ? "Sélectionnez un matériel d'abord" : ""}
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Nouveau Logiciel</span>
          </button>
        </div>
      </div>

      {lError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {lError}
        </div>
      )}
      {lLoading && <div className="text-sm text-gray-500">Chargement…</div>}

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-orange-100 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Logiciel
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Éditeur
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Licence
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Matériel
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {logiciels.map((l) => {
                const badge = expirationBadge(l.dateExpiration);
                const shown = formatDate(l.dateExpiration);
                return (
                  <tr
                    key={l.id}
                    className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-300"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{l.nom}</div>
                    </td>
                    <td className="px-6 py-4 text-orange-700 font-medium">
                      {l.version || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {l.editeur || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {l.licence || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600">{shown}</span>
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-orange-700 font-medium">
                        {l.materielNom || (l.materielId ? `ID: ${l.materielId}` : "—")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditLogiciel(l)}
                          className="text-orange-600 hover:text-orange-900 p-2 rounded-xl hover:bg-orange-100 transition-all duration-300 transform hover:scale-110"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!lLoading && logiciels.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    Aucun logiciel trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE LOGICIEL MODAL */}
      {createLOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeCreateLogiciel}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Nouveau Logiciel
              </h3>
              <button
                onClick={closeCreateLogiciel}
                className="text-gray-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all duration-300"
              >
                ✕
              </button>
            </div>
            {createLError && (
              <div className="mb-4 p-4 text-sm rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-red-700">
                {createLError}
              </div>
            )}
            <form onSubmit={submitCreateLogiciel} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Nom
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createLData.nom}
                    onChange={(e) =>
                      setCreateLData((s) => ({ ...s, nom: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Version
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createLData.version || ""}
                    onChange={(e) =>
                      setCreateLData((s) => ({ ...s, version: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Éditeur
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createLData.editeur || ""}
                    onChange={(e) =>
                      setCreateLData((s) => ({ ...s, editeur: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Licence
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createLData.licence || ""}
                    onChange={(e) =>
                      setCreateLData((s) => ({ ...s, licence: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Expiration
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createLData.dateExpiration || ""}
                    onChange={(e) =>
                      setCreateLData((s) => ({
                        ...s,
                        dateExpiration: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Matériel
                  </label>
                  <select
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createLData.materielId ?? ""}
                    onChange={(e) =>
                      setCreateLData((s) => ({
                        ...s,
                        materielId: e.target.value ? Number(e.target.value) : "",
                      }))
                    }
                    required
                  >
                    <option value="">— Choisir —</option>
                    {materiels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.type} — {m.modele} ({m.marque})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeCreateLogiciel}
                  className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-medium"
                  disabled={createLSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  disabled={createLSaving}
                >
                  {createLSaving ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LOGICIEL MODAL */}
      {editLOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEditLogiciel} />
          <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Modifier le logiciel
              </h3>
              <button
                onClick={closeEditLogiciel}
                className="text-gray-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all duration-300"
              >
                ✕
              </button>
            </div>
            {editLError && (
              <div className="mb-4 p-4 text-sm rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-red-700">
                {editLError}
              </div>
            )}
            <form onSubmit={submitEditLogiciel} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Nom
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editLData.nom || ""}
                    onChange={(e) =>
                      setEditLData((s) => ({ ...s, nom: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Version
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editLData.version || ""}
                    onChange={(e) =>
                      setEditLData((s) => ({ ...s, version: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Éditeur
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editLData.editeur || ""}
                    onChange={(e) =>
                      setEditLData((s) => ({ ...s, editeur: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Licence
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editLData.licence || ""}
                    onChange={(e) =>
                      setEditLData((s) => ({ ...s, licence: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Expiration
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editLData.dateExpiration || ""}
                    onChange={(e) =>
                      setEditLData((s) => ({ ...s, dateExpiration: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Matériel
                  </label>
                  <select
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editLData.materielId ?? ""}
                    onChange={(e) =>
                      setEditLData((s) => ({
                        ...s,
                        materielId: e.target.value ? Number(e.target.value) : "",
                      }))
                    }
                    required
                  >
                    <option value="">— Choisir —</option>
                    {materiels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.type} — {m.modele} ({m.marque})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeEditLogiciel}
                  className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-medium"
                  disabled={editLSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  disabled={editLSaving}
                >
                  {editLSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderSuppliers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Fournisseurs
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSuppliers}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-orange-200 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700 font-medium">Actualiser</span>
          </button>
          <button
            onClick={() => {
              setCreateFOpen(true);
              setCreateFError(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Nouveau Fournisseur</span>
          </button>
        </div>
      </div>

      {suppliersError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {suppliersError}
        </div>
      )}
      {suppliersLoading && <div className="text-sm text-gray-500">Chargement…</div>}

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-orange-100 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {suppliers.map((f) => (
                <tr
                  key={f.id}
                  className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-300"
                >
                  <td className="px-6 py-4 font-bold text-gray-900">{f.nom}</td>
                  <td className="px-6 py-4 text-gray-600">{f.adresse || "—"}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {f.telephone || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {f.email ? (
                      <a
                        className="text-orange-700 hover:text-orange-900 hover:underline font-medium"
                        href={`mailto:${f.email}`}
                      >
                        {f.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditF(f)}
                        className="text-orange-600 hover:text-orange-900 p-2 rounded-xl hover:bg-orange-100 transition-all duration-300 transform hover:scale-110"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFournisseur(f.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-xl hover:bg-red-100 transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
                        title="Supprimer"
                        disabled={deletingSupplierId === f.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!suppliersLoading && suppliers.length === 0 && !suppliersError && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    Aucun fournisseur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE FOURNISSEUR MODAL */}
      {createFOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setCreateFOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Nouveau Fournisseur
              </h3>
              <button
                onClick={() => setCreateFOpen(false)}
                className="text-gray-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all duration-300"
              >
                ✕
              </button>
            </div>
            {createFError && (
              <div className="mb-4 p-4 text-sm rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-red-700">
                {createFError}
              </div>
            )}
            <form onSubmit={submitCreateFournisseur} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Nom
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createFData.nom}
                    onChange={(e) =>
                      setCreateFData((s) => ({ ...s, nom: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Adresse
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createFData.adresse || ""}
                    onChange={(e) =>
                      setCreateFData((s) => ({ ...s, adresse: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createFData.telephone || ""}
                    onChange={(e) =>
                      setCreateFData((s) => ({ ...s, telephone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={createFData.email || ""}
                    onChange={(e) =>
                      setCreateFData((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setCreateFOpen(false)}
                  className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-medium"
                  disabled={createFSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  disabled={createFSaving}
                >
                  {createFSaving ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FOURNISSEUR MODAL */}
      {editFOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEditF} />
          <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Modifier le fournisseur
              </h3>
              <button
                onClick={closeEditF}
                className="text-gray-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all duration-300"
              >
                ✕
              </button>
            </div>
            {editFError && (
              <div className="mb-4 p-4 text-sm rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-red-700">
                {editFError}
              </div>
            )}
            <form onSubmit={submitEditFournisseur} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Nom
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editFData.nom}
                    onChange={(e) =>
                      setEditFData((s) => ({ ...s, nom: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Adresse
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editFData.adresse || ""}
                    onChange={(e) =>
                      setEditFData((s) => ({ ...s, adresse: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editFData.telephone || ""}
                    onChange={(e) =>
                      setEditFData((s) => ({ ...s, telephone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-xl transition-all duration-300"
                    value={editFData.email || ""}
                    onChange={(e) =>
                      setEditFData((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeEditF}
                  className="px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-medium"
                  disabled={editFSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  disabled={editFSaving}
                >
                  {editFSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  /* ---- KPI RENDERER ---- */
  const renderKpis = () => {
    const cards = [
      {
        key: "users" as KPIKey,
        title: "Utilisateurs Actifs",
        value: kpiValues.users,
        trend: kpiTrends.users,
        icon: Users,
        color: "blue",
      },
      {
        key: "equipements" as KPIKey,
        title: "Équipements",
        value: kpiValues.equipements,
        trend: kpiTrends.equipements,
        icon: Monitor,
        color: "green",
      },
      {
        key: "licences" as KPIKey,
        title: "Licences Actives",
        value: kpiValues.licences,
        trend: kpiTrends.licences,
        icon: Key,
        color: "purple",
      },
      {
        key: "tickets" as KPIKey,
        title: "Tickets Ouverts",
        value: kpiValues.tickets,
        trend: kpiTrends.tickets,
        icon: AlertTriangle,
        color: "orange",
      },
      {
        key: "fournisseurs" as KPIKey,
        title: "Fournisseurs",
        value: kpiValues.fournisseurs,
        trend: kpiTrends.fournisseurs,
        icon: Building2,
        color: "indigo",
      },
      {
        key: "contrats" as KPIKey,
        title: "Contrats Actifs",
        value: kpiValues.contrats,
        trend: kpiTrends.contrats,
        icon: FileText,
        color: "emerald",
      },
    ];
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Indicateurs KPI
            </h2>
            <p className="text-orange-700 mt-2 font-medium">
              Panneau d'administration TechOasis - ORMVA
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadKpis}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-orange-200 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <RefreshCw
                className={`h-4 w-4 text-orange-600 ${kpiLoading ? "animate-spin" : ""}`}
              />
              <span className="text-orange-700 font-medium">Actualiser</span>
            </button>
            <button
              onClick={exportKpiCsv}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Download className="h-4 w-4" />
              <span className="font-medium">Exporter</span>
            </button>
          </div>
        </div>

        {kpiError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {kpiError}
          </div>
        )}
        {kpiLoading && (
          <div className="text-sm text-gray-500">Calcul des indicateurs…</div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c, i) => {
            const IconComponent = c.icon;
            const positive = c.trend >= 0;
            return (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-orange-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:border-orange-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 shadow-lg">
                    <IconComponent className="h-8 w-8 text-orange-600" />
                  </div>
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      positive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <TrendingUp className={`h-4 w-4 ${positive ? "" : "rotate-180"}`} />
                    {formatTrend(c.trend)}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-orange-700">{c.title}</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                    {c.value.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ====== DIAGRAMMES ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Répartition actuelle (barres)" subtitle="Valeurs actuelles par indicateur">
            <BarChartSVG
              data={[
                { label: "Users", value: kpiValues.users },
                { label: "Équip.", value: kpiValues.equipements },
                { label: "Licences", value: kpiValues.licences },
                { label: "Tickets", value: kpiValues.tickets },
                { label: "Fourn.", value: kpiValues.fournisseurs },
                { label: "Contrats", value: kpiValues.contrats },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Évolution des utilisateurs"
            subtitle="Série temporelle locale (dernier 20 points)"
          >
            <Sparkline label="Utilisateurs Actifs" points={kpiHistory.map((h) => h.vals.users)} />
          </ChartCard>
        </div>

        <p className="text-xs text-gray-500">
          Les diagrammes d'évolution utilisent un historique stocké localement (navigateur). Il peut
          se réinitialiser si vous videz le stockage local.
        </p>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return renderUsers();
      case "equipment":
        return renderEquipment();
      case "software":
        return renderSoftware();
      case "suppliers":
        return renderSuppliers();
      case "kpis":
        return renderKpis();
      default:
        return renderUsers();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl min-h-screen border-r border-orange-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-500 to-red-500 flex items-center justify-center shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-sm text-orange-600 font-medium">TechOasis</p>
              </div>
            </div>
          </div>

          <nav className="p-6">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() =>
                        setActiveSection(item.id as typeof activeSection)
                      }
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 ${
                        activeSection === (item.id as typeof activeSection)
                          ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 font-semibold shadow-lg border border-orange-200"
                          : "text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-700 hover:shadow-md"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Main */}
        <div className="flex-1 p-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent">
                    {menuItems.find((item) => item.id === activeSection)?.label ||
                      "Administration"}
                  </h1>
                  <p className="text-orange-700 mt-2 font-medium">
                    Panneau d'administration TechOasis - ORMVA
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (activeSection === "users") loadUsers();
                      if (activeSection === "equipment") {
                        loadMateriels();
                        loadSuppliers();
                      }
                      if (activeSection === "software")
                        loadLogiciels(selectedMaterielId);
                      if (activeSection === "suppliers") loadSuppliers();
                      if (activeSection === "kpis") loadKpis();
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-orange-200 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-700 font-medium">Actualiser</span>
                  </button>
                  <button
                    onClick={() => {
                      if (activeSection === "kpis") exportKpiCsv();
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:via-amber-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Download className="h-4 w-4" />
                    <span className="font-medium">Exporter</span>
                  </button>
                </div>
              </div>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
