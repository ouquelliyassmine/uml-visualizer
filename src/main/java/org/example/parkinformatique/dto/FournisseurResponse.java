package org.example.parkinformatique.dto;

import lombok.Data;

@Data
public class FournisseurResponse {
    private Long id;
    private String nom;
    private String adresse;
    private String telephone;
    private String email;
}

