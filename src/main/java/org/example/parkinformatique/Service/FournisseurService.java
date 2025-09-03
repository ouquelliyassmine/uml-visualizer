package org.example.parkinformatique.Service;

import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.dto.FournisseurRequest;
import org.example.parkinformatique.dto.FournisseurResponse;
import org.example.parkinformatique.entities.Fournisseur;
import org.example.parkinformatique.repositories.FournisseurRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FournisseurService {

    private final FournisseurRepository repo;

    /* -------- CREATE -------- */
    @Transactional
    public FournisseurResponse create(FournisseurRequest req) {
        Fournisseur f = new Fournisseur();
        apply(f, req);
        // مثال بسيط على تفادي التكرار بالاسم (اختياري)
        if (f.getNom() != null && repo.existsByNomIgnoreCase(f.getNom())) {
            throw new IllegalArgumentException("Fournisseur existe déjà avec ce nom.");
        }
        f = repo.save(f);
        return toDto(f);
    }

    /* -------- UPDATE -------- */
    @Transactional
    public FournisseurResponse update(Long id, FournisseurRequest req) {
        Fournisseur f = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fournisseur introuvable"));
        apply(f, req);
        f = repo.save(f);
        return toDto(f);
    }

    /* -------- GET -------- */
    @Transactional(readOnly = true)
    public FournisseurResponse get(Long id) {
        Fournisseur f = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fournisseur introuvable"));
        return toDto(f);
    }

    @Transactional(readOnly = true)
    public List<FournisseurResponse> listAll() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Page<FournisseurResponse> listPage(Pageable pageable) {
        return repo.findAll(pageable).map(this::toDto);
    }

    /* -------- DELETE -------- */
    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Fournisseur introuvable");
        }
        try {
            repo.deleteById(id);
        } catch (DataIntegrityViolationException ex) {
            // مثلا إلا كان مربوط بعقود/فواتير…
            throw new IllegalStateException("Suppression impossible: fournisseur référencé.", ex);
        }
    }

    /* -------- Helpers -------- */
    private void apply(Fournisseur f, FournisseurRequest req) {
        f.setNom(nullIfBlank(req.getNom()));
        f.setAdresse(nullIfBlank(req.getAdresse()));
        f.setTelephone(nullIfBlank(req.getTelephone()));
        f.setEmail(nullIfBlank(req.getEmail()));
    }

    private FournisseurResponse toDto(Fournisseur f) {
        FournisseurResponse dto = new FournisseurResponse();
        dto.setId(f.getId());
        dto.setNom(f.getNom());
        dto.setAdresse(f.getAdresse());
        dto.setTelephone(f.getTelephone());
        dto.setEmail(f.getEmail());
        return dto;
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}

