// src/main/java/org/example/parkinformatique/dto/InterventionResponse.java
package org.example.parkinformatique.dto;

import java.time.LocalDateTime;

public record InterventionResponse(
        Long id,
        String statut,                  // PLANIFIEE | EN_COURS | TERMINEE
        LocalDateTime datePlanifiee,
        String description,
        Long materielId,
        String materielLabel,
        SimpleUserDto technicien
) {}


