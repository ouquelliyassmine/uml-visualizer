package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.Technicien;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TechnicienRepository extends JpaRepository<Technicien, Long> {
}
