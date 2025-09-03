package org.example.parkinformatique.entities;




import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

    @Getter
    @Setter
    @Entity
    public class Notification {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String message;
        private LocalDate dateEnvoi;

        @ManyToOne
        @JoinColumn(name = "utilisateur_id")
        private Utilisateur utilisateur;
    }


