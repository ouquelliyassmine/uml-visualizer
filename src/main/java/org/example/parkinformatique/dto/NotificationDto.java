package org.example.parkinformatique.dto;

import org.example.parkinformatique.entities.Notification;
import org.example.parkinformatique.entities.NotificationType;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        NotificationType type,
        String message,
        boolean lu,
        LocalDateTime created_at
) {
    public static NotificationDto from(Notification n) {
        return new NotificationDto(n.getId(), n.getType(), n.getMessage(), n.isLu(), n.getCreatedAt());
    }
}
