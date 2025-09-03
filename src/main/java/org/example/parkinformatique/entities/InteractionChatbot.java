package org.example.parkinformatique.entities;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class InteractionChatbot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String question;
    private String reponse;
    private LocalDate dateInteraction;

    @ManyToOne
    private Utilisateur utilisateur;

    @ManyToOne
    private Chatbot chatbot;
}

