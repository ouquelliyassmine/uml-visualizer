package org.example.parkinformatique.security;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;
import org.example.parkinformatique.config.JWTAuthorizationFilter;
import org.example.parkinformatique.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${application.security.jwt.secret-key}")
    private String jwtSecret;

    private final UtilisateurRepository utilisateurRepository;

    public SecurityConfig(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ـ forward و OPTIONS
                .authorizeHttpRequests(auth -> auth
                        //  SecurityFilterChain

                        .dispatcherTypeMatchers(DispatcherType.ERROR, DispatcherType.FORWARD).permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Auth مفتوح
                        .requestMatchers("/api/auth/**").permitAll()

                        // KB admin
                        .requestMatchers(HttpMethod.POST,
                                "/api/knowledge-base/seed",
                                "/api/knowledge-base/reindex"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/knowledge-base/**").permitAll()

                        // Chatbot
                        .requestMatchers("/api/chatbot/**").permitAll()


                        .requestMatchers("/api/utilisateur/**").hasAnyRole("USER","TECH") // بلا ADMIN

                        .requestMatchers("/api/tech/**").hasRole("TECH")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Materiels
                        .requestMatchers(HttpMethod.GET, "/api/materiels/**").hasAnyRole("USER","TECH","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/materiels/**").hasAnyRole("TECH","ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/materiels/**").hasAnyRole("TECH","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/materiels/**").hasRole("ADMIN")
                        // Fournisseurs
                        .requestMatchers(HttpMethod.GET, "/api/fournisseurs/**").hasAnyRole("USER","TECH","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/fournisseurs/**").hasAnyRole("TECH","ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/fournisseurs/**").hasAnyRole("TECH","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/fournisseurs/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                //
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\":\"UNAUTHORIZED\"}");
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\":\"FORBIDDEN\"}");
                        })
                )

                .addFilterBefore(new JWTAuthorizationFilter(jwtSecret, utilisateurRepository),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:3000"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setExposedHeaders(List.of("Set-Cookie"));
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}



