package org.example.parkinformatique.controllers;

import org.example.parkinformatique.Service.TechnicienService;
import org.example.parkinformatique.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicien")
public class TechnicienController {

    @Autowired
    private TechnicienService technicienService;

    @PutMapping("/tickets/{ticketId}/intervenir")
    public Ticket intervenir(@PathVariable Long ticketId, @RequestBody String commentaire) {
        return technicienService.intervenirSurTicket(ticketId, commentaire);
    }

    @PutMapping("/tickets/{ticketId}/clore")
    public Ticket clore(@PathVariable Long ticketId) {
        return technicienService.cloreTicket(ticketId);
    }

    @PostMapping("/maintenance")
    public Inventaire planifierMaintenance(@RequestBody Inventaire inventaire) {
        return technicienService.planifierMaintenance(inventaire);
    }

    @GetMapping("/rapports/{interventionId}")
    public Rapport generateRapport(@PathVariable Long interventionId) {
        return technicienService.générerRapportIntervention(interventionId);
    }

    @GetMapping("/tickets/assigned/{technicienId}")
    public List<Ticket> getAssignedTickets(@PathVariable Long technicienId) {
        return technicienService.getAssignedTickets(technicienId);
    }
}
