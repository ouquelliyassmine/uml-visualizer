package org.example.parkinformatique.controllers;

import org.example.parkinformatique.Service.UtilisateurService;
import org.example.parkinformatique.dto.TicketCreationRequest;
import org.example.parkinformatique.entities.Ticket;
import org.example.parkinformatique.entities.Utilisateur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private UtilisateurService utilisateurService;

    // ✅ POST: Déclarer un incident
    @PostMapping
    public ResponseEntity<?> declareIncident(@RequestBody TicketCreationRequest request,
                                             @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Utilisateur non authentifié"));
        }

        String email = userDetails.getUsername();
        Optional<Utilisateur> utilisateurOptional = utilisateurService.findByEmail(email);

        if (utilisateurOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Utilisateur non trouvé"));
        }

        Utilisateur utilisateur = utilisateurOptional.get();

        Ticket newTicket = new Ticket();
        newTicket.setTitre(request.getTitre());
        newTicket.setDescription(request.getDescription());
        newTicket.setStatut(request.getStatut() != null ? request.getStatut() : "OUVERT");
        newTicket.setPriorite(request.getPriorite() != null ? request.getPriorite() : "MOYENNE");
        newTicket.setCommentaire(request.getCommentaire());
        newTicket.setDateCreation(LocalDateTime.now());
        newTicket.setUtilisateur(utilisateur);

        utilisateurService.declareIncidentOrRequest(newTicket);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Incident déclaré avec succès."));
    }

    // ✅ GET: Récupérer les tickets de l'utilisateur connecté
    @GetMapping
    public ResponseEntity<?> getMyTickets(@AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Utilisateur non authentifié"));
        }

        String email = userDetails.getUsername();
        Optional<Utilisateur> utilisateurOptional = utilisateurService.findByEmail(email);

        if (utilisateurOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Utilisateur non trouvé"));
        }

        Utilisateur utilisateur = utilisateurOptional.get();
        List<Ticket> tickets = utilisateur.getTickets();

        return ResponseEntity.ok(tickets);
    }
}


