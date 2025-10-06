package org.example.parkinformatique.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "baseconnaissance")
public class BaseConnaissance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "auteur_id", nullable = false)
    private Utilisateur auteur;

    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private Integer vues = 0;
    private Boolean actif = true;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
        if (vues == null) {
            vues = 0;
        }
        if (actif == null) {
            actif = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}

