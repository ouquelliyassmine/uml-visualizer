package org.example.parkinformatique.controllers;

import org.example.parkinformatique.Service.UtilisateurService;
import org.example.parkinformatique.dto.TicketCreationRequest;
import org.example.parkinformatique.entities.Ticket;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private UtilisateurService utilisateurService;

    @Autowired
    private TicketRepository ticketRepository;

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
        newTicket.setUtilisateur(utilisateur);

        utilisateurService.declareIncidentOrRequest(newTicket);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Incident déclaré avec succès."));
    }

    // ✅ GET: Tickets de l'utilisateur connecté
    @GetMapping
    @Transactional(readOnly = true)
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

        Long utilisateurId = utilisateurOptional.get().getId();
        List<Ticket> tickets = ticketRepository.findByUtilisateurIdWithUsers(utilisateurId);

        List<TicketResponse> payload = tickets.stream()
                .map(TicketController::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(payload);
    }

    // ====== Mappers ======
    private static TicketResponse toDto(Ticket t) {
        return new TicketResponse(
                t.getId(),
                t.getTitre(),
                t.getDescription(),
                t.getStatut(),
                t.getPriorite(),
                t.getCommentaire(),
                t.getDateCreation(),
                t.getDateCloture(),
                toUserDto(t.getUtilisateur()),
                toUserDto(t.getAssignedTo())
        );
    }

    private static SimpleUserDto toUserDto(Utilisateur u) {
        if (u == null) return null;
        return new SimpleUserDto(u.getId(), u.getNom(), u.getPrenom(), u.getEmail());
    }

    // ====== DTOs ======
    public record SimpleUserDto(Long id, String nom, String prenom, String email) {}

    public record TicketResponse(
            Long id,
            String titre,
            String description,
            String statut,
            String priorite,
            String commentaire,
            java.time.LocalDateTime dateCreation,
            java.time.LocalDateTime dateCloture,
            SimpleUserDto utilisateur,
            SimpleUserDto assignedTo
    ) {}
}
