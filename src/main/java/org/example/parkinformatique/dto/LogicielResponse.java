package org.example.parkinformatique.dto;// org.example.parkinformatique.dto.LogicielResponse
import lombok.Data;

@Data
public class LogicielResponse {
    private Long id;
    private String nom;
    private String version;
    private String editeur;
    private String licence;
    private String dateExpiration;
    private Long materielId;


    private String materielNom;


    private String materielType;
    private String materielMarque;
    private String materielModele;
    private String materielEtat;
}
