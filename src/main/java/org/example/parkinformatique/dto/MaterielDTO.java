package org.example.parkinformatique.dto;

public record MaterielDTO(
        Long id,
        String type,
        String marque,
        String modele,
        String etat,
        Long utilisateurId,
        String utilisateurNomComplet,
        Long fournisseurId,
        String fournisseurNom
) {}



