package org.example.parkinformatique.mappers;

import org.example.parkinformatique.dto.MaterielDTO;
import org.example.parkinformatique.entities.Materiel;
import org.example.parkinformatique.entities.Fournisseur;
import org.example.parkinformatique.entities.Utilisateur;

public final class MaterielMapper {
    private MaterielMapper() {}

    // Entity -> DTO
    public static MaterielDTO toDTO(Materiel m) {
        if (m == null) return null;

        Long utilisateurId = null;
        String utilisateurNomComplet = null;
        if (m.getUtilisateur() != null) {
            utilisateurId = m.getUtilisateur().getId();
            String nom = m.getUtilisateur().getNom() != null ? m.getUtilisateur().getNom() : "";
            String prenom = m.getUtilisateur().getPrenom() != null ? m.getUtilisateur().getPrenom() : "";
            utilisateurNomComplet = (nom + " " + prenom).trim();
            if (utilisateurNomComplet.isBlank()) utilisateurNomComplet = null;
        }

        Long fournisseurId = null;
        String fournisseurNom = null;
        if (m.getFournisseur() != null) {
            fournisseurId = m.getFournisseur().getId();
            fournisseurNom = m.getFournisseur().getNom();
        }

        return new MaterielDTO(
                m.getId(),
                m.getType(),
                m.getMarque(),
                m.getModele(),
                m.getEtat(),
                utilisateurId,
                utilisateurNomComplet,
                fournisseurId,
                fournisseurNom
        );
    }

    // DTO -> Entity (لإنشاء جديد) — الميثود كتقبل الكيانات المرتبطة جاهزين
    public static Materiel fromDTO(MaterielDTO dto, Utilisateur utilisateur, Fournisseur fournisseur) {
        if (dto == null) return null;
        Materiel m = new Materiel();
        // ملاحظة: ما كنعيّنش id من DTO فالغالب فـcreate
        m.setType(dto.type());
        m.setMarque(dto.marque());
        m.setModele(dto.modele());
        m.setEtat(dto.etat());
        m.setUtilisateur(utilisateur);
        m.setFournisseur(fournisseur);
        return m;
    }

    // تحديث Entity موجود انطلاقاً من DTO
    public static void updateEntity(Materiel m, MaterielDTO dto, Utilisateur utilisateur, Fournisseur fournisseur) {
        if (m == null || dto == null) return;
        m.setType(dto.type());
        m.setMarque(dto.marque());
        m.setModele(dto.modele());
        m.setEtat(dto.etat());
        if (utilisateur != null) m.setUtilisateur(utilisateur);
        if (fournisseur != null) m.setFournisseur(fournisseur);
    }
}
