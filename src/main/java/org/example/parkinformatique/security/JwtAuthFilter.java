package org.example.parkinformatique.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService; // Assurez-vous que JwtService est injecté
    private final UserDetailsService userDetailsService; // Pour charger les UserDetails

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 1. Tenter de récupérer le token JWT depuis le cookie "auth_token"
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    System.out.println("🍪 JWT token found in cookie: " + token);
                    break;
                }
            }
        }

        if (token == null) {
            System.out.println("❌ No JWT token found in cookie.");
            filterChain.doFilter(request, response);
            return;
        }

        String userEmail = null;

        try {
            userEmail = jwtService.extractUsername(token); // Assurez-vous que votre JwtService a cette méthode
        } catch (Exception e) {
            System.err.println("Erreur lors de l'extraction de l'email du token JWT : " + e.getMessage());
            // Le token est invalide ou expiré, ne pas continuer l'authentification avec ce token
        }

        // 2. Si l'email est trouvé et qu'il n'y a pas déjà d'authentification dans le contexte
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 3. Valider le token
            if (jwtService.isTokenValid(token, userDetails)) { // Assurez-vous que votre JwtService a cette méthode
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                // 4. Mettre à jour le contexte de sécurité
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("✅ Utilisateur authentifié via JWT : " + userEmail);
            } else {
                System.out.println("❌ Token JWT invalide pour l'utilisateur : " + userEmail);
            }
        }

        filterChain.doFilter(request, response);
    }
}

