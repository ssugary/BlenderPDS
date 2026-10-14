package com.grupo03.blenderpds.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

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
}
