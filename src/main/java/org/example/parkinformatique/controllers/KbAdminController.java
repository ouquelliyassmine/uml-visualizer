package org.example.parkinformatique.controllers;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.Service.ChatbotIndexerService;
import org.example.parkinformatique.entities.BaseConnaissance;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.BaseConnaissanceRepository;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/knowledge-base")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class KbAdminController {

    private final ChatbotIndexerService indexer;
    private final BaseConnaissanceRepository kbRepo;
    private final UtilisateurRepository userRepo;

    @PostMapping("/reindex")
    public ResponseEntity<?> reindex() {
        try {
            int n = indexer.reindexAll();
            return ResponseEntity.ok("Reindex terminé. Indexed chunks: " + n);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur reindex: " + e.getMessage());
        }
    }

    @PostMapping("/seed")
    public ResponseEntity<?> seed(@RequestBody List<ArticleReq> reqs) {
        List<Long> ids = new ArrayList<>();
        for (ArticleReq r : reqs) {
            BaseConnaissance a = new BaseConnaissance();
            a.setTitre(r.getTitre());
            a.setContenu(r.getContenu());


            Utilisateur auteur = null;
            if (r.getAuteurEmail() != null && !r.getAuteurEmail().isBlank()) {
                auteur = userRepo.findByEmail(r.getAuteurEmail())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Auteur introuvable: " + r.getAuteurEmail()));
            } else if (r.getAuteurId() != null) {
                auteur = userRepo.findById(r.getAuteurId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Auteur introuvable (id=" + r.getAuteurId() + ")"));
            } else {

                auteur = userRepo.findFirstByRoleIgnoreCase("ADMIN").orElse(null);
            }

            if (auteur == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Auteur requis: زِد 'auteurEmail' أو 'auteurId' ");
            }

            a.setAuteur(auteur);
            kbRepo.save(a);
            ids.add(a.getId());
        }
        return ResponseEntity.ok(new SeedResp(ids.size(), ids));
    }

    @Data
    public static class ArticleReq {
        private String titre;
        private String contenu;
        private String auteurEmail;
        private Long   auteurId;
    }

    @Data
    public static class SeedResp {
        private final int seeded;
        private final List<Long> ids;
    }
}
