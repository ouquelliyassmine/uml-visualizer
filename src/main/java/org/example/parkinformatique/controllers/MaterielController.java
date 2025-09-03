package org.example.parkinformatique.controllers;

import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.dto.MaterielCreateUpdateDTO;
import org.example.parkinformatique.dto.MaterielDTO;
import org.example.parkinformatique.entities.Fournisseur;
import org.example.parkinformatique.entities.Materiel;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.mappers.MaterielMapper;
import org.example.parkinformatique.repositories.FournisseurRepository;
import org.example.parkinformatique.repositories.MaterielRepository;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/api/materiels")
@RequiredArgsConstructor
public class MaterielController {

    private final MaterielRepository materielRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final FournisseurRepository fournisseurRepository;

    @GetMapping
    public ResponseEntity<?> list() {
        var list = materielRepository.findAll().stream().map(MaterielMapper::toDTO).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable Long id) {
        Materiel m = materielRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Materiel not found"));
        return ResponseEntity.ok(MaterielMapper.toDTO(m));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody MaterielCreateUpdateDTO req) {
        Materiel m = new Materiel();
        m.setType(req.type());
        m.setMarque(req.marque());
        m.setModele(req.modele());
        m.setEtat(req.etat());

        // رابط utilisateur (اختياري)
        if (req.utilisateurId() != null) {
            Utilisateur u = utilisateurRepository.findById(req.utilisateurId())
                    .orElseThrow(() -> new NoSuchElementException("Utilisateur not found"));
            m.setUtilisateur(u);
        }

        // رابط fournisseur (اختياري)
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
        Materiel m = materielRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Materiel not found"));

        if (req.type() != null)   m.setType(req.type());
        if (req.marque() != null) m.setMarque(req.marque());
        if (req.modele() != null) m.setModele(req.modele());
        if (req.etat() != null)   m.setEtat(req.etat());

        if (req.utilisateurId() != null) {
            Utilisateur u = utilisateurRepository.findById(req.utilisateurId())
                    .orElseThrow(() -> new NoSuchElementException("Utilisateur not found"));
            m.setUtilisateur(u);
        } else if (req.utilisateurId() == null) {
            // ما تبدّلش الربط إذا ما تبعتيش id؛ إلا بغيت تحيد الربط دير -1 ولا boolean آخر فـ DTO
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

    // ترجع 404 بدل forward لـ /error
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> notFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                java.util.Map.of("error", ex.getMessage())
        );
    }
}

