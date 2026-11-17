package com.grupo03.blenderpds.service.implementation;

import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.repository.UserRepository;
import com.grupo03.blenderpds.service.UserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Bridge between the domain's accounts and Spring Security.
 *
 * <p>The e-mail is the username (the same key {@code UserService.getByEmail} uses),
 * the stored hash is what the password encoder checks, and the role becomes the
 * {@code ROLE_*} authority. An account whose e-mail is not confirmed is built as
 * disabled, so the login fails even with the right password.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));

        return org.springframework.security.core.userdetails.User
                .withUsername(u.getEmail())
                .password(u.getPasswordHash())
                .roles(u.getRole().name())                 // produces ROLE_USER / ROLE_ADMIN
                .disabled(!u.isEmailVerified())            // blocks the login until the e-mail is confirmed
                .build();
    }
}
