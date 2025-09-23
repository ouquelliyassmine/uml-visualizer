package org.example.parkinformatique.controllers;

import org.example.parkinformatique.Service.AdminService;
import org.example.parkinformatique.entities.Utilisateur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;


    @GetMapping("/users")
    public List<UtilisateurDto> listUsers() {
        return adminService.getAllUsers().stream()
                .map(UtilisateurDto::fromEntity)
                .collect(Collectors.toList());
    }


    @GetMapping("/users/{id}")
    public ResponseEntity<UtilisateurDto> getUser(@PathVariable Long id) {
        return adminService.getUserById(id)
                .map(u -> ResponseEntity.ok(UtilisateurDto.fromEntity(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users")
    public Utilisateur createUser(@RequestBody Utilisateur utilisateur) {
        return adminService.createUser(utilisateur);
    }

    @PutMapping("/users/{id}")
    public Utilisateur updateUser(@PathVariable Long id, @RequestBody Utilisateur utilisateur) {
        return adminService.updateUser(id, utilisateur);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
    }



    public static class UtilisateurDto {
        public Long id;
        public String nom;
        public String prenom;
        public String email;
        public String telephone;
        public String role;

        public static UtilisateurDto fromEntity(Utilisateur u) {
            UtilisateurDto d = new UtilisateurDto();
            d.id = u.getId();
            d.nom = u.getNom();
            d.prenom = u.getPrenom();
            d.email = u.getEmail();
            d.telephone = u.getTelephone();
            d.role = u.getRole();
            return d;
        }
    }
}
