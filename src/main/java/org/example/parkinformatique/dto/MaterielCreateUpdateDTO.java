package org.example.parkinformatique.dto;

public record MaterielCreateUpdateDTO(
        String type,
        String marque,
        String modele,
        String etat,
        Long utilisateurId,
        Long fournisseurId
) {}


