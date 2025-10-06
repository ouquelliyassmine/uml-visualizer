package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.Materiel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterielRepository extends JpaRepository<Materiel, Long> {

    // لواجهة "Mon matériel" (المستخدم يجيب غير ديالو)
    List<Materiel>findAllByUtilisateur_Id(Long userId);

    // فلاتر اختيارية للوحة الأدمن
    Page<Materiel> findByEtatIgnoreCase(String etat, Pageable pageable);
    Page<Materiel> findByTypeIgnoreCase(String type, Pageable pageable);
    Page<Materiel> findByMarqueContainingIgnoreCaseOrModeleContainingIgnoreCase(
            String marque, String modele, Pageable pageable
    );
}
