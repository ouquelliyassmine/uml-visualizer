package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.Chatbot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatbotRepository extends JpaRepository<Chatbot, Long> {
    Chatbot findFirstByOrderByIdAsc();
}

