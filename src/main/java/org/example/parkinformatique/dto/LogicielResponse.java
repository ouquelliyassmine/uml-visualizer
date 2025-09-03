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

    // 👇 أضف هذا الحقل لأنه هو اللي كتعرضه الواجهة
    private String materielNom;

    // (اختياري) خليهوم إذا كنت كترجعهم من قبل
    private String materielType;
    private String materielMarque;
    private String materielModele;
    private String materielEtat;
}
