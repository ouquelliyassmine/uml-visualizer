"use client";

import { Badge } from "@/components/ui/badge";

export type Materiel = {
  id: string | number;
  type: string;
  marque: string;
  modele: string;
  etat?: string | null; 
};

function fmtEtat(e?: string | null) {
  if (!e) return "-";
  const k = e.toUpperCase().replace(/\s+/g, "_");
  const map: Record<string, string> = {
    EN_SERVICE: "En service",
    EN_PANNE: "En panne",
    HORS_SERVICE: "Hors service",
  };
  return map[k] ?? e;
}

function EtatPill({ etat }: { etat?: string | null }) {
  const k = (etat || "").toUpperCase().replace(/\s+/g, "_");
  const variant = k === "EN_SERVICE" ? "default" : k === "EN_PANNE" ? "destructive" : "secondary";
  return <Badge variant={variant}>{fmtEtat(etat)}</Badge>;
}

export default function EquipmentTable({ items = [] }: { items?: Materiel[] | null }) {
  
  const list = Array.isArray(items) ? items : [];

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-left">
            <th className="p-3">Type</th>
            <th className="p-3">Marque</th>
            <th className="p-3">Modèle</th>
            <th className="p-3">État</th>
          </tr>
        </thead>
        <tbody>
          {list.length ? (
            list.map((e) => (
              <tr key={String(e.id)} className="border-t">
                <td className="p-3 font-medium">{e.type}</td>
                <td className="p-3">{e.marque}</td>
                <td className="p-3">{e.modele}</td>
                <td className="p-3"><EtatPill etat={e.etat} /></td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-6 text-center text-muted-foreground" colSpan={4}>
                Aucun équipement affecté pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

