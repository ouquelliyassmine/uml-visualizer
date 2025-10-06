package org.example.parkinformatique.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.example.parkinformatique.entities.BaseConnaissance;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.Service.UtilisateurService;
import org.example.parkinformatique.repositories.BaseConnaissanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/knowledge-base")
@CrossOrigin(origins = "http://localhost:3000") // Ajustez selon votre frontend
public class BaseConnaissanceController {

    @Autowired
    private BaseConnaissanceRepository baseConnaissanceRepository;

    @Autowired
    private UtilisateurService utilisateurService;

    // GET /api/knowledge-base - Récupérer tous les articles
    @GetMapping
    public ResponseEntity<List<BaseConnaissance>> getAllArticles() {
        List<BaseConnaissance> articles = baseConnaissanceRepository.findAll();
        return ResponseEntity.ok(articles);
    }

    // GET /api/knowledge-base/{id} - Récupérer un article par ID
    @GetMapping("/{id}")
    public ResponseEntity<BaseConnaissance> getArticleById(@PathVariable Long id) {
        Optional<BaseConnaissance> article = baseConnaissanceRepository.findById(id);

        if (article.isPresent()) {
            BaseConnaissance foundArticle = article.get();
            // Incrémenter le compteur de vues
            foundArticle.setVues(foundArticle.getVues() + 1);
            baseConnaissanceRepository.save(foundArticle);
            return ResponseEntity.ok(foundArticle);
        }

        return ResponseEntity.notFound().build();
    }

    // GET /api/knowledge-base/search?keyword=... - Rechercher des articles
    @GetMapping("/search")
    public ResponseEntity<List<BaseConnaissance>> searchArticles(@RequestParam String keyword) {
        List<BaseConnaissance> results = baseConnaissanceRepository.findByTitreContainingIgnoreCase(keyword);
        return ResponseEntity.ok(results);
    }

    // POST /api/knowledge-base - Créer un nouvel article
    @PostMapping
    public ResponseEntity<?> createArticle(
            @RequestBody CreateArticleRequest request,
            @AuthenticationPrincipal Utilisateur utilisateurConnecte
    ) {
        if(request.getTitre() == null || request.getTitre().isEmpty()){
            return ResponseEntity.badRequest().body("Titre manquant!");
        }
        if(request.getContenu() == null || request.getContenu().isEmpty()){
            return ResponseEntity.badRequest().body("Contenu manquant!");
        }

        BaseConnaissance article = new BaseConnaissance();
        article.setTitre(request.getTitre());
        article.setContenu(request.getContenu());
        article.setAuteur(utilisateurConnecte);
        article.setDateCreation(LocalDateTime.now());
        article.setVues(0);

        BaseConnaissance saved = baseConnaissanceRepository.save(article);
        return ResponseEntity.ok(saved);
    }

    // PUT /api/knowledge-base/{id} - Modifier un article
    @PutMapping("/{id}")
    public ResponseEntity<BaseConnaissance> updateArticle(
            @PathVariable Long id,
            @RequestBody UpdateArticleRequest request,
            @AuthenticationPrincipal Utilisateur utilisateurConnecte) {

        if (utilisateurConnecte == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<BaseConnaissance> articleExistant = baseConnaissanceRepository.findById(id);

        if (articleExistant.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        BaseConnaissance article = articleExistant.get();

        // Vérifier que l'utilisateur peut modifier cet article (auteur ou admin)
        if (!article.getAuteur().getId().equals(utilisateurConnecte.getId())
                && !utilisateurConnecte.getRole().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        article.setTitre(request.getTitre());
        article.setContenu(request.getContenu());
        article.setDateModification(LocalDateTime.now());

        BaseConnaissance articleMisAJour = baseConnaissanceRepository.save(article);
        return ResponseEntity.ok(articleMisAJour);
    }

    // DELETE /api/knowledge-base/{id} - Supprimer un article
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(
            @PathVariable Long id,
            @AuthenticationPrincipal Utilisateur utilisateurConnecte) {

        if (utilisateurConnecte == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<BaseConnaissance> articleExistant = baseConnaissanceRepository.findById(id);

        if (articleExistant.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        BaseConnaissance article = articleExistant.get();

        // Vérifier que l'utilisateur peut supprimer cet article (auteur ou admin)
        if (!article.getAuteur().getId().equals(utilisateurConnecte.getId())
                && !utilisateurConnecte.getRole().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        baseConnaissanceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Classes internes pour les requêtes
    public static class CreateArticleRequest {
        private String titre;
        private String contenu;

        // Getters et Setters
        public String getTitre() { return titre; }
        public void setTitre(String titre) { this.titre = titre; }
        public String getContenu() { return contenu; }
        public void setContenu(String contenu) { this.contenu = contenu; }
    }

    public static class UpdateArticleRequest {
        private String titre;
        private String contenu;

        // Getters et Setters
        public String getTitre() { return titre; }
        public void setTitre(String titre) { this.titre = titre; }
        public String getContenu() { return contenu; }
        public void setContenu(String contenu) { this.contenu = contenu; }
    }
}