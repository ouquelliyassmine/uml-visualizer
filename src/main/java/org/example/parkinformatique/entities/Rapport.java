package org.example.parkinformatique.entities;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;


@Getter
@Setter
@Entity

public class Rapport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titre;
    private String donnees;
    private LocalDate dateCreation;
    private String statut;

    @ManyToOne
    private Utilisateur administrateur;


}

