package org.example.parkinformatique.Service;

import org.example.parkinformatique.entities.Inventaire;
import org.example.parkinformatique.entities.Rapport;
import org.example.parkinformatique.entities.Ticket;

import java.util.List;

public interface TechnicienService {
    Ticket intervenirSurTicket(Long ticketId, String commentaire);

    Ticket cloreTicket(Long ticketId);

    Inventaire planifierMaintenance(Inventaire inventaire);

    Rapport générerRapportIntervention(Long inventaireId);

    List<Ticket> getAssignedTickets(Long technicienId);

    void planifyInterventionsOrMaintenance(Long technicienId);

    void updateEquipmentInventory(Long materielId, String newEtat);
}
