package org.example.parkinformatique.controllers;

import lombok.RequiredArgsConstructor;
import org.example.parkinformatique.Service.FournisseurService;
import org.example.parkinformatique.dto.FournisseurRequest;
import org.example.parkinformatique.dto.FournisseurResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/fournisseurs")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FournisseurController {

    private final FournisseurService service;

    /* CREATE */
    @PostMapping
    public ResponseEntity<FournisseurResponse> create(@RequestBody FournisseurRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    /* UPDATE */
    @PutMapping("/{id}")
    public ResponseEntity<FournisseurResponse> update(@PathVariable Long id,
                                                      @RequestBody FournisseurRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    /* GET ONE */
    @GetMapping("/{id}")
    public ResponseEntity<FournisseurResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    /* LIST
       - إذا بَعَثتي page & size → Page
       - إذا لا → List كاملة
     */
    @GetMapping
    public Object list(@RequestParam(required = false) Integer page,
                       @RequestParam(required = false) Integer size) {
        if (page != null) {
            int s = (size == null || size <= 0) ? 20 : size;
            Page<FournisseurResponse> p = service.listPage(PageRequest.of(page, s));
            return p; // front ديالك أصلاً كيتعامل مع content[]
        }
        List<FournisseurResponse> all = service.listAll();
        return all;
    }

    /* DELETE */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

