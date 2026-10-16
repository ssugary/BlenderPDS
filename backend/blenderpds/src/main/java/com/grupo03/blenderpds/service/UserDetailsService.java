package com.grupo03.blenderpds.service;

import org.springframework.security.core.userdetails.UserDetails;

/**
 * Domain authentication interface. It extends Spring Security's
 * {@link org.springframework.security.core.userdetails.UserDetailsService} on purpose:
 * without it Spring finds no UserDetailsService in the context and the user/password
 * login fails with "No AuthenticationProvider found".
 *
 * <p>The username used here is the user's e-mail.
 */
public interface UserDetailsService
        extends org.springframework.security.core.userdetails.UserDetailsService {

    @Override
    UserDetails loadUserByUsername(String email);
}
