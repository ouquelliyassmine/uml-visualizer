package org.example.parkinformatique.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "logiciel")
public class Logiciel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nom;

    @Column(length = 50)
    private String version;

    @Column(length = 100)
    private String editeur;

    @Column(length = 100)
    private String licence;

    // Essayez avec et sans @Column(name = "dateexpiration") pour voir lequel fonctionne
    @Column(name = "dateexpiration")
    private LocalDate dateExpiration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materiel_id", nullable = true)
    private Materiel materiel;

    @Override
    public String toString() {
        return "Logiciel{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", version='" + version + '\'' +
                ", editeur='" + editeur + '\'' +
                ", licence='" + licence + '\'' +
                ", dateExpiration=" + dateExpiration +
                ", materielId=" + (materiel != null ? materiel.getId() : null) +
                '}';
    }
}

