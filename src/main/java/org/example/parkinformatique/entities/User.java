package org.example.parkinformatique.entities;
import jakarta.persistence.*;
@Entity
@DiscriminatorValue("USER")


public class User extends Utilisateur {


}
