package org.example.parkinformatique.Service;

import org.example.parkinformatique.entities.*;
import java.util.List;
import java.util.Optional;

public interface UtilisateurService {
    // ✅ Méthodes existantes (ne pas toucher)
    Utilisateur declareIncidentOrRequest(Ticket ticket);
    List<Ticket> trackMyTickets(Long utilisateurId);
    List<Materiel> getMyAssignedEquipments(Long utilisateurId);
    List<BaseConnaissance> accessKnowledgeBase();
    Ticket consultTicketStatus(Long ticketId);
    List<HistoriqueTicket> getTicketHistory(Long ticketId);
    List<BaseConnaissance> searchArticle(String keyword);
    BaseConnaissance readArticle(Long articleId);
    String interactWithChatbot(String question);
    Optional<Utilisateur> findUtilisateurById(Long userId);
    Optional<Utilisateur> findByEmail(String email);

    // 🆕 NOUVELLES MÉTHODES À AJOUTER pour la base de connaissances
    BaseConnaissance createArticle(String titre, String contenu, Long auteurId);
    BaseConnaissance updateArticle(Long articleId, String titre, String contenu);
    void deleteArticle(Long articleId);
    void incrementArticleViews(Long articleId);
    List<BaseConnaissance> getMostViewedArticles();
    List<BaseConnaissance> searchInTitleAndContent(String keyword);

    // 🆕 NOUVELLES MÉTHODES OPTIONNELLES pour améliorer l'expérience
    List<BaseConnaissance> getArticlesByAuthor(Long auteurId);
    Long countActiveArticles();
    List<BaseConnaissance> getRecentArticles(int limit);
}


