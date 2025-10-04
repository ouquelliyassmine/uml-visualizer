// components/materiels-table.tsx
type Materiel = {
  id: number | string;
  type: string;
  marque: string;
  modele: string;
  etat: string;
};

export default function MaterielsTable({ items }: { items: Materiel[] }) {
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
          {items.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="p-3 font-medium">{e.type}</td>
              <td className="p-3">{e.marque}</td>
              <td className="p-3">{e.modele}</td>
              <td className="p-3">{e.etat}</td>
            </tr>
          ))}
          {items.length === 0 && (
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

