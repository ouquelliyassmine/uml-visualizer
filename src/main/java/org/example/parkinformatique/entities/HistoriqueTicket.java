package org.example.parkinformatique.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "historique_ticket")
public class HistoriqueTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;

    private LocalDate dateAction;

    @ManyToOne
    private Ticket ticket;

    // Constructeur par défaut
    public HistoriqueTicket() {
    }

    // Constructeur utile pour tests ou instanciation rapide
    public HistoriqueTicket(String action, LocalDate dateAction, Ticket ticket) {
        this.action = action;
        this.dateAction = dateAction;
        this.ticket = ticket;
    }
}

