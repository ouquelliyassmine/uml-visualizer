package org.example.parkinformatique.security;

import jakarta.servlet.http.HttpServletResponse;
import org.example.parkinformatique.dto.LoginRequest;
import org.example.parkinformatique.dto.LoginResponse;
import org.example.parkinformatique.dto.RegisterRequest;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;




    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("📥 Login request received for: " + request.getEmail());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            System.out.println("✅ Authentication succeeded!");
        } catch (Exception e) {
            System.out.println("❌ Authentication failed: " + e.getMessage());
            return ResponseEntity.status(403).body(Map.of("message", "Login failed", "error", e.getMessage()));
        }

        UserDetails user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        String token = jwtService.generateToken(user);




        ResponseCookie jwtCookie = ResponseCookie.from("auth_token", token)

                .httpOnly(true)
                .secure(false) // true en prod
                .sameSite("Lax")
                .path("/")
                .maxAge(86400)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())

                .body(Map.of("message", "Connexion réussie"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        System.out.println("📥 Register request received for: " + request.getEmail());

        if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        Utilisateur user = new Utilisateur();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setTelephone(request.getTelephone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        utilisateurRepository.save(user);
        System.out.println("✅ User registered successfully: " + request.getEmail());

        // Retour simple (pas de cookie ici, car login non automatique)
        return ResponseEntity.ok(new LoginResponse(jwtService.generateToken(user)));
    }
}
