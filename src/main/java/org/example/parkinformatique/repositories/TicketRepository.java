package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // ✅ Trouver tous les tickets d'un utilisateur (plusieurs variantes)
    @Query("SELECT t FROM Ticket t WHERE t.utilisateur.id = :utilisateurId ORDER BY t.dateCreation DESC")
    List<Ticket> findByUtilisateurIdOrderByDateCreationDesc(@Param("utilisateurId") Long utilisateurId);

    // ✅ Alternative avec naming convention Spring Data JPA
    List<Ticket> findByUtilisateur_Id(Long utilisateurId);

    // ✅ Alternative plus simple
    List<Ticket> findByUtilisateurId(Long utilisateurId);

    // ✅ Trouver les tickets par statut
    List<Ticket> findByStatut(String statut);

    // ✅ Trouver les tickets par priorité
    List<Ticket> findByPriorite(String priorite);

    // ✅ Compter les tickets d'un utilisateur
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.utilisateur.id = :utilisateurId")
    Long countByUtilisateurId(@Param("utilisateurId") Long utilisateurId);
}