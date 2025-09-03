package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.Inventaire;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventaireRepository extends JpaRepository<Inventaire, Long> {
}

