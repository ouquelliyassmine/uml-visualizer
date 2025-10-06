package org.example.parkinformatique.repositories;



import org.example.parkinformatique.entities.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // ===== User side =====
    // ✅ رجّع DISTINCT وتـJOIN FETCH بجوج العلاقات باش مايبقاش proxy
    @Query("""
  SELECT DISTINCT t FROM Ticket t
  LEFT JOIN FETCH t.utilisateur
  LEFT JOIN FETCH t.assignedTo
  WHERE t.utilisateur.id = :utilisateurId
  ORDER BY t.dateCreation DESC
""")
    List<Ticket> findByUtilisateurIdOrderByDateCreationDesc(@Param("utilisateurId") Long utilisateurId);
    // TicketRepository.java
    @Query("""
  SELECT DISTINCT t FROM Ticket t
  LEFT JOIN FETCH t.utilisateur
  LEFT JOIN FETCH t.assignedTo
  WHERE t.utilisateur.id = :utilisateurId
  ORDER BY t.dateCreation DESC
""")
    List<Ticket> findByUtilisateurIdWithUsers(@Param("utilisateurId") Long utilisateurId);



    List<Ticket> findByUtilisateur_Id(Long utilisateurId);   // ممكن تخليهم إذا باغيهم
    List<Ticket> findByUtilisateurId(Long utilisateurId);

    List<Ticket> findByStatut(String statut);
    List<Ticket> findByPriorite(String priorite);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.utilisateur.id = :utilisateurId")
    Long countByUtilisateurId(@Param("utilisateurId") Long utilisateurId);

    // ===== Technicien side =====

    // ✅ Tickets assignés (مع utilisateur/technicien محمّلين)
    @Query("""
      SELECT t FROM Ticket t
      LEFT JOIN FETCH t.utilisateur
      LEFT JOIN FETCH t.assignedTo
      WHERE t.assignedTo.id = :techId
      ORDER BY t.dateCreation DESC
    """)
    List<Ticket> findAssignedWithUsers(@Param("techId") Long techId);

    // ✅ Tickets non assignés (مع صاحب البلاغ محمّل)
    @Query("""
      SELECT t FROM Ticket t
      LEFT JOIN FETCH t.utilisateur
      WHERE t.assignedTo IS NULL
      ORDER BY t.dateCreation ASC
    """)
    List<Ticket> findUnassignedWithUser();
}

