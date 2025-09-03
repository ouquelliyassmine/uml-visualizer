package org.example.parkinformatique.entities;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity

@DiscriminatorValue("TECHNICIEN")
public class Technicien extends Utilisateur {

    private String specialite;


}

