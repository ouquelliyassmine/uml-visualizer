package org.example.parkinformatique.Service.impl;

import org.example.parkinformatique.Service.TechnicienService;

import org.example.parkinformatique.entities.Inventaire;
import org.example.parkinformatique.entities.Rapport;
import org.example.parkinformatique.entities.Ticket;

import org.example.parkinformatique.repositories.InventaireRepository;
import org.example.parkinformatique.repositories.RapportRepository;
import org.example.parkinformatique.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TechnicienServiceImpl implements TechnicienService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private InventaireRepository interventionRepository;

    @Autowired
    private RapportRepository rapportRepository;

    @Override
    public Ticket intervenirSurTicket(Long ticketId, String commentaire) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));

        // Assurez-vous que Ticket a bien une méthode setCommentaire
        ticket.setCommentaire(commentaire);
        ticket.setStatut("En cours d'intervention");

        return ticketRepository.save(ticket);
    }

    @Override
    public Ticket cloreTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));

        ticket.setStatut("Clôturé");

        return ticketRepository.save(ticket);
    }

    @Override
    public Inventaire planifierMaintenance(Inventaire intervention) {
        return interventionRepository.save(intervention);
    }

    @Override
    public Rapport générerRapportIntervention(Long interventionId) {
        Inventaire intervention = interventionRepository.findById(interventionId)
                .orElseThrow(() -> new RuntimeException("Intervention non trouvée"));

        Rapport rapport = new Rapport();
        rapport.setTitre("Rapport pour intervention " + intervention.getId());
        rapport.setDonnees(intervention.getDescription());
        rapport.setDateCreation(LocalDate.now());
        rapport.setStatut("Généré");

        return rapportRepository.save(rapport);
    }

    @Override
    public List<Ticket> getAssignedTickets(Long technicienId) {
        return List.of();
    }

    @Override
    public void planifyInterventionsOrMaintenance(Long technicienId) {


    }

    @Override
    public void updateEquipmentInventory(Long materielId, String newEtat) {

    }
}
