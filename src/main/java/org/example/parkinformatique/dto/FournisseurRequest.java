package org.example.parkinformatique.dto;

import lombok.Data;

@Data
public class FournisseurRequest {
    private String nom;
    private String adresse;
    private String telephone;
    private String email;
}
