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

/**
 * Configuração de segurança.
 *
 * <p>Hoje expõe o {@link PasswordEncoder} (o Spring Boot não cria um por padrão e o
 * {@code UserServiceImpl} precisa dele para gerar o hash da senha) e o {@link AuthenticationManager}
 * usado pelo fluxo de login.
 */
@Configuration
public class SecurityConfig {

    /**
     * {@code DelegatingPasswordEncoder}: o hash guarda o algoritmo no prefixo ({@code {bcrypt}},
     * {@code {argon2}}, {@code {noop}}...), permitindo trocar o algoritmo no futuro sem invalidar
     * hashes antigos.
     */
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    /**
     * Expor o AuthenticationManager: no Spring Security 7 ele não é mais bean automático.
     * O builder do {@link AuthenticationConfiguration} monta o ProviderManager com um
     * DaoAuthenticationProvider que usa o UserDetailsService do contexto (UserDetailsServiceImpl).
     */
    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    /**
     * Apenas o link de confirmação de e-mail é público: o usuário ainda está com
     * emailVerified=false e nem sessão tem. Todo o resto continua exigindo
     * autenticação (comportamento anterior — inclusive o 401 para anônimo),
     * mantendo CSRF e httpBasic como no default do Boot.
     */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.GET, "/users/confirm-email").permitAll()
                    .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
