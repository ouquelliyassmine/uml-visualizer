package org.example.parkinformatique.Service.impl;

import org.example.parkinformatique.Service.AdminService;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Override
    public Utilisateur createUser(Utilisateur utilisateur) {

        return utilisateurRepository.save(utilisateur);
    }

    @Override
    public Utilisateur updateUser(Long id, Utilisateur utilisateur) {
        return utilisateurRepository.findById(id).map(existing -> {
            existing.setNom(utilisateur.getNom());
            existing.setPrenom(utilisateur.getPrenom());
            existing.setEmail(utilisateur.getEmail());
            existing.setTelephone(utilisateur.getTelephone());
            if (utilisateur.getRole() != null) existing.setRole(utilisateur.getRole());

            return utilisateurRepository.save(existing);
        }).orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + id));
    }

    @Override
    public void deleteUser(Long id) {
        utilisateurRepository.deleteById(id);
    }

    // ✅ NEW
    @Override
    public List<Utilisateur> getAllUsers() {
        return utilisateurRepository.findAll();
    }

    @Override
    public Optional<Utilisateur> getUserById(Long id) {
        return utilisateurRepository.findById(id);
    }


}
