// TechnicienController.java
package org.example.parkinformatique.controllers;

import org.example.parkinformatique.Service.TechnicienService;
import org.example.parkinformatique.entities.Rapport;
import org.example.parkinformatique.entities.Ticket;
import org.example.parkinformatique.entities.Utilisateur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/technicien")
public class TechnicienController {

    @Autowired
    private TechnicienService technicienService;

    public record CommentaireDto(String commentaire) {}

    @PutMapping("/tickets/{ticketId}/intervenir")
    public Ticket intervenir(@PathVariable Long ticketId, @RequestBody CommentaireDto body) {
        return technicienService.intervenirSurTicket(ticketId, body.commentaire());
    }

    @PutMapping("/tickets/{ticketId}/clore")
    public Ticket clore(@PathVariable Long ticketId) {
        return technicienService.cloreTicket(ticketId);
    }

    @GetMapping("/rapports/{interventionId}")
    public Rapport generateRapport(@PathVariable Long interventionId) {
        return technicienService.générerRapportIntervention(interventionId);
    }

    @GetMapping("/tickets/assigned")
    public List<Ticket> getAssignedTickets(@AuthenticationPrincipal Utilisateur me) {
        return technicienService.getAssignedTickets(me.getId());
    }

    @GetMapping("/whoami")
    public Map<String, Object> whoami(@AuthenticationPrincipal Utilisateur me) {
        return Map.of(
                "id", me.getId(),
                "email", me.getEmail(),
                "nom", me.getNom(),
                "prenom", me.getPrenom(),
                "role", me.getRole()
        );
    }
}
