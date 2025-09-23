package org.example.parkinformatique.entities;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.parkinformatique.entities.Materiel;
import org.example.parkinformatique.entities.Utilisateur;

import java.time.LocalDateTime;

@Getter @Setter
@Entity
@Table(name = "intervention")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Intervention {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private String statut;          // PLANIFIEE / EN_COURS / TERMINEE ...
    private LocalDateTime datePlanifiee;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "materiel_id")
    @JsonIgnoreProperties({"utilisateur","fournisseur","interventions","hibernateLazyInitializer","handler"})
    private Materiel materiel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "technicien_id")
    @JsonIgnoreProperties({"password","materiels","interventions","hibernateLazyInitializer","handler"})
    private Utilisateur technicien;
}
