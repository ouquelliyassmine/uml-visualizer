package org.example.parkinformatique.controllers;

import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.dto.MaterielCreateUpdateDTO;
import org.example.parkinformatique.mappers.MaterielMapper;
import org.example.parkinformatique.entities.Fournisseur;
import org.example.parkinformatique.entities.Materiel;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.FournisseurRepository;
import org.example.parkinformatique.repositories.MaterielRepository;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/materiels")
@RequiredArgsConstructor
public class MaterielController {

    private final MaterielRepository materielRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final FournisseurRepository fournisseurRepository;


    public record MaterielEtatDTO(String etat) {}
    public record MaterielOptionDTO(Long id, String label, String etat) {}


    private static String labelOf(Materiel m) {
        StringBuilder sb = new StringBuilder();
        if (m.getMarque() != null && !m.getMarque().isBlank()) sb.append(m.getMarque());
        if (m.getModele() != null && !m.getModele().isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(m.getModele());
        }
        if (sb.length() == 0 && m.getType() != null && !m.getType().isBlank()) sb.append(m.getType());
        if (sb.length() == 0) sb.append("Équipement #").append(m.getId());
        return sb.toString();
    }

    // ====== CRUD الأساسي ======

    @GetMapping
    public ResponseEntity<?> list() {
        var list = materielRepository.findAll().stream().map(MaterielMapper::toDTO).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable Long id) {
        Materiel m = materielRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Materiel not found"));
        return ResponseEntity.ok(MaterielMapper.toDTO(m));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody MaterielCreateUpdateDTO req) {
        Materiel m = new Materiel();
        m.setType(req.type());
        m.setMarque(req.marque());
        m.setModele(req.modele());
        m.setEtat(req.etat());

        if (req.utilisateurId() != null) {
            Utilisateur u = utilisateurRepository.findById(req.utilisateurId())
                    .orElseThrow(() -> new NoSuchElementException("Utilisateur not found"));
            m.setUtilisateur(u);
        }
        if (req.fournisseurId() != null) {
            Fournisseur f = fournisseurRepository.findById(req.fournisseurId())
                    .orElseThrow(() -> new NoSuchElementException("Fournisseur not found"));
            m.setFournisseur(f);
        }

        Materiel saved = materielRepository.save(m);
        return ResponseEntity.status(HttpStatus.CREATED).body(MaterielMapper.toDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody MaterielCreateUpdateDTO req) {
        Materiel m = materielRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Materiel not found"));

        if (req.type() != null)   m.setType(req.type());
        if (req.marque() != null) m.setMarque(req.marque());
        if (req.modele() != null) m.setModele(req.modele());
        if (req.etat() != null)   m.setEtat(req.etat());

        if (req.utilisateurId() != null) {
            Utilisateur u = utilisateurRepository.findById(req.utilisateurId())
                    .orElseThrow(() -> new NoSuchElementException("Utilisateur not found"));
            m.setUtilisateur(u);
        }
        if (req.fournisseurId() != null) {
            Fournisseur f = fournisseurRepository.findById(req.fournisseurId())
                    .orElseThrow(() -> new NoSuchElementException("Fournisseur not found"));
            m.setFournisseur(f);
        }

        Materiel saved = materielRepository.save(m);
        return ResponseEntity.ok(MaterielMapper.toDTO(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!materielRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        materielRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // 204
    }




    @GetMapping("/options")
    public ResponseEntity<?> options() {
        var list = materielRepository.findAll().stream()
                .map(m -> new MaterielOptionDTO(m.getId(), labelOf(m), m.getEtat()))
                .toList();
        return ResponseEntity.ok(list);
    }


    @PatchMapping("/{id}/etat")
    public ResponseEntity<?> updateEtat(@PathVariable Long id, @RequestBody MaterielEtatDTO req) {
        if (req == null || req.etat() == null || req.etat().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "etat is required"));
        }
        Materiel m = materielRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Materiel not found"));
        m.setEtat(req.etat());
        Materiel saved = materielRepository.save(m);
        return ResponseEntity.ok(MaterielMapper.toDTO(saved));
    }

    // ====== Error Handlers ======

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> notFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> badRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("error", ex.getMessage()));
    }
}
