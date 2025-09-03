package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.Logiciel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogicielRepository extends JpaRepository<Logiciel, Long> {
    List<Logiciel> findByMaterielId(Long materielId);  // أو findByMateriel_Id(...)
}

