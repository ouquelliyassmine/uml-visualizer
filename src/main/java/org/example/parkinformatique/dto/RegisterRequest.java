package org.example.parkinformatique.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String password;
    private String role; // "ADMIN", "TECHNICIEN", "USER"
}
