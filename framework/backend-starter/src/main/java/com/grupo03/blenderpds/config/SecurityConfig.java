package com.grupo03.blenderpds.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

/**
 * Security configuration.
 *
 * <p>It exposes the {@link PasswordEncoder} (Spring Boot does not create one by default
 * and {@code UserServiceImpl} needs it to hash the password), the
 * {@link AuthenticationManager} used by the email/password login, and the filter that
 * decides what is public. The login stores the context in the HTTP session (the
 * JSESSIONID cookie), which is what lets the browser authenticate the WebSocket
 * handshake too — the browser cannot send headers on the upgrade, but it does send
 * cookies.
 *
 * <p>The CSRF token is the one from Spring's own default
 * {@code HttpSessionCsrfTokenRepository}, handed to the SPA at
 * {@code GET /auth/csrf}. The full flow (token + session cookie) is the same as an
 * HTML form; using a separate cookie repository would only add another source of
 * divergence between the advertised header name and the name the filter actually
 * validates.
 */
@Configuration
public class SecurityConfig {

    /**
     * {@code DelegatingPasswordEncoder}: the hash stores the algorithm in the prefix
     * ({@code {bcrypt}}, {@code {argon2}}, {@code {noop}}...), which allows swapping the
     * algorithm later without invalidating old hashes.
     */
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    /**
     * Expose the AuthenticationManager: in Spring Security 7 it is no longer an
     * automatic bean. The {@link AuthenticationConfiguration} builder assembles a
     * ProviderManager with a DaoAuthenticationProvider that uses the UserDetailsService
     * from the context (UserDetailsServiceImpl).
     */
    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    /**
     * What is public is only what the user needs BEFORE having an account or a session:
     * the confirmation e-mail link, the registration, the CSRF token and the login.
     * Everything else (including {@code /ws/**}, where the CRDT operations travel)
     * still requires authentication, with CSRF and httpBasic as in Boot's default.
     *
     * <p>Registration is public because without a login nobody could create the very
     * first account — the confirmation e-mail is still what unlocks access.
     */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.GET, "/users/confirm-email").permitAll()
                    .requestMatchers(HttpMethod.POST, "/users").permitAll()
                    .requestMatchers(HttpMethod.GET, "/auth/csrf").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                    .anyRequest().authenticated())
            // CSRF stays on (Boot's default) with ONE change: the plain handler in place
            // of the Xor one. The Xor encodes the token value to mitigate BREACH, and a
            // JavaScript client cannot reproduce that encoding — with it, every SPA POST
            // would get a 403. The token still comes from GET /auth/csrf (in the body, not
            // in a cookie) and the browser sends the session cookie along, as in any HTML form.
            .csrf(csrf -> csrf.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
