package com.grupo03.blenderpds.service.implementation;

import com.grupo03.blenderpds.model.User;
import com.grupo03.blenderpds.repository.UserRepository;
import com.grupo03.blenderpds.service.UserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

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
                .roles(u.getRole().name())                 // gera ROLE_USER / ROLE_ADMIN
                .disabled(!u.isEmailVerified())            // bloqueia login até confirmar o e-mail
                .build();
    }
}
