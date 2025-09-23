package org.example.parkinformatique.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket")
@Getter
@Setter
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;
    private String statut;    // OUVERT, EN_COURS, RESOLU, CLOTURE
    private String priorite;  // BASSE, MOYENNE, HAUTE

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "date_creation", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime dateCreation;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "date_cloture")
    private LocalDateTime dateCloture;

    private String commentaire;

    // utilisateur qui a créé le ticket
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    // technicien assigné
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technicien_id")
    private Utilisateur assignedTo;

    public Ticket() {}

    public Ticket(String titre, String description, String statut, String priorite,
                  LocalDateTime dateCreation, Utilisateur utilisateur) {
        this.titre = titre;
        this.description = description;
        this.statut = statut;
        this.priorite = priorite;
        this.dateCreation = dateCreation;
        this.utilisateur = utilisateur;
    }
}
