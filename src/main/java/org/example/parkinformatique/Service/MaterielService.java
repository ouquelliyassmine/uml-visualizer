package org.example.parkinformatique.Service;

import org.example.parkinformatique.dto.MaterielCreateUpdateDTO;
import org.example.parkinformatique.dto.MaterielDTO;
import org.example.parkinformatique.entities.Fournisseur;
import org.example.parkinformatique.entities.Materiel;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.FournisseurRepository;
import org.example.parkinformatique.repositories.MaterielRepository;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class MaterielService {

    private final MaterielRepository materielRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final FournisseurRepository fournisseurRepo;

    public MaterielService(MaterielRepository materielRepo,
                           UtilisateurRepository utilisateurRepo,
                           FournisseurRepository fournisseurRepo) {
        this.materielRepo = materielRepo;
        this.utilisateurRepo = utilisateurRepo;
        this.fournisseurRepo = fournisseurRepo;
    }

    public List<MaterielDTO> list() {
        return materielRepo.findAll().stream().map(this::toDTO).toList();
    }

    public MaterielDTO get(Long id) {
        Materiel m = materielRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Matériel introuvable"));
        return toDTO(m);
    }

    public MaterielDTO create(MaterielCreateUpdateDTO in) {
        Materiel m = new Materiel();
        applyBasicFields(m, in);

        if (in.utilisateurId() != null) {
            Utilisateur u = utilisateurRepo.findById(in.utilisateurId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Utilisateur inexistant"));
            m.setUtilisateur(u);
        } else {
            m.setUtilisateur(null);
        }

        if (in.fournisseurId() != null) {
            Fournisseur f = fournisseurRepo.findById(in.fournisseurId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fournisseur inexistant"));
            m.setFournisseur(f);
        } else {
            m.setFournisseur(null);
        }

        return toDTO(materielRepo.save(m));
    }

    public MaterielDTO update(Long id, MaterielCreateUpdateDTO in) {
        Materiel m = materielRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Matériel introuvable"));

        applyBasicFields(m, in);

        // update / clear utilisateur
        if (in.utilisateurId() != null) {
            Utilisateur u = utilisateurRepo.findById(in.utilisateurId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Utilisateur inexistant"));
            m.setUtilisateur(u);
        } else {
            m.setUtilisateur(null);
        }

        // update / clear fournisseur
        if (in.fournisseurId() != null) {
            Fournisseur f = fournisseurRepo.findById(in.fournisseurId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fournisseur inexistant"));
            m.setFournisseur(f);
        } else {
            m.setFournisseur(null);
        }

        return toDTO(materielRepo.save(m));
    }

    public void delete(Long id) {
        if (!materielRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Matériel introuvable");
        }
        materielRepo.deleteById(id);
    }

    private void applyBasicFields(Materiel m, MaterielCreateUpdateDTO in) {
        m.setType(in.type());
        m.setMarque(in.marque());
        m.setModele(in.modele());
        m.setEtat(in.etat());
    }

    private MaterielDTO toDTO(Materiel m) {
        Long userId = (m.getUtilisateur() != null) ? m.getUtilisateur().getId() : null;
        String userNom = (m.getUtilisateur() != null)
                ? ( (m.getUtilisateur().getNom() != null ? m.getUtilisateur().getNom() : "")
                + " " +
                (m.getUtilisateur().getPrenom() != null ? m.getUtilisateur().getPrenom() : "")
        ).trim()
                : null;

        Long fId = (m.getFournisseur() != null) ? m.getFournisseur().getId() : null;
        String fNom = (m.getFournisseur() != null) ? m.getFournisseur().getNom() : null;

        return new MaterielDTO(
                m.getId(),
                m.getType(),
                m.getMarque(),
                m.getModele(),
                m.getEtat(),
                userId,
                userNom,
                fId,
                fNom
        );
    }
}
