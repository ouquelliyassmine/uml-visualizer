package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.BaseConnaissance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BaseConnaissanceRepository extends JpaRepository<BaseConnaissance, Long> {

    // Recherche existante
    List<BaseConnaissance> findByTitreContainingIgnoreCase(String keyword);

    // Nouvelles méthodes utiles
    List<BaseConnaissance> findByTitreContainingIgnoreCaseOrContenuContainingIgnoreCase(
            String titre, String contenu
    );

    List<BaseConnaissance> findByActifTrueOrderByDateCreationDesc();

    List<BaseConnaissance> findByAuteur_IdOrderByDateCreationDesc(Long auteurId);

    @Query("SELECT bc FROM BaseConnaissance bc WHERE bc.actif = true ORDER BY bc.vues DESC")
    List<BaseConnaissance> findMostViewedArticles();

    @Query("SELECT COUNT(bc) FROM BaseConnaissance bc WHERE bc.actif = true")
    Long countActiveArticles();
}
