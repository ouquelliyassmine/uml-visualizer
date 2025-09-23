package org.example.parkinformatique.Service.impl;
import org.example.parkinformatique.Service.NotificationService;
import org.example.parkinformatique.Service.TechnicienService;
import org.example.parkinformatique.dto.PlanMaintenanceRequest;
import org.example.parkinformatique.entities.*;
import org.example.parkinformatique.repositories.InterventionRepository;
import org.example.parkinformatique.repositories.MaterielRepository;
import org.example.parkinformatique.repositories.RapportRepository;
import org.example.parkinformatique.repositories.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TechnicienServiceImpl implements TechnicienService {

    private final TicketRepository ticketRepository;
    private final MaterielRepository materielRepository;
    private final InterventionRepository interventionRepository;
    private final RapportRepository rapportRepository;

    public TechnicienServiceImpl(TicketRepository ticketRepository,
                                 MaterielRepository materielRepository,
                                 InterventionRepository interventionRepository,
                                 RapportRepository rapportRepository) {
        this.ticketRepository = ticketRepository;
        this.materielRepository = materielRepository;
        this.interventionRepository = interventionRepository;
        this.rapportRepository = rapportRepository;
    }

    @Override
    @Transactional
    public Ticket intervenirSurTicket(Long ticketId, String commentaire) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
        ticket.setCommentaire(commentaire);
        ticket.setStatut("EN_COURS");
        return ticketRepository.save(ticket);
    }

    @Override
    @Transactional
    public Ticket cloreTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
        ticket.setStatut("CLOTURE");
        ticket.setDateCloture(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @Override
    @Transactional
    public Intervention planifierIntervention(PlanMaintenanceRequest req, Utilisateur technicien) {
        Materiel materiel = materielRepository.findById(req.getMaterielId())
                .orElseThrow(() -> new IllegalArgumentException("Matériel introuvable"));

        Intervention i = new Intervention();
        i.setMateriel(materiel);
        i.setTechnicien(technicien);
        i.setDescription(req.getDescription());
        i.setDatePlanifiee(req.getDate());
        i.setStatut(req.getEtat() != null ? req.getEtat() : "PLANIFIEE");
        i.setCreatedAt(LocalDateTime.now());
        i.setUpdatedAt(LocalDateTime.now());

        return interventionRepository.save(i);


    }

    @Override
    @Transactional
    public Rapport générerRapportIntervention(Long interventionId) {
        Intervention intervention = interventionRepository.findById(interventionId)
                .orElseThrow(() -> new RuntimeException("Intervention non trouvée"));

        Rapport rapport = new Rapport();
        rapport.setTitre("Rapport intervention #" + intervention.getId());
        rapport.setDonnees(intervention.getDescription());
        rapport.setDateCreation(LocalDate.now());
        rapport.setStatut("GENERE");

        return rapportRepository.save(rapport);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ticket> getAssignedTickets(Long technicienId) {
        return ticketRepository.findAssignedWithUsers(technicienId);
    }

    @Override
    @Transactional
    public void updateEquipmentInventory(Long materielId, String newEtat) {
        Materiel m = materielRepository.findById(materielId)
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé"));
        m.setEtat(newEtat);
        materielRepository.save(m);
    }



}
