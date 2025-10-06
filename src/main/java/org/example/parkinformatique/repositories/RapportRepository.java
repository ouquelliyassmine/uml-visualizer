package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.Rapport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RapportRepository extends JpaRepository<Rapport, Long> {
}
