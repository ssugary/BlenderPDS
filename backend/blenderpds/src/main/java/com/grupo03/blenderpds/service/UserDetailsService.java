package com.grupo03.blenderpds.service;

import org.springframework.security.core.userdetails.UserDetails;

/**
 * Interface de autenticação do domínio. Estende a
 * {@link org.springframework.security.core.userdetails.UserDetailsService} do Spring Security
 * de propósito: sem isso o Spring não encontra um UserDetailsService no contexto e o login
 * por usuário/senha falha com "No AuthenticationProvider found".
 *
 * <p>O username usado aqui é o e-mail do usuário.
 */
public interface UserDetailsService
        extends org.springframework.security.core.userdetails.UserDetailsService {

    @Override
    UserDetails loadUserByUsername(String email);
}
