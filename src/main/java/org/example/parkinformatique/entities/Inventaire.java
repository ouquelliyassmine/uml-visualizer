package org.example.parkinformatique.entities;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Inventaire {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate date;
    private String description;
    private String etat;

    @ManyToOne
    private Ticket ticket;

    @ManyToOne
    private Technicien technicien;


}

