package org.example.parkinformatique.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Materiel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String marque;
    private String modele;
    private String etat; // EN_SERVICE, PANNE, HORS_SERVICE ...

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "utilisateur_id", nullable = true)
    private Utilisateur utilisateur;
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "fournisseur_id", nullable = true)
    private Fournisseur fournisseur;
}

