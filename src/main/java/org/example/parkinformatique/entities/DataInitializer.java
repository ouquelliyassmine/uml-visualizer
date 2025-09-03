package org.example.parkinformatique.entities;

import jakarta.annotation.PostConstruct;
import org.example.parkinformatique.entities.BaseConnaissance;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.BaseConnaissanceRepository;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer {

    @Autowired
    private BaseConnaissanceRepository baseConnaissanceRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @PostConstruct
    public void initData() {
        // Vérifie s'il y a déjà des articles
        if (baseConnaissanceRepository.count() == 0) {
            System.out.println("📚 Insertion automatique des articles de base...");

            // Cherche un utilisateur ADMIN (ou remplace l'ID/email par celui que tu veux)
            Optional<Utilisateur> auteurOpt = utilisateurRepository.findByEmail("ouquelliyassmine@gmail.com");

            if (auteurOpt.isEmpty()) {
                System.out.println("⚠️ Aucun auteur trouvé pour les articles de base.");
                return;
            }

            Utilisateur auteur = auteurOpt.get();

            BaseConnaissance article1 = new BaseConnaissance();
            article1.setTitre("Comment réinitialiser votre mot de passe");
            article1.setContenu("Allez dans Paramètres > Sécurité > Réinitialisation.");
            article1.setAuteur(auteur);

            BaseConnaissance article2 = new BaseConnaissance();
            article2.setTitre("Résoudre les problèmes de connexion Wi-Fi");
            article2.setContenu("Redémarrez votre routeur, vérifiez les câbles, et testez une autre connexion.");
            article2.setAuteur(auteur);

            baseConnaissanceRepository.save(article1);
            baseConnaissanceRepository.save(article2);

            System.out.println("✅ Articles insérés automatiquement.");
        } else {
            System.out.println("📘 La base de connaissances contient déjà des articles.");
        }
    }
}
