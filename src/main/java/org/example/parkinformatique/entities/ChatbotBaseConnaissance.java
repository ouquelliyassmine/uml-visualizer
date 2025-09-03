package org.example.parkinformatique.entities;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;



    @Entity
    @Getter
    @Setter
    public class ChatbotBaseConnaissance {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        private Chatbot chatbot;

        @ManyToOne
        private BaseConnaissance baseConnaissance;
    }

