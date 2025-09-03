package org.example.parkinformatique.controllers;

import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.Service.LogicielService;
import org.example.parkinformatique.dto.LogicielRequest;
import org.example.parkinformatique.dto.LogicielResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/logiciels")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowCredentials = "true"
)
public class LogicielController {

    private final LogicielService service;

    /* ---------- CREATE / UPDATE ---------- */
    @PostMapping
    public ResponseEntity<LogicielResponse> create(@RequestBody LogicielRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LogicielResponse> update(@PathVariable Long id, @RequestBody LogicielRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    /* ---------- GET ---------- */
    // GET /api/logiciels            -> كلشي
    @GetMapping
    public List<LogicielResponse> listAll() {
        return service.listAll();
    }

    // GET /api/logiciels?id=8       -> واحد بالـid (query)
    @GetMapping(params = "id")
    public ResponseEntity<LogicielResponse> getByQuery(@RequestParam Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    // GET /api/logiciels/{id}       -> واحد بالـid (path)
    @GetMapping("/{id}")
    public ResponseEntity<LogicielResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    // GET /api/logiciels?materielId=1     -> بالـmaterielId (query)
    @GetMapping(params = "materielId")
    public List<LogicielResponse> byMaterielQuery(@RequestParam Long materielId) {
        return service.listByMateriel(materielId);
    }

    // GET /api/logiciels/materiel/1       -> بالـmaterielId (path)
    @GetMapping("/materiel/{materielId}")
    public List<LogicielResponse> byMateriel(@PathVariable Long materielId) {
        return service.listByMateriel(materielId);
    }

    /* ---------- DELETE ---------- */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
