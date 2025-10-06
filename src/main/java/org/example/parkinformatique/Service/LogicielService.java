package org.example.parkinformatique.Service;

import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.dto.LogicielRequest;
import org.example.parkinformatique.dto.LogicielResponse;
import org.example.parkinformatique.entities.Logiciel;
import org.example.parkinformatique.entities.Materiel;
import org.example.parkinformatique.repositories.LogicielRepository;
import org.example.parkinformatique.repositories.MaterielRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogicielService {

    private final LogicielRepository repo;
    private final MaterielRepository materielRepo;

    /* ------------ CREATE / UPDATE ------------ */
    @Transactional
    public LogicielResponse create(LogicielRequest req) {
        Logiciel l = new Logiciel();
        apply(l, req);
        return toDto(repo.save(l));
    }

    @Transactional
    public LogicielResponse update(Long id, LogicielRequest req) {
        Logiciel l = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Logiciel introuvable"));
        apply(l, req);
        return toDto(repo.save(l));
    }

    /* ------------ GET ------------ */
    @Transactional(readOnly = true)
    public LogicielResponse get(Long id) {
        Logiciel l = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Logiciel introuvable"));
        return toDto(l);
    }

    @Transactional(readOnly = true)
    public List<LogicielResponse> listAll() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<LogicielResponse> listByMateriel(Long materielId) {
        return repo.findByMaterielId(materielId).stream().map(this::toDto).toList();
    }

    /* ------------ DELETE ------------ */
    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Logiciel introuvable");
        repo.deleteById(id);
    }

    /* ------------ Helpers ------------ */
    private void apply(Logiciel l, LogicielRequest req) {
        l.setNom(req.getNom());
        l.setVersion(emptyToNull(req.getVersion()));
        l.setEditeur(emptyToNull(req.getEditeur()));
        l.setLicence(emptyToNull(req.getLicence()));
        l.setDateExpiration(req.getDateExpiration()); // LocalDate

        if (req.getMaterielId() != null) {
            Materiel m = materielRepo.findById(req.getMaterielId())
                    .orElseThrow(() -> new IllegalArgumentException("Matériel introuvable"));
            l.setMateriel(m);
        } else {
            l.setMateriel(null);
        }
    }

    private LogicielResponse toDto(Logiciel l) {
        LogicielResponse dto = new LogicielResponse();
        dto.setId(l.getId());
        dto.setNom(l.getNom());
        dto.setVersion(l.getVersion());
        dto.setEditeur(l.getEditeur());
        dto.setLicence(l.getLicence());
        dto.setDateExpiration(l.getDateExpiration() != null ? l.getDateExpiration().toString() : null);
        if (l.getMateriel() != null) {
            dto.setMaterielId(l.getMateriel().getId());
            dto.setMaterielNom(String.format("%s — %s (%s)",
                    orDash(l.getMateriel().getType()),
                    orDash(l.getMateriel().getModele()),
                    orDash(l.getMateriel().getMarque())));
        }
        return dto;
    }

    private String emptyToNull(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
    private String orDash(String s) { return (s == null || s.isBlank()) ? "—" : s; }
}

