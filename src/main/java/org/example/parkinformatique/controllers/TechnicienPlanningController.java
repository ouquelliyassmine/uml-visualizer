// src/main/java/org/example/parkinformatique/controllers/TechnicienPlanningController.java
// TechnicienPlanningController.java
package org.example.parkinformatique.controllers;

import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.Service.TechnicienService;
import org.example.parkinformatique.dto.PlanMaintenanceRequest;
import org.example.parkinformatique.entities.Intervention;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/technicien/planning")
@RequiredArgsConstructor
public class TechnicienPlanningController {

    private final TechnicienService technicienService;
    private final UtilisateurRepository utilisateurRepository;

    @PostMapping
    public ResponseEntity<?> planifier(@RequestBody PlanMaintenanceRequest req,
                                       @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails me) {

        Utilisateur tech = utilisateurRepository.findByEmail(me.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Technicien introuvable"));

        Intervention saved = technicienService.planifierIntervention(req, tech);
        return ResponseEntity.ok(saved);
    }
}
