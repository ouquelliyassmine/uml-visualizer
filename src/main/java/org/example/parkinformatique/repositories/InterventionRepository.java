// src/main/java/org/example/parkinformatique/repositories/InterventionRepository.java
package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InterventionRepository extends JpaRepository<Intervention, Long> {

    // باش تعرض لاحقًا لائحة ديال التقني
    @Query("""
      SELECT i FROM Intervention i
      JOIN FETCH i.materiel
      JOIN FETCH i.technicien
      WHERE i.technicien.id = :technicienId
      ORDER BY i.datePlanifiee DESC
    """)
    List<Intervention> findByTechnicienIdWithJoins(Long technicienId);
}

