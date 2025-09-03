package org.example.parkinformatique.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.example.parkinformatique.Service.UtilisateurService;
import org.example.parkinformatique.dto.TicketCreationRequest;
import org.example.parkinformatique.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/utilisateur")
public class UtilisateurController {

    @Autowired
    private UtilisateurService utilisateurService;

    // ✅ Créer un ticket (incident) avec utilisateur authentifié via JWT
    @PostMapping("/tickets")
    public ResponseEntity<?> declareIncident(
            @RequestBody TicketCreationRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {

        // DEBUG cookies reçus
        System.out.println("📦 Cookies reçus par Spring Boot:");
        String cookieHeader = httpRequest.getHeader("Cookie");
        System.out.println(cookieHeader);

        if (userDetails == null) {
            return new ResponseEntity<>("Utilisateur non authentifié.", HttpStatus.UNAUTHORIZED);
        }

        String email = userDetails.getUsername();
        Optional<Utilisateur> utilisateurOptional = utilisateurService.findByEmail(email);

        if (utilisateurOptional.isEmpty()) {
            return new ResponseEntity<>("Utilisateur non trouvé.", HttpStatus.NOT_FOUND);
        }

        Utilisateur utilisateur = utilisateurOptional.get();

        Ticket newTicket = new Ticket();
        newTicket.setTitre(request.getTitre());
        newTicket.setDescription(request.getDescription());
        newTicket.setStatut(request.getStatut() != null ? request.getStatut() : "OUVERT");
        newTicket.setPriorite(request.getPriorite() != null ? request.getPriorite() : "MOYENNE");
        newTicket.setCommentaire(request.getCommentaire());
        newTicket.setDateCreation(LocalDate.now().atStartOfDay());
        newTicket.setUtilisateur(utilisateur);

        utilisateurService.declareIncidentOrRequest(newTicket);

        return new ResponseEntity<>("Incident déclaré avec succès.", HttpStatus.CREATED);
    }

    // Alternative: Update your Spring Boot controller to accept POST
    // Changed from @GetMapping to @PostMapping
    // ✅ Liste des tickets de l'utilisateur connecté
    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> trackMyTickets(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Optional<Utilisateur> utilisateur = utilisateurService.findByEmail(email);
        return utilisateur.map(u -> ResponseEntity.ok(utilisateurService.trackMyTickets(u.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/materiels")
    public ResponseEntity<List<Materiel>> getAssignedEquipments(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Optional<Utilisateur> utilisateur = utilisateurService.findByEmail(email);
        return utilisateur.map(u -> ResponseEntity.ok(utilisateurService.getMyAssignedEquipments(u.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/base-connaissance")
    public List<BaseConnaissance> accessKnowledgeBase() {
        return utilisateurService.accessKnowledgeBase();
    }

    @GetMapping("/ticket-status/{ticketId}")
    public Ticket consultTicketStatus(@PathVariable Long ticketId) {
        return utilisateurService.consultTicketStatus(ticketId);
    }

    @GetMapping("/ticket-history/{ticketId}")
    public List<HistoriqueTicket> getTicketHistory(@PathVariable Long ticketId) {
        return utilisateurService.getTicketHistory(ticketId);
    }

    @GetMapping("/search-article")
    public List<BaseConnaissance> searchArticle(@RequestParam String keyword) {
        return utilisateurService.searchArticle(keyword);
    }

    @GetMapping("/article/{articleId}")
    public BaseConnaissance readArticle(@PathVariable Long articleId) {
        return utilisateurService.readArticle(articleId);
    }
    // شكون داخل فعلا؟ (الإيميل القادم من JWT)
    @GetMapping("/whoami")
    public Object whoAmI(@AuthenticationPrincipal UserDetails userDetails) {
        String email = (userDetails != null) ? userDetails.getUsername() : null;
        return java.util.Map.of("emailFromJWT", email);
    }

    // ديبَغ: واش قدّينا ن resolve-يو اليوزر ونجيبو matériel ديالو؟
    @GetMapping("/materiels/debug")
    public Object debugMateriels(@AuthenticationPrincipal UserDetails userDetails) {
        String email = (userDetails != null) ? userDetails.getUsername() : null;
        var utilisateurOpt = (email != null) ? utilisateurService.findByEmail(email) : java.util.Optional.<Utilisateur>empty();
        Long userId = utilisateurOpt.map(Utilisateur::getId).orElse(null);
        var items = (userId != null) ? utilisateurService.getMyAssignedEquipments(userId) : java.util.List.<Materiel>of();

        return java.util.Map.of(
                "emailFromJWT", email,
                "resolvedUserId", userId,
                "count", items.size(),
                "items", items
        );
    }



}