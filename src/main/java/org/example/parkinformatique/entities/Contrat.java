package org.example.parkinformatique.entities;
import jakarta.persistence.*;
import java.time.LocalDate;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter



public class Contrat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String objet;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Double cout;
    @ManyToOne
    private Fournisseur fournisseur;
}
