package org.example.parkinformatique.repositories;

import org.example.parkinformatique.entities.Notification;
import org.example.parkinformatique.entities.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDestinataireOrderByCreatedAtDesc(Utilisateur u);
    long countByDestinataireAndLuFalse(Utilisateur u);
}

