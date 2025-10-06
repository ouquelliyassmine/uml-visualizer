package org.example.parkinformatique.Service.impl;

import org.example.parkinformatique.Service.UtilisateurService;
import org.example.parkinformatique.entities.*;
import org.example.parkinformatique.repositories.BaseConnaissanceRepository;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.example.parkinformatique.repositories.TicketRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurServiceImpl implements UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private BaseConnaissanceRepository baseConnaissanceRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Override
    public Utilisateur declareIncidentOrRequest(Ticket ticket) {
        // Le ticket doit déjà avoir l'objet Utilisateur associé avant d'être sauvegardé
        Ticket savedTicket = ticketRepository.save(ticket);
        return savedTicket.getUtilisateur(); // Retourne l'utilisateur associé au ticket sauvegardé
    }

    @Override
    public List<Ticket> trackMyTickets(Long utilisateurId) {
        return ticketRepository.findByUtilisateur_Id(utilisateurId);
    }

    @Override
    public List<Materiel> getMyAssignedEquipments(Long utilisateurId) {
        // TODO: Implémenter la logique pour récupérer le matériel assigné à l'utilisateur
        // Cela nécessiterait un MaterielRepository et une méthode findByUtilisateurId
        return List.of(); // Placeholder
    }

    @Override
    public List<BaseConnaissance> accessKnowledgeBase() {
        return baseConnaissanceRepository.findAll();
    }

    @Override
    public List<BaseConnaissance> searchArticle(String keyword) {
        return baseConnaissanceRepository.findByTitreContainingIgnoreCase(keyword);
    }

    @Override
    public BaseConnaissance readArticle(Long articleId) {
        return baseConnaissanceRepository.findById(articleId).orElse(null);
    }

    @Override
    public String interactWithChatbot(String question) {
        // 🤖 Exemple très basique
        if (question.toLowerCase().contains("mot de passe")) {
            return "Vous pouvez réinitialiser votre mot de passe depuis la page des paramètres.";
        } else if (question.toLowerCase().contains("connexion")) {
            return "Essayez de redémarrer votre routeur Wi-Fi.";
        }
        return "Merci pour votre question. Un agent technique vous répondra sous peu.";
    }

    @Override
    public Ticket consultTicketStatus(Long ticketId) {
        // TODO: Implémenter la logique pour consulter le statut d'un ticket
        return null; // Placeholder
    }

    @Override
    public List<HistoriqueTicket> getTicketHistory(Long ticketId) {
        // TODO: Implémenter la logique pour l'historique des tickets
        return List.of(); // Placeholder
    }

    @Override
    public Optional<Utilisateur> findUtilisateurById(Long userId) {
        return utilisateurRepository.findById(userId);
    }

    @Override
    public Optional<Utilisateur> findByEmail(String email) {
        return utilisateurRepository.findByEmail(email); // ✅
    }

    // 🆕 NOUVELLES MÉTHODES AJOUTÉES POUR LA BASE DE CONNAISSANCES

    @Override
    public BaseConnaissance createArticle(String titre, String contenu, Long auteurId) {
        Optional<Utilisateur> auteur = utilisateurRepository.findById(auteurId);
        if (auteur.isEmpty()) {
            throw new RuntimeException("Auteur non trouvé avec l'ID: " + auteurId);
        }

        BaseConnaissance article = new BaseConnaissance();
        article.setTitre(titre);
        article.setContenu(contenu);
        article.setAuteur(auteur.get());

        return baseConnaissanceRepository.save(article);
    }

    @Override
    public BaseConnaissance updateArticle(Long articleId, String titre, String contenu) {
        Optional<BaseConnaissance> articleOpt = baseConnaissanceRepository.findById(articleId);
        if (articleOpt.isEmpty()) {
            throw new RuntimeException("Article non trouvé avec l'ID: " + articleId);
        }

        BaseConnaissance article = articleOpt.get();
        article.setTitre(titre);
        article.setContenu(contenu);

        return baseConnaissanceRepository.save(article);
    }

    @Override
    public void deleteArticle(Long articleId) {
        if (!baseConnaissanceRepository.existsById(articleId)) {
            throw new RuntimeException("Article non trouvé avec l'ID: " + articleId);
        }
        baseConnaissanceRepository.deleteById(articleId);
    }

    @Override
    public void incrementArticleViews(Long articleId) {
        Optional<BaseConnaissance> articleOpt = baseConnaissanceRepository.findById(articleId);
        if (articleOpt.isPresent()) {
            BaseConnaissance article = articleOpt.get();
            // Note: Pour l'instant, cette méthode ne fait rien car le champ 'vues' n'existe pas encore
            // Une fois que vous ajouterez le champ 'vues' à l'entité BaseConnaissance :
            // article.setVues(article.getVues() + 1);
            // baseConnaissanceRepository.save(article);
            System.out.println("Vue incrémentée pour l'article: " + article.getTitre());
        }
    }

    @Override
    public List<BaseConnaissance> getMostViewedArticles() {
        // Pour l'instant, retourne tous les articles
        // Une fois le champ 'vues' ajouté, vous pourrez trier par vues
        return baseConnaissanceRepository.findAll();
    }

    @Override
    public List<BaseConnaissance> searchInTitleAndContent(String keyword) {
        // Utilise la méthode existante pour l'instant
        // Si vous voulez chercher aussi dans le contenu, ajoutez une nouvelle méthode au repository
        return baseConnaissanceRepository.findByTitreContainingIgnoreCase(keyword);
    }

    @Override
    public List<BaseConnaissance> getArticlesByAuthor(Long auteurId) {
        // Retourne tous les articles pour l'instant
        // Vous pouvez implémenter une recherche par auteur si nécessaire
        return baseConnaissanceRepository.findAll();
    }

    @Override
    public Long countActiveArticles() {
        return baseConnaissanceRepository.count();
    }

    @Override
    public List<BaseConnaissance> getRecentArticles(int limit) {
        // Retourne tous les articles pour l'instant
        // Vous pouvez ajouter une méthode au repository pour limiter et trier par date
        List<BaseConnaissance> allArticles = baseConnaissanceRepository.findAll();
        return allArticles.size() > limit ? allArticles.subList(0, limit) : allArticles;
    }
}