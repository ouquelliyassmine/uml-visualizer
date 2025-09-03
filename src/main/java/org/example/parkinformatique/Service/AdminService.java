package org.example.parkinformatique.Service;

import org.example.parkinformatique.entities.Utilisateur;

import java.util.List;
import java.util.Optional;

public interface AdminService {
    Utilisateur createUser(Utilisateur utilisateur);
    Utilisateur updateUser(Long id, Utilisateur utilisateur);
    void deleteUser(Long id);

    // ✅ NEW
    List<Utilisateur> getAllUsers();
    Optional<Utilisateur> getUserById(Long id);

    // ... باقي الميثودز ديال materiel/logiciel/fournisseur/contrat
}
