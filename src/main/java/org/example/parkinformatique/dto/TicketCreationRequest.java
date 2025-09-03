package org.example.parkinformatique.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketCreationRequest {
    private String titre;
    private String description;
    private String statut;
    private String priorite;
    private String commentaire;
}



