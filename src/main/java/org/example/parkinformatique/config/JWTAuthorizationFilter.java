package org.example.parkinformatique.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.parkinformatique.entities.Utilisateur;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Optional;

public class JWTAuthorizationFilter extends OncePerRequestFilter {

    private final String secretKey;
    private final UtilisateurRepository utilisateurRepository;

    public JWTAuthorizationFilter(String secretKey, UtilisateurRepository utilisateurRepository) {
        this.secretKey = secretKey;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        System.out.println("🔍 JWTAuthorizationFilter: Vérification des cookies...");

        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            System.out.println("❌ Aucun cookie trouvé dans la requête");
            chain.doFilter(request, response);
            return;
        }

        Optional<Cookie> authTokenCookie = Arrays.stream(cookies)
                .filter(cookie -> "auth_token".equals(cookie.getName()))
                .findFirst();

        if (authTokenCookie.isPresent()) {
            String token = authTokenCookie.get().getValue();
            System.out.println("✅ Token JWT trouvé: " + token.substring(0, Math.min(token.length(), 50)) + "...");

            try {
                SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

                Claims body = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String userEmail = body.getSubject();

                System.out.println("👤 Email extrait du token: " + userEmail);

                if (userEmail != null) {
                    // Charger l'utilisateur complet depuis la base de données
                    Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(userEmail);

                    if (utilisateurOpt.isPresent()) {
                        Utilisateur utilisateur = utilisateurOpt.get();
                        System.out.println("✅ Utilisateur trouvé: " + utilisateur.getPrenom() + " " + utilisateur.getNom());

                        // Utiliser l'entité Utilisateur comme principal
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                utilisateur,  // Principal = votre entité Utilisateur
                                null,
                                utilisateur.getAuthorities()
                        );
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        System.out.println("🔐 Authentification définie avec l'entité Utilisateur");
                    } else {
                        System.out.println("❌ Utilisateur non trouvé en base: " + userEmail);
                    }
                }

            } catch (Exception e) {
                System.err.println("❌ Erreur lors de la validation du token JWT : " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("❌ Cookie auth_token non trouvé");
        }

        chain.doFilter(request, response);
    }
    }