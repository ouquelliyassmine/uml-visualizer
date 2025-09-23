package org.example.parkinformatique.Service;

import org.example.parkinformatique.dto.PlanMaintenanceRequest;
import org.example.parkinformatique.entities.Intervention;
import org.example.parkinformatique.entities.Rapport;
import org.example.parkinformatique.entities.Ticket;
import org.example.parkinformatique.entities.Utilisateur;

import java.util.List;

public interface TechnicienService {
    Ticket intervenirSurTicket(Long ticketId, String commentaire);
    Ticket cloreTicket(Long ticketId);


    Intervention planifierIntervention(PlanMaintenanceRequest req, Utilisateur technicien);


    Rapport générerRapportIntervention(Long interventionId);

    List<Ticket> getAssignedTickets(Long technicienId);


    void updateEquipmentInventory(Long materielId, String newEtat);
}


