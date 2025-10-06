// src/main/java/org/example/parkinformatique/dto/PlanMaintenanceRequest.java
package org.example.parkinformatique.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class PlanMaintenanceRequest {

    @JsonAlias({"materielId", "materiel_id"})
    private Long materielId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[[:ss]]")
    private LocalDateTime date;

    private String description;
    private String etat;

    // getters/setters
    public Long getMaterielId() { return materielId; }
    public void setMaterielId(Long materielId) { this.materielId = materielId; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getEtat() { return etat; }
    public void setEtat(String etat) { this.etat = etat; }
}
