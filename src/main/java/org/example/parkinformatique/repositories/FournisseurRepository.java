package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {

        boolean existsByNomIgnoreCase(String nom);
    }



